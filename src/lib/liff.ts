/**
 * LIFF (LINE Front-end Framework) Utilities
 * Client-side utilities for LIFF initialization and user management
 */

'use client';

import liff from '@line/liff';

// LIFF initialization state
let isInitialized = false;
let initPromise: Promise<void> | null = null;

export interface LiffUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LiffContext {
  type: 'utou' | 'room' | 'group' | 'none' | 'square_chat' | 'external';
  viewType: 'full' | 'tall' | 'compact';
  userId?: string;
  utouId?: string;
  roomId?: string;
  groupId?: string;
}

/**
 * Initialize LIFF
 * @param liffId - LIFF ID (customer or admin)
 */
export async function initializeLiff(liffId?: string): Promise<void> {
  if (isInitialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  const id = liffId || process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER;
  
  if (!id) {
    throw new Error('LIFF ID not configured');
  }

  initPromise = liff.init({ liffId: id }).then(() => {
    isInitialized = true;
  });

  return initPromise;
}

/**
 * Check if LIFF is initialized
 */
export function isLiffInitialized(): boolean {
  return isInitialized;
}

/**
 * Check if running in LINE app
 */
export function isInLineApp(): boolean {
  if (!isInitialized) return false;
  return liff.isInClient();
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  if (!isInitialized) return false;
  return liff.isLoggedIn();
}

/**
 * Login via LINE
 * @param redirectUri - URL to redirect after login
 */
export function login(redirectUri?: string): void {
  if (!isInitialized) {
    throw new Error('LIFF not initialized');
  }

  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri });
  }
}

/**
 * Logout
 */
export function logout(): void {
  if (!isInitialized) return;
  
  if (liff.isLoggedIn()) {
    liff.logout();
    window.location.reload();
  }
}

/**
 * Get LIFF access token
 */
export function getAccessToken(): string | null {
  if (!isInitialized || !liff.isLoggedIn()) return null;
  return liff.getAccessToken();
}

/**
 * Get LINE user profile
 */
export async function getProfile(): Promise<LiffUser | null> {
  if (!isInitialized) {
    throw new Error('LIFF not initialized');
  }

  if (!liff.isLoggedIn()) {
    return null;
  }

  try {
    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    };
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

/**
 * Get LIFF context (where the LIFF app was opened from)
 */
export function getContext(): LiffContext | null {
  if (!isInitialized) return null;
  
  const context = liff.getContext();
  if (!context) return null;

  return {
    type: context.type,
    viewType: context.viewType as LiffContext['viewType'],
    userId: context.userId,
    utouId: context.utouId,
    roomId: context.roomId,
    groupId: context.groupId,
  };
}

/**
 * Get LINE User ID
 * Returns null if not in LINE app or not logged in
 */
export async function getLineUserId(): Promise<string | null> {
  if (!isInitialized) {
    throw new Error('LIFF not initialized');
  }

  // First try to get from context (when in LINE app)
  const context = getContext();
  if (context?.userId) {
    return context.userId;
  }

  // Fallback to profile
  const profile = await getProfile();
  return profile?.userId || null;
}

/**
 * Send message to chat
 * Only works when LIFF is opened from a chat
 */
export async function sendMessages(messages: { type: 'text'; text: string }[]): Promise<boolean> {
  if (!isInitialized) {
    throw new Error('LIFF not initialized');
  }

  if (!liff.isInClient()) {
    console.warn('sendMessages only works in LINE app');
    return false;
  }

  try {
    await liff.sendMessages(messages);
    return true;
  } catch (error) {
    console.error('Failed to send messages:', error);
    return false;
  }
}

/**
 * Share target picker - share content to friends/groups
 */
export async function shareTargetPicker(messages: { type: 'text'; text: string }[]): Promise<boolean> {
  if (!isInitialized) {
    throw new Error('LIFF not initialized');
  }

  if (!liff.isApiAvailable('shareTargetPicker')) {
    console.warn('shareTargetPicker not available');
    return false;
  }

  try {
    const result = await liff.shareTargetPicker(messages);
    return result !== undefined;
  } catch (error) {
    console.error('Failed to share:', error);
    return false;
  }
}

/**
 * Close LIFF window
 */
export function closeWindow(): void {
  if (!isInitialized) return;
  
  if (liff.isInClient()) {
    liff.closeWindow();
  } else {
    window.close();
  }
}

/**
 * Open external URL
 * @param url - URL to open
 * @param external - Open in external browser (default: false)
 */
export function openWindow(url: string, external = false): void {
  if (!isInitialized) {
    window.open(url, '_blank');
    return;
  }

  liff.openWindow({
    url,
    external,
  });
}

/**
 * Scan QR code
 * Returns the scanned string or null if cancelled
 */
export async function scanCode(): Promise<string | null> {
  if (!isInitialized) {
    throw new Error('LIFF not initialized');
  }

  if (!liff.isApiAvailable('scanCodeV2')) {
    console.warn('scanCode not available');
    return null;
  }

  try {
    const result = await liff.scanCodeV2();
    return result.value || null;
  } catch (error) {
    console.error('Failed to scan code:', error);
    return null;
  }
}

/**
 * Get OS type
 */
export function getOS(): 'ios' | 'android' | 'web' {
  if (!isInitialized) return 'web';
  return liff.getOS() as 'ios' | 'android' | 'web';
}

/**
 * Get LIFF language
 */
export function getLanguage(): string {
  if (!isInitialized) return 'en';
  return liff.getLanguage();
}

/**
 * Get LIFF version
 */
export function getVersion(): string {
  if (!isInitialized) return '';
  return liff.getVersion();
}

/**
 * Check if a specific API is available
 */
export function isApiAvailable(api: string): boolean {
  if (!isInitialized) return false;
  return liff.isApiAvailable(api);
}

// ==========================================
// Custom Hooks Helpers
// ==========================================

/**
 * LIFF state for React hooks
 */
export interface LiffState {
  isInitialized: boolean;
  isLoggedIn: boolean;
  isInClient: boolean;
  user: LiffUser | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Get initial LIFF state
 */
export function getInitialLiffState(): LiffState {
  return {
    isInitialized: false,
    isLoggedIn: false,
    isInClient: false,
    user: null,
    error: null,
    isLoading: true,
  };
}

/**
 * Initialize LIFF and get full state
 */
export async function initializeLiffWithState(liffId?: string): Promise<LiffState> {
  try {
    await initializeLiff(liffId);
    
    const isLoggedInResult = isLoggedIn();
    let user: LiffUser | null = null;
    
    if (isLoggedInResult) {
      user = await getProfile();
    }

    return {
      isInitialized: true,
      isLoggedIn: isLoggedInResult,
      isInClient: isInLineApp(),
      user,
      error: null,
      isLoading: false,
    };
  } catch (error) {
    return {
      isInitialized: false,
      isLoggedIn: false,
      isInClient: false,
      user: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
      isLoading: false,
    };
  }
}

