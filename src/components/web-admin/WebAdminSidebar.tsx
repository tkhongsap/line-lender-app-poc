'use client';

import { useSidebar } from '@/hooks/use-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WebAdminSidebarHeader } from './WebAdminSidebarHeader';
import { WebAdminSidebarNav } from './WebAdminSidebarNav';
import { WebAdminSidebarFooter } from './WebAdminSidebarFooter';

export function WebAdminSidebar() {
  const { isCollapsed, isMobile } = useSidebar();

  // Don't render desktop sidebar on mobile
  if (isMobile) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <WebAdminSidebarHeader />
        <WebAdminSidebarNav />
        <WebAdminSidebarFooter />
      </aside>
    </TooltipProvider>
  );
}
