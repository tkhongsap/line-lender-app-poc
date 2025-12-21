import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "86eddb6f-e827-4a52-af0c-5aaf0cbcdfbf-00-3twlk4xs10b5s.sisko.replit.dev",
    "*.replit.dev",
    "*.repl.co",
    "127.0.0.1",
    "localhost",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
