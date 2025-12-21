'use client';

import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar';
import { WebAdminSidebar } from './WebAdminSidebar';
import { WebAdminMobileNav } from './WebAdminMobileNav';
import { WebAdminTopBar } from './WebAdminTopBar';

interface WebAdminNavigationProps {
  children: React.ReactNode;
}

function WebAdminLayoutContent({ children }: WebAdminNavigationProps) {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <WebAdminSidebar />

      {/* Mobile Navigation */}
      <WebAdminMobileNav />

      {/* Top Bar (Locale Switcher) */}
      <WebAdminTopBar />

      {/* Main Content */}
      <main
        className={`min-h-screen transition-[margin] duration-300 ease-in-out ${
          isMobile
            ? 'pt-16' // Account for mobile header
            : isCollapsed
              ? 'ml-16'
              : 'ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export function WebAdminNavigation({ children }: WebAdminNavigationProps) {
  return (
    <SidebarProvider>
      <WebAdminLayoutContent>{children}</WebAdminLayoutContent>
    </SidebarProvider>
  );
}
