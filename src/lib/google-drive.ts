/**
 * Google Drive API Wrapper
 * Handles file uploads and folder management for documents and slips
 */

import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

// Initialize Google Drive API client
function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !privateKey) {
    throw new Error('Google Service Account credentials not configured');
  }

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

function getDriveClient(): drive_v3.Drive {
  const auth = getAuthClient();
  return google.drive({ version: 'v3', auth });
}

function getRootFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!id) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID not configured');
  }
  return id;
}

// ==========================================
// Folder Operations
// ==========================================

/**
 * Create a folder in Google Drive
 */
export async function createFolder(name: string, parentId?: string): Promise<string> {
  const drive = getDriveClient();
  
  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId || getRootFolderId()],
    },
    fields: 'id',
  });

  if (!response.data.id) {
    throw new Error('Failed to create folder');
  }

  return response.data.id;
}

/**
 * Get or create a folder by path (e.g., "Applications/2024-12")
 */
export async function getOrCreateFolderByPath(path: string): Promise<string> {
  const parts = path.split('/').filter(p => p);
  let parentId = getRootFolderId();

  for (const part of parts) {
    const existingFolder = await findFolderByName(part, parentId);
    if (existingFolder) {
      parentId = existingFolder;
    } else {
      parentId = await createFolder(part, parentId);
    }
  }

  return parentId;
}

/**
 * Find a folder by name within a parent folder
 */
export async function findFolderByName(name: string, parentId?: string): Promise<string | null> {
  const drive = getDriveClient();
  
  const query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId || getRootFolderId()}' in parents and trashed = false`;
  
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const files = response.data.files;
  if (files && files.length > 0 && files[0].id) {
    return files[0].id;
  }

  return null;
}

// ==========================================
// File Operations
// ==========================================

export interface UploadResult {
  fileId: string;
  fileName: string;
  fileUrl: string;
  webViewLink: string;
}

/**
 * Upload a file to Google Drive
 */
export async function uploadFile(
  fileName: string,
  mimeType: string,
  content: Buffer | string,
  folderId?: string
): Promise<UploadResult> {
  const drive = getDriveClient();
  
  // Convert content to readable stream
  const buffer = typeof content === 'string' ? Buffer.from(content, 'base64') : content;
  const stream = Readable.from(buffer);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId || getRootFolderId()],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, name, webViewLink, webContentLink',
  });

  if (!response.data.id) {
    throw new Error('Failed to upload file');
  }

  // Make the file publicly accessible
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    fileId: response.data.id,
    fileName: response.data.name || fileName,
    fileUrl: `https://drive.google.com/uc?id=${response.data.id}`,
    webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
  };
}

/**
 * Upload a file from base64 string
 */
export async function uploadBase64File(
  fileName: string,
  base64Data: string,
  mimeType: string,
  folderId?: string
): Promise<UploadResult> {
  // Remove data URL prefix if present
  const base64Content = base64Data.replace(/^data:[^;]+;base64,/, '');
  return uploadFile(fileName, mimeType, base64Content, folderId);
}

/**
 * Upload an application's documents to a dedicated folder
 */
export async function uploadApplicationDocuments(
  applicationId: string,
  customerName: string,
  documents: Array<{
    type: string;
    fileName: string;
    base64Data: string;
    mimeType: string;
  }>
): Promise<{
  folderId: string;
  files: Array<{
    type: string;
    fileId: string;
    fileName: string;
    fileUrl: string;
  }>;
}> {
  // Create folder path: Applications/YYYY-MM/APP001_CustomerName_YYYYMMDD
  const now = new Date();
  const monthFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const folderName = `${applicationId}_${customerName.replace(/\s+/g, '_')}_${dateStr}`;
  
  // Get or create the parent folder path
  const monthFolderId = await getOrCreateFolderByPath(`Applications/${monthFolder}`);
  const appFolderId = await createFolder(folderName, monthFolderId);

  // Upload all documents
  const uploadedFiles = await Promise.all(
    documents.map(async (doc) => {
      const result = await uploadBase64File(doc.fileName, doc.base64Data, doc.mimeType, appFolderId);
      return {
        type: doc.type,
        fileId: result.fileId,
        fileName: result.fileName,
        fileUrl: result.fileUrl,
      };
    })
  );

  return {
    folderId: appFolderId,
    files: uploadedFiles,
  };
}

/**
 * Upload a payment slip to a contract's folder
 */
export async function uploadPaymentSlip(
  contractId: string,
  fileName: string,
  base64Data: string,
  mimeType: string
): Promise<UploadResult> {
  // Get or create the contract's payment slips folder
  const folderId = await getOrCreateFolderByPath(`Payment_Slips/${contractId}`);
  return uploadBase64File(fileName, base64Data, mimeType, folderId);
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<{
  name: string;
  mimeType: string;
  size: string;
  webViewLink: string;
} | null> {
  const drive = getDriveClient();
  
  try {
    const response = await drive.files.get({
      fileId,
      fields: 'name, mimeType, size, webViewLink',
    });

    return {
      name: response.data.name || '',
      mimeType: response.data.mimeType || '',
      size: response.data.size || '0',
      webViewLink: response.data.webViewLink || '',
    };
  } catch {
    return null;
  }
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  const drive = getDriveClient();
  
  try {
    await drive.files.delete({ fileId });
    return true;
  } catch {
    return false;
  }
}

/**
 * List files in a folder
 */
export async function listFilesInFolder(folderId: string): Promise<Array<{
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}>> {
  const drive = getDriveClient();
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webViewLink)',
    orderBy: 'createdTime desc',
  });

  return (response.data.files || []).map(file => ({
    id: file.id || '',
    name: file.name || '',
    mimeType: file.mimeType || '',
    webViewLink: file.webViewLink || '',
  }));
}

