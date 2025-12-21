/**
 * Applications API Routes
 * GET: List applications
 * POST: Create new application
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getApplications,
  createApplication,
} from '@/lib/google-sheets';
import { uploadApplicationDocuments } from '@/lib/google-drive';
import { notifyNewApplication } from '@/lib/line';
import { createAuthContext, requireAuth, getAdminUsers } from '@/lib/auth';
import { getWebAdminAuthContext } from '@/lib/web-auth';
import type { ApplicationFormData, ApplicationStatus, LoanPurpose, CollateralType } from '@/types';

// Validation schema for new application
const createApplicationSchema = z.object({
  lineUserId: z.string().min(1, 'LINE User ID is required'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  nationalId: z.string().regex(/^\d{13}$/, 'National ID must be 13 digits'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  email: z.string().email().optional().or(z.literal('')),
  requestedAmount: z.number().min(10000, 'Minimum amount is 10,000').max(1000000, 'Maximum amount is 1,000,000'),
  purpose: z.enum(['BUSINESS', 'PERSONAL', 'EDUCATION', 'MEDICAL', 'OTHER'] as const),
  purposeDetail: z.string().optional(),
  collateralType: z.enum(['LAND', 'HOUSE', 'CONDO', 'CAR', 'GOLD', 'OTHER'] as const),
  collateralValue: z.number().min(1, 'Collateral value is required'),
  collateralAddress: z.string().min(1, 'Collateral address is required'),
  collateralDescription: z.string().optional(),
  documents: z.array(z.object({
    type: z.string(),
    fileName: z.string(),
    base64Data: z.string(),
    mimeType: z.string(),
  })).optional(),
});

/**
 * GET /api/applications
 * List applications with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ApplicationStatus | null;
    const lineUserId = searchParams.get('lineUserId');

    const authLineUserId = request.headers.get('x-line-userid');
    let authContext = await createAuthContext(authLineUserId);
    
    if (!authContext.isAuthenticated || authLineUserId === 'web-admin') {
      const webAdminContext = await getWebAdminAuthContext();
      if (webAdminContext.isAuthenticated) {
        authContext = {
          user: null,
          isAuthenticated: true,
          isAdmin: webAdminContext.isAdmin,
          permissions: [],
        };
      }
    }

    const filters: { status?: ApplicationStatus; lineUserId?: string } = {};

    if (status) {
      filters.status = status;
    }

    if (!authContext.isAdmin && authContext.user) {
      filters.lineUserId = authContext.user.lineUserId;
    } else if (lineUserId) {
      filters.lineUserId = lineUserId;
    }

    const applications = await getApplications(filters);

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * Create new loan application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = createApplicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Upload documents if provided
    let documentFolderId: string | undefined;
    let documentInfos: { type: string; fileId: string; fileName: string; fileUrl: string }[] = [];

    if (data.documents && data.documents.length > 0) {
      const uploadResult = await uploadApplicationDocuments(
        'TEMP', // Will be replaced with actual ID
        data.fullName,
        data.documents
      );
      documentFolderId = uploadResult.folderId;
      documentInfos = uploadResult.files;
    }

    // Create application
    const application = await createApplication({
      lineUserId: data.lineUserId,
      fullName: data.fullName,
      nationalId: data.nationalId,
      phone: data.phone,
      email: data.email || undefined,
      requestedAmount: data.requestedAmount,
      purpose: data.purpose as LoanPurpose,
      purposeDetail: data.purposeDetail,
      collateralType: data.collateralType as CollateralType,
      collateralValue: data.collateralValue,
      collateralAddress: data.collateralAddress,
      collateralDescription: data.collateralDescription,
      documentFolderId,
      documents: documentInfos.map(d => ({
        type: d.type as 'ID_CARD' | 'HOUSE_REGISTRATION' | 'COLLATERAL_DOC' | 'COLLATERAL_PHOTO' | 'OTHER',
        fileId: d.fileId,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        uploadedAt: new Date().toISOString(),
      })),
      status: 'SUBMITTED',
    });

    // Notify all admin users about new application
    const adminUsers = await getAdminUsers();
    const liffUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/applications/${application.id}`;

    const collateralTypeLabels: Record<string, string> = {
      LAND: 'ที่ดิน',
      HOUSE: 'บ้าน',
      CONDO: 'คอนโด',
      CAR: 'รถยนต์',
      GOLD: 'ทองคำ',
      OTHER: 'อื่นๆ',
    };

    for (const admin of adminUsers) {
      await notifyNewApplication(admin.lineUserId, {
        applicationId: application.id,
        customerName: application.fullName,
        requestedAmount: application.requestedAmount,
        collateralType: collateralTypeLabels[application.collateralType] || application.collateralType,
        createdAt: application.createdAt,
        liffUrl,
      });
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Application submitted successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

