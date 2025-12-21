'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserRole } from '@/types';

interface WebAdminUser {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: UserRole;
}

export function useWebAuth() {
  const [user, setUser] = useState<WebAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/web-admin/user', {
        credentials: 'include',
      });

      if (response.status === 401) {
        setUser(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    window.location.href = '/api/web-admin/logout';
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
    refetch: fetchUser,
  };
}
