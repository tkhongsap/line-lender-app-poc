'use client';

import { LocaleSwitcherMinimal } from '@/components/LocaleSwitcher';
import { useSidebar } from '@/hooks/use-sidebar';

export function WebAdminTopBar() {
  const { isMobile } = useSidebar();

  // Don't render on mobile (mobile header already has locale switcher)
  if (isMobile) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <LocaleSwitcherMinimal />
    </div>
  );
}
