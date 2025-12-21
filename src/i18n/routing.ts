import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['th', 'en'],
  defaultLocale: 'th',
  localePrefix: 'as-needed', // Thai URLs have no prefix, English uses /en
});

export type Locale = (typeof routing.locales)[number];
