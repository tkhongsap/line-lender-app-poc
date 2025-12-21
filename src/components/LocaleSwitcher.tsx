'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const LOCALE_LABELS: Record<Locale, { label: string; flag: string }> = {
  th: { label: 'ไทย', flag: '🇹🇭' },
  en: { label: 'English', flag: '🇺🇸' },
};

interface LocaleSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function LocaleSwitcher({
  variant = 'ghost',
  size = 'sm',
  showLabel = true,
}: LocaleSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  const currentLocale = LOCALE_LABELS[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="hidden sm:inline">
              {currentLocale.flag} {currentLocale.label}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => {
          const { label, flag } = LOCALE_LABELS[loc];
          const isActive = loc === locale;
          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={isActive ? 'bg-accent' : ''}
            >
              <span className="mr-2">{flag}</span>
              {label}
              {isActive && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LocaleSwitcherMinimal() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === 'th' ? 'en' : 'th';
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="gap-1 text-muted-foreground hover:text-foreground"
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs uppercase">{locale === 'th' ? 'EN' : 'TH'}</span>
    </Button>
  );
}
