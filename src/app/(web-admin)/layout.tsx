import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LINE Lender - Staff Portal',
  description: 'Staff administration portal for loan management',
};

export default function WebAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
