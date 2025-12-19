/**
 * Slip2Go API Integration
 * OCR for payment slips
 */

import type { SlipVerificationResult, PaymentSchedule } from '@/types';

const SLIP2GO_API_URL = 'https://api.slip2go.com/v1/verify';

/**
 * Verify a payment slip using Slip2Go API
 */
export async function verifySlip(imageBase64: string): Promise<SlipVerificationResult> {
  const apiKey = process.env.SLIP2GO_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Slip2Go API key not configured',
    };
  }

  try {
    // Remove data URL prefix if present
    const base64Content = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const response = await fetch(SLIP2GO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        image: base64Content,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Slip2Go API error:', error);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Parse Slip2Go response
    if (data.success && data.data) {
      return {
        success: true,
        data: {
          amount: parseFloat(data.data.amount) || 0,
          date: data.data.date || new Date().toISOString().split('T')[0],
          bank: data.data.sendingBank || data.data.receivingBank || 'Unknown',
          transactionId: data.data.transRef || data.data.ref || '',
        },
      };
    }

    return {
      success: false,
      error: data.message || 'Failed to verify slip',
    };

  } catch (error) {
    console.error('Slip verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Match slip data to a payment schedule
 * Returns the matching schedule ID or null if no match found
 * Tolerance: ±100 THB
 */
export function matchSlipToSchedule(
  slipAmount: number,
  schedules: PaymentSchedule[]
): PaymentSchedule | null {
  const TOLERANCE = 100; // ±100 THB

  // Filter to unpaid schedules
  const unpaidSchedules = schedules.filter(s => s.status !== 'PAID');

  if (unpaidSchedules.length === 0) {
    return null;
  }

  // Sort by due date (oldest first)
  unpaidSchedules.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // Find exact or close matches
  const matches = unpaidSchedules.filter(s => {
    const diff = Math.abs(s.totalAmount - slipAmount);
    return diff <= TOLERANCE;
  });

  // Return the oldest matching schedule
  if (matches.length === 1) {
    return matches[0];
  }

  // If multiple matches, return the one with the closest amount
  if (matches.length > 1) {
    matches.sort((a, b) => 
      Math.abs(a.totalAmount - slipAmount) - Math.abs(b.totalAmount - slipAmount)
    );
    return matches[0];
  }

  // No exact match, try to find a schedule where slip covers partial payment
  // This is for cases where customer pays less than the full amount
  if (slipAmount > 0) {
    // Return the oldest unpaid schedule for manual verification
    return null; // Return null to trigger manual review
  }

  return null;
}

/**
 * Auto-verify payment slip
 * Returns verification result and matched schedule
 */
export async function autoVerifySlip(
  imageBase64: string,
  schedules: PaymentSchedule[]
): Promise<{
  verified: boolean;
  slipData: SlipVerificationResult['data'] | null;
  matchedSchedule: PaymentSchedule | null;
  message: string;
}> {
  // Verify slip using OCR
  const verificationResult = await verifySlip(imageBase64);

  if (!verificationResult.success || !verificationResult.data) {
    return {
      verified: false,
      slipData: null,
      matchedSchedule: null,
      message: verificationResult.error || 'Failed to verify slip',
    };
  }

  const slipData = verificationResult.data;

  // Try to match to a schedule
  const matchedSchedule = matchSlipToSchedule(slipData.amount, schedules);

  if (matchedSchedule) {
    return {
      verified: true,
      slipData,
      matchedSchedule,
      message: `Slip verified and matched to installment ${matchedSchedule.installmentNumber}`,
    };
  }

  // No auto-match, needs manual review
  return {
    verified: true,
    slipData,
    matchedSchedule: null,
    message: 'Slip verified but could not auto-match. Manual review required.',
  };
}

/**
 * Validate slip image
 * Check if image is valid before sending to API
 */
export function validateSlipImage(base64Data: string, mimeType: string): {
  valid: boolean;
  error?: string;
} {
  // Check mime type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: 'Invalid image type. Only JPEG and PNG are supported.',
    };
  }

  // Check file size (max 5MB)
  const base64Content = base64Data.replace(/^data:[^;]+;base64,/, '');
  const sizeInBytes = Math.ceil((base64Content.length * 3) / 4);
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (sizeInBytes > maxSize) {
    return {
      valid: false,
      error: 'Image too large. Maximum size is 5MB.',
    };
  }

  return { valid: true };
}

