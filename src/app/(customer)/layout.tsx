'use client';

import { ReactNode } from 'react';
import { LiffProvider } from '@/components/liff/LiffProvider';
import { Toaster } from '@/components/ui/sonner';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER;

  return (
    <LiffProvider liffId={liffId} requireLogin={true}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {children}
      </div>
      <Toaster position="top-center" richColors />
    </LiffProvider>
  );
}

