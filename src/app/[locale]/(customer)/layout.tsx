'use client';

import { ReactNode } from 'react';
import { LiffProvider } from '@/components/liff/LiffProvider';
import { Toaster } from '@/components/ui/sonner';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { CreditCard, Home, FileText, DollarSign, Camera } from 'lucide-react';
import { LocaleSwitcherMinimal } from '@/components/LocaleSwitcher';

function CustomerNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('navigation.customer');

  const navItems = [
    { href: '/' as const, icon: Home, label: 'หน้าหลัก' },
    { href: '/apply' as const, icon: CreditCard, label: t('apply') },
    { href: '/status' as const, icon: FileText, label: t('status') },
    { href: '/payment' as const, icon: DollarSign, label: t('payment') },
    { href: '/slip' as const, icon: Camera, label: t('slip') },
  ];

  return (
    <div className="min-h-screen bg-secondary/50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">LINE Lender</span>
          </Link>
          <LocaleSwitcherMinimal />
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation - LINE app style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID_CUSTOMER;

  return (
    <LiffProvider liffId={liffId} requireLogin={true}>
      <CustomerNavigation>
        {children}
      </CustomerNavigation>
      <Toaster position="top-center" richColors />
    </LiffProvider>
  );
}
