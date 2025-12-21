'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, LogIn, AlertCircle } from 'lucide-react';

export default function WebAdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        no_code: 'Authentication failed - no authorization code received',
        no_email: 'Could not retrieve email from your account',
        not_authorized: 'Your account is not authorized to access this portal',
        auth_failed: 'Authentication failed - please try again',
      };
      setError(errorMessages[errorParam] || 'An unknown error occurred');
    }
  }, []);
  
  const handleLogin = () => {
    window.location.href = '/api/web-admin/login';
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md border shadow-line-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">LINE Lender</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Staff Administration Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="text-center text-muted-foreground text-sm">
            <p>Sign in with your authorized account to access the staff portal.</p>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
            size="lg"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>

          <div className="text-center text-xs text-tertiary">
            <p>Only authorized staff members can access this portal.</p>
            <p className="mt-1">Contact your administrator if you need access.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
