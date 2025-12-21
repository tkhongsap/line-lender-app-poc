'use client';

import { Link } from '@/i18n/navigation';
import { CreditCard, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/hooks/use-sidebar';

export function WebAdminSidebarHeader() {
  const { isCollapsed, toggleCollapsed, isMobile } = useSidebar();

  return (
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-sidebar-border`}>
      <Link href="/web-admin/dashboard" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-sidebar-foreground">LINE Lender</span>
            <span className="text-xs text-muted-foreground">Staff Portal</span>
          </div>
        )}
      </Link>

      {!isMobile && !isCollapsed && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="h-8 w-8 text-muted-foreground hover:text-sidebar-foreground"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Collapse sidebar</TooltipContent>
        </Tooltip>
      )}

      {!isMobile && isCollapsed && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="h-8 w-8 text-muted-foreground hover:text-sidebar-foreground absolute top-3 left-1/2 -translate-x-1/2 mt-12"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Expand sidebar</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
