'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/hooks/use-sidebar';
import { useWebAuth } from '@/hooks/use-web-auth';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  FileText,
  Clock,
  FolderOpen,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  adminOnly?: boolean;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    labelKey: 'overview',
    items: [
      { href: '/web-admin/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    ],
  },
  {
    labelKey: 'applications',
    items: [
      { href: '/web-admin/applications', icon: FileText, labelKey: 'allApplications' },
      { href: '/web-admin/applications/pending', icon: Clock, labelKey: 'pendingReview' },
    ],
  },
  {
    labelKey: 'contracts',
    items: [
      { href: '/web-admin/contracts', icon: FolderOpen, labelKey: 'allContracts' },
      { href: '/web-admin/contracts/overdue', icon: AlertTriangle, labelKey: 'overdue' },
    ],
  },
  {
    labelKey: 'payments',
    items: [
      { href: '/web-admin/payments', icon: DollarSign, labelKey: 'allPayments' },
      { href: '/web-admin/payments/pending', icon: Clock, labelKey: 'pendingVerification' },
    ],
  },
  {
    labelKey: 'reports',
    items: [
      { href: '/web-admin/reports', icon: BarChart3, labelKey: 'generateReports' },
    ],
  },
  {
    labelKey: 'admin',
    items: [
      { href: '/web-admin/staff', icon: Users, labelKey: 'staffManagement', adminOnly: true },
      { href: '/web-admin/settings', icon: Settings, labelKey: 'settings', adminOnly: true },
    ],
  },
];

export function WebAdminSidebarNav() {
  const pathname = usePathname();
  const { isCollapsed, setMobileOpen } = useSidebar();
  const { user } = useWebAuth();
  const t = useTranslations('webAdmin.sidebar');
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const isActive = (href: string) => {
    if (href === '/web-admin/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleNavClick = () => {
    // Close mobile menu on navigation
    setMobileOpen(false);
  };

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      {navGroups.map((group) => {
        const visibleItems = group.items.filter(
          (item) => !item.adminOnly || isSuperAdmin
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.labelKey}>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t(group.labelKey)}
              </p>
            )}
            <div className="space-y-1">
              {visibleItems.map((item) => {
                const active = isActive(item.href);
                const label = t(item.labelKey);

                const buttonContent = (
                  <Link href={item.href} onClick={handleNavClick}>
                    <Button
                      variant="ghost"
                      className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} gap-3 h-10 ${
                        active
                          ? 'bg-primary/10 text-primary hover:bg-primary/15 font-medium'
                          : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                      {!isCollapsed && <span className="truncate">{label}</span>}
                    </Button>
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                      <TooltipContent side="right" className="bg-foreground text-background">
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.href}>{buttonContent}</div>;
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
