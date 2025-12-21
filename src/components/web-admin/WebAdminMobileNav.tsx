'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Menu, CreditCard } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';
import { WebAdminSidebarNav } from './WebAdminSidebarNav';
import { WebAdminSidebarFooter } from './WebAdminSidebarFooter';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcherMinimal } from '@/components/LocaleSwitcher';

export function WebAdminMobileNav() {
  const { isMobile, isMobileOpen, setMobileOpen } = useSidebar();

  // Don't render mobile nav on desktop
  if (!isMobile) return null;

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Header Bar */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
            <div className="flex flex-col h-full">
              {/* Header in Sheet */}
              <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sidebar-foreground">LINE Lender</span>
                  <span className="text-xs text-muted-foreground">Staff Portal</span>
                </div>
              </div>

              {/* Navigation - reuse existing component */}
              <WebAdminSidebarNav />

              <WebAdminSidebarFooter />
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo in center */}
        <Link href="/web-admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-foreground">LINE Lender</span>
        </Link>

        {/* Locale Switcher */}
        <div className="flex items-center">
          <LocaleSwitcherMinimal />
        </div>
      </header>
    </TooltipProvider>
  );
}
