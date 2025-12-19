'use client';

import { ReactNode, useEffect, useState } from 'react';
import { LiffProvider, useLiffContext } from '@/components/liff/LiffProvider';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldX, Loader2 } from 'lucide-react';

function AdminGuard({ children }: { children: ReactNode }) {
  const liff = useLiffContext();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!liff.user?.userId) return;

      try {
        const response = await fetch('/api/auth/check', {
          headers: {
            'x-line-userid': liff.user.userId,
          },
        });
        const result = await response.json();
        setIsAdmin(result.isAdmin);
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    // For development, skip admin check if no API
    if (process.env.NODE_ENV === 'development') {
      setIsAdmin(true);
      setIsChecking(false);
    } else {
      checkAdmin();
    }
  }, [liff.user?.userId]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-sm bg-slate-800 border-slate-700">
          <CardContent className="pt-6 space-y-4 text-center">
            <Loader2 className="w-12 h-12 text-emerald-500 mx-auto animate-spin" />
            <p className="text-slate-400">กำลังตรวจสอบสิทธิ์...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-sm bg-slate-800 border-red-800">
          <CardHeader>
            <CardTitle className="text-red-500 text-center flex items-center justify-center gap-2">
              <ShieldX className="w-6 h-6" />
              ไม่มีสิทธิ์เข้าถึง
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-400">
              คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
              <br />กรุณาติดต่อผู้ดูแลระบบ
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID_ADMIN;

  return (
    <LiffProvider liffId={liffId} requireLogin={true}>
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {children}
        </div>
      </AdminGuard>
      <Toaster position="top-center" richColors />
    </LiffProvider>
  );
}

