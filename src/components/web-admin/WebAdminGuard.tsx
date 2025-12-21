'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWebAuth } from '@/hooks/use-web-auth';
import { Loader2 } from 'lucide-react';

interface WebAdminGuardProps {
  children: React.ReactNode;
}

export function WebAdminGuard({ children }: WebAdminGuardProps) {
  const { user, isLoading, isAuthenticated } = useWebAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/web-admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
