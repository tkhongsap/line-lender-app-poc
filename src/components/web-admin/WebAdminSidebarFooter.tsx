'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LocaleSwitcherMinimal } from '@/components/LocaleSwitcher';
import { useWebAuth } from '@/hooks/use-web-auth';
import { useSidebar } from '@/hooks/use-sidebar';
import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';

export function WebAdminSidebarFooter() {
  const { user, logout } = useWebAuth();
  const { isCollapsed } = useSidebar();
  const t = useTranslations('webAdmin.sidebar');

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="border-t border-sidebar-border p-4 space-y-3">
      {/* User Profile */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={user?.profileImageUrl} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.firstName || user?.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
          </div>
        )}
      </div>

      {/* Logout Button */}
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="w-full h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{t('signOut')}</TooltipContent>
        </Tooltip>
      ) : (
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('signOut')}
        </Button>
      )}
    </div>
  );
}
