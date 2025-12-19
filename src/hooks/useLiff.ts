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

  const handleLogin = useCallback(() => {
    if (state.isInitialized) {
      login();
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

