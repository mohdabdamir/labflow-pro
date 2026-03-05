// hooks/useUserStore.ts — lightweight localStorage-based session store
import { useState, useCallback, useEffect } from 'react';
import type { User } from '@/types/lab';
import { mockUsers } from '@/data/mockData';

const STORAGE_KEY = 'lis_current_user';

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as User;
  } catch {
    // ignore
  }
  return null;
}

// Module-level reactive state so all hook instances share the same user
let _currentUser: User | null = getStoredUser() ?? mockUsers[0]; // seed admin
const _listeners = new Set<() => void>();

function notifyListeners() {
  _listeners.forEach(fn => fn());
}

export function useUserStore() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const fn = () => rerender(n => n + 1);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  const setCurrentUser = useCallback((user: User) => {
    _currentUser = user;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
    notifyListeners();
  }, []);

  const logout = useCallback(() => {
    _currentUser = mockUsers[0]; // reset to admin for demo
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    notifyListeners();
  }, []);

  return {
    currentUser: _currentUser,
    setCurrentUser,
    logout,
  };
}
