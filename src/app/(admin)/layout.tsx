'use client';

import { ReactNode, useEffect, useState } from 'react';
import { LiffProvider, useLiffContext } from '@/components/liff/LiffProvider';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Loader2, CreditCard, LayoutDashboard, FileText, Users, DollarSign, BarChart3, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
        <Card className="w-full max-w-sm bg-sidebar-accent border-sidebar-border">
          <CardContent className="pt-6 space-y-4 text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <p className="text-sidebar-foreground/70">กำลังตรวจสอบสิทธิ์...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
        <Card className="w-full max-w-sm bg-sidebar-accent border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive text-center flex items-center justify-center gap-2">
              <ShieldX className="w-6 h-6" />
              ไม่มีสิทธิ์เข้าถึง
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sidebar-foreground/70">
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

function AdminNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'แดชบอร์ด' },
    { href: '/applications', icon: FileText, label: 'คำขอสินเชื่อ' },
    { href: '/applications/pending', icon: Users, label: 'รออนุมัติ' },
  ];

  return (
    <div className="min-h-screen bg-sidebar">
      {/* Top Header Bar - LINE Developers Console style */}
      <header className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-sidebar-foreground">LINE Lender</span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
              Admin Console
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${
                      isActive
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-sidebar-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sidebar-border bg-sidebar p-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 ${
                        isActive
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID_ADMIN;

  return (
    <LiffProvider liffId={liffId} requireLogin={true}>
      <AdminGuard>
        <AdminNavigation>
          {children}
        </AdminNavigation>
      </AdminGuard>
      <Toaster position="top-center" richColors />
    </LiffProvider>
  );
}
