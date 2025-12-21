'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useWebAuth } from '@/hooks/use-web-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  CreditCard,
  LayoutDashboard,
  FileText,
  Users,
  Menu,
  X,
  LogOut,
  ChevronDown,
  FolderOpen,
  DollarSign,
  Settings,
  Clock,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { LocaleSwitcherMinimal } from '@/components/LocaleSwitcher';

interface WebAdminNavigationProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function WebAdminNavigation({ children }: WebAdminNavigationProps) {
  const { user, logout } = useWebAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Main navigation items (flat for header)
  const mainNavItems: NavItem[] = [
    { href: '/web-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/web-admin/applications', icon: FileText, label: 'Applications' },
    { href: '/web-admin/contracts', icon: FolderOpen, label: 'Contracts' },
    { href: '/web-admin/payments', icon: DollarSign, label: 'Payments' },
    { href: '/web-admin/reports', icon: BarChart3, label: 'Reports' },
  ];

  // Full navigation with groups (for mobile menu)
  const navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { href: '/web-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      ],
    },
    {
      label: 'Applications',
      items: [
        { href: '/web-admin/applications', icon: FileText, label: 'All Applications' },
        { href: '/web-admin/applications/pending', icon: Clock, label: 'Pending Review' },
      ],
    },
    {
      label: 'Contracts',
      items: [
        { href: '/web-admin/contracts', icon: FolderOpen, label: 'All Contracts' },
        { href: '/web-admin/contracts/overdue', icon: AlertTriangle, label: 'Overdue' },
      ],
    },
    {
      label: 'Payments',
      items: [
        { href: '/web-admin/payments', icon: DollarSign, label: 'All Payments' },
        { href: '/web-admin/payments/pending', icon: Clock, label: 'Pending Verification' },
      ],
    },
    {
      label: 'Reports',
      items: [
        { href: '/web-admin/reports', icon: BarChart3, label: 'Generate Reports' },
      ],
    },
    {
      label: 'Admin',
      items: [
        { href: '/web-admin/staff', icon: Users, label: 'Staff Management', adminOnly: true },
        { href: '/web-admin/settings', icon: Settings, label: 'Settings', adminOnly: true },
      ],
    },
  ];

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const isActive = (href: string) => {
    if (href === '/web-admin/dashboard') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/web-admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground hidden sm:inline">LINE Lender</span>
            </Link>
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
              Staff Portal
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {mainNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary hover:bg-primary/15'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}

            {/* More Dropdown for Admin */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  More
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-56 max-w-56 bg-popover border">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-muted-foreground text-xs">Quick Links</DropdownMenuLabel>
                  <DropdownMenuItem asChild className="text-foreground focus:bg-muted cursor-pointer">
                    <Link href="/web-admin/applications/pending">
                      <Clock className="w-4 h-4 mr-2" />
                      Pending Applications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-foreground focus:bg-muted cursor-pointer">
                    <Link href="/web-admin/contracts/overdue">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Overdue Contracts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-foreground focus:bg-muted cursor-pointer">
                    <Link href="/web-admin/payments/pending">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Pending Payments
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {isSuperAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-muted-foreground text-xs">Admin</DropdownMenuLabel>
                      <DropdownMenuItem asChild className="text-foreground focus:bg-muted cursor-pointer">
                        <Link href="/web-admin/staff">
                          <Users className="w-4 h-4 mr-2" />
                          Staff Management
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="text-foreground focus:bg-muted cursor-pointer">
                        <Link href="/web-admin/settings">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LocaleSwitcherMinimal />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">{user?.firstName || user?.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-56 max-w-56 bg-popover border">
                <DropdownMenuLabel className="text-foreground">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-primary">{user?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col gap-4">
              {navGroups.map((group) => {
                const visibleItems = group.items.filter(
                  (item) => !item.adminOnly || isSuperAdmin
                );
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.label}>
                    <p className="text-xs font-medium text-tertiary uppercase tracking-wider mb-2">
                      {group.label}
                    </p>
                    <div className="flex flex-col gap-1">
                      {visibleItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 ${
                              isActive(item.href)
                                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
