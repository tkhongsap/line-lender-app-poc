'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useLiff, UseLiffReturn } from '@/hooks/useLiff';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LiffContext = createContext<UseLiffReturn | null>(null);

export interface LiffProviderProps {
  children: ReactNode;
  liffId?: string;
  requireLogin?: boolean;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
}

/**
 * LIFF Provider component
 * Wraps children with LIFF context and handles loading/error states
 */
export function LiffProvider({
  children,
  liffId,
  requireLogin = true,
  loadingComponent,
  errorComponent,
}: LiffProviderProps) {
  const liff = useLiff(liffId);

  // Loading state
  if (liff.isLoading) {
    return (
      loadingComponent || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Error state
  if (liff.error) {
    return (
      errorComponent || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <Card className="w-full max-w-sm border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 text-center">เกิดข้อผิดพลาด</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-gray-600">
                {liff.error.message || 'ไม่สามารถเชื่อมต่อกับ LINE ได้'}
              </p>
              <Button
                onClick={() => liff.reload()}
                variant="outline"
                className="w-full"
              >
                ลองใหม่
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Not logged in and login required
  if (requireLogin && !liff.isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">เข้าสู่ระบบ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              กรุณาเข้าสู่ระบบด้วย LINE เพื่อใช้งาน
            </p>
            <Button
              onClick={() => liff.login()}
              className="w-full bg-[#00C300] hover:bg-[#00B300]"
            >
              เข้าสู่ระบบด้วย LINE
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <LiffContext.Provider value={liff}>
      {children}
    </LiffContext.Provider>
  );
}

/**
 * Hook to access LIFF context
 */
export function useLiffContext(): UseLiffReturn {
  const context = useContext(LiffContext);
  if (!context) {
    throw new Error('useLiffContext must be used within a LiffProvider');
  }
  return context;
}

export default LiffProvider;

