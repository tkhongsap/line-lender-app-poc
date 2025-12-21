/**
 * Settings API Routes
 * GET: Get all settings
 * PUT: Update settings (Super Admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/google-sheets';
import { getSession } from '@/lib/web-auth';

/**
 * GET /api/settings
 * Get all system settings
 */
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await getSettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update settings (Super Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Super Admin required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Convert all values to strings for storage
    const updates: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      updates[key] = String(value);
    }

    await updateSettings(updates);

    // Return updated settings
    const newSettings = await getSettings();

    return NextResponse.json({
      success: true,
      data: newSettings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

