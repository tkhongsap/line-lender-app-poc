'use client';

import { useState, useEffect, useCallback } from 'react';
import { initializeLiffWithState, login, logout, LiffState, LiffUser, getInitialLiffState } from '@/lib/liff';

export interface UseLiffReturn extends LiffState {
  login: () => void;
  logout: () => void;
  reload: () => Promise<void>;
}

/**
 * Custom hook for LIFF initialization and state management
 */
export function useLiff(liffId?: string): UseLiffReturn {
  const [state, setState] = useState<LiffState>(getInitialLiffState());

  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    const newState = await initializeLiffWithState(liffId);
    setState(newState);
  }, [liffId]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // After successful LIFF init, check if we need to redirect based on liff.state
  useEffect(() => {
    if (state.isInitialized && state.isLoggedIn && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const liffState = params.get('liff.state');
      
      if (liffState) {
        // Decode the intended path (e.g., "%2Fen%2Fapply" -> "/en/apply")
        const intendedPath = decodeURIComponent(liffState);
        const currentPath = window.location.pathname;
        
        // If we're not on the intended page, redirect
        if (intendedPath !== currentPath && intendedPath.startsWith('/')) {
          window.location.href = intendedPath;
        }
      }
    }
  }, [state.isInitialized, state.isLoggedIn]);

  const handleLogin = useCallback(() => {
    if (state.isInitialized) {
      login(window.location.href);
    }
  }, [state.isInitialized]);

  const handleLogout = useCallback(() => {
    if (state.isInitialized) {
      logout();
    }
  }, [state.isInitialized]);

  return {
    ...state,
    login: handleLogin,
    logout: handleLogout,
    reload: initialize,
  };
}

export default useLiff;

