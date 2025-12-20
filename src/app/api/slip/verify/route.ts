/**
 * Slip Verification API
 * POST: Verify payment slip using OCR
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { autoVerifySlip, validateSlipImage } from '@/lib/slip2go';
import { getPaymentSchedules, getContractById } from '@/lib/google-sheets';
import { createAuthContext, requireAuth, requireOwnResource } from '@/lib/auth';

// Validation schema
const verifySlipSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  image: z.object({
    base64Data: z.string().min(1),
    mimeType: z.string().min(1),
  }),
});

/**
 * POST /api/slip/verify
 * Verify payment slip using Slip2Go OCR
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = verifySlipSchema.safeParse(body);
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

    // Get auth context
    const lineUserId = request.headers.get('x-line-userid');
    const authContext = await createAuthContext(lineUserId);
    requireAuth(authContext);

    const { contractId, image } = validationResult.data;

    // Get contract
    const contract = await getContractById(contractId);
    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Verify access
    if (!authContext.isAdmin) {
      requireOwnResource(authContext, contract.lineUserId);
    }

    // Validate image
    const imageValidation = validateSlipImage(image.base64Data, image.mimeType);
    if (!imageValidation.valid) {
      return NextResponse.json(
        { success: false, error: imageValidation.error },
        { status: 400 }
      );
    }

    // Get payment schedules for matching
    const schedules = await getPaymentSchedules(contractId);

    // Verify and match slip
    const result = await autoVerifySlip(image.base64Data, schedules);

    return NextResponse.json({
      success: result.verified,
      data: {
        slipData: result.slipData,
        matchedSchedule: result.matchedSchedule,
        autoMatched: result.matchedSchedule !== null,
      },
      message: result.message,
    });

  } catch (error) {
    console.error('Slip verification error:', error);

    if (error instanceof Error && error.message === 'Access denied') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to verify slip' },
      { status: 500 }
    );
  }
}

