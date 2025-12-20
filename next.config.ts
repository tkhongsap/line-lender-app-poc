import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "86eddb6f-e827-4a52-af0c-5aaf0cbcdfbf-00-3twlk4xs10b5s.sisko.replit.dev",
    "*.replit.dev",
    "*.repl.co",
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

export default nextConfig;
