import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LINE Lender - ระบบสินเชื่อบน LINE",
  description: "ระบบจัดการสินเชื่อและติดตามหนี้ครบวงจรบน LINE LIFF",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}>) {
  // Get locale from params or default to Thai
  const resolvedParams = params ? await params : undefined;
  const locale = resolvedParams?.locale ?? routing.defaultLocale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
