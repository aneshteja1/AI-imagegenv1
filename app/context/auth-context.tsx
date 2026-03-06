'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/lib/types';
import type { Language } from '@/i18n';

// ============================================================
// MOCK USERS — Remove once FastAPI backend is live
// ============================================================
export const MOCK_USERS: User[] = [
  // 1. Test Admin — for testing admin features with dummy data
  {
    id: 'test-admin-001',
    email: 'test.admin@venkattech.com',
    name: 'Test Admin',
    role: 'test_admin',
    credits: 9999,
    creditLimit: 9999,
    isTest: true,
    createdAt: '2025-01-01T00:00:00Z',
    status: 'active',
    language: 'en',
  },
  // 2. Test User — for testing user features with dummy data
  {
    id: 'test-user-001',
    email: 'test.user@venkattech.com',
    name: 'Test User',
    role: 'test_user',
    companyId: 'test-company-001',
    companyName: 'Test Company',
    credits: 500,
    creditLimit: 500,
    isTest: true,
    createdAt: '2025-01-01T00:00:00Z',
    status: 'active',
    language: 'en',
  },
  // 3. Super Admin — full platform control
  {
    id: 'super-admin-001',
    email: 'admin@venkattech.com',
    name: 'Venkat Admin',
    role: 'super_admin',
    credits: 99999,
    creditLimit: 99999,
    createdAt: '2024-01-01T00:00:00Z',
    status: 'active',
    language: 'en',
  },
  // 4. Company Admin — manages their company
  {
    id: 'company-admin-001',
    email: 'company.admin@demo.com',
    name: 'Company Admin Demo',
    role: 'company_admin',
    companyId: 'demo-company-001',
    companyName: 'Demo Corporation',
    credits: 2000,
    creditLimit: 5000,
    createdAt: '2024-06-01T00:00:00Z',
    status: 'active',
    language: 'en',
  },
  // 5. Regular User — swaps images, uses credits
  {
    id: 'user-001',
    email: 'user@demo.com',
    name: 'Demo User',
    role: 'user',
    companyId: 'demo-company-001',
    companyName: 'Demo Corporation',
    credits: 150,
    creditLimit: 500,
    createdAt: '2024-06-15T00:00:00Z',
    status: 'active',
    language: 'en',
  },
];

// Password map (dev only)
const MOCK_PASSWORDS: Record<string, string> = {
  'test.admin@venkattech.com':   'TestAdmin@1234',
  'test.user@venkattech.com':    'TestUser@1234',
  'admin@venkattech.com':        'Admin@1234',
  'company.admin@demo.com':      'CompAdmin@1234',
  'user@demo.com':               'User@1234',
};

// ============================================================
// Auth Context
// ============================================================
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCredits: (amount: number) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isTestMode: boolean;
  canAccess: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Restore session
    try {
      const stored = localStorage.getItem('vt_user');
      const storedLang = localStorage.getItem('vt_lang') as Language;
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      }
      if (storedLang) setLanguageState(storedLang);
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try FastAPI first
      if (process.env.NEXT_PUBLIC_FASTAPI_URL) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (res.ok) {
            const data = await res.json();
            const loggedUser = data.user as User;
            setUser(loggedUser);
            localStorage.setItem('vt_user', JSON.stringify(loggedUser));
            localStorage.setItem('vt_token', data.access_token);
            setIsLoading(false);
            return { success: true };
          }
        } catch {
          // Fall through to mock
        }
      }

      // Mock auth fallback
      const mockUser = MOCK_USERS.find(u => u.email === email);
      const correctPassword = MOCK_PASSWORDS[email];
      if (!mockUser || correctPassword !== password) {
        setIsLoading(false);
        return { success: false, error: 'Invalid email or password' };
      }

      const loggedUser = { ...mockUser, lastLogin: new Date().toISOString() };
      setUser(loggedUser);
      setLanguageState(loggedUser.language);
      localStorage.setItem('vt_user', JSON.stringify(loggedUser));
      localStorage.setItem('vt_lang', loggedUser.language);
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('vt_user');
    localStorage.removeItem('vt_token');
    window.location.href = '/login';
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vt_lang', lang);
    if (user) {
      const updated = { ...user, language: lang };
      setUser(updated);
      localStorage.setItem('vt_user', JSON.stringify(updated));
    }
  }, [user]);

  const updateCredits = useCallback((amount: number) => {
    if (!user) return;
    const updated = { ...user, credits: Math.max(0, user.credits + amount) };
    setUser(updated);
    localStorage.setItem('vt_user', JSON.stringify(updated));
  }, [user]);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'test_admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isCompanyAdmin = user?.role === 'company_admin';
  const isTestMode = user?.isTest === true;

  const canAccess = useCallback((feature: string): boolean => {
    if (!user) return false;
    const role = user.role;
    const accessMap: Record<string, UserRole[]> = {
      companies:    ['super_admin', 'admin'],
      users:        ['super_admin', 'admin', 'company_admin', 'test_admin'],
      billing:      ['super_admin', 'admin', 'company_admin'],
      analytics:    ['super_admin', 'admin', 'company_admin', 'test_admin'],
      'swap-model': ['super_admin', 'admin', 'company_admin', 'user', 'test_user', 'test_admin'],
      'bulk-generation': ['super_admin', 'admin', 'company_admin', 'test_admin'],
      'failed-jobs':     ['super_admin', 'admin', 'company_admin', 'test_admin'],
    };
    return !accessMap[feature] || (accessMap[feature] as string[]).includes(role);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, isLoading, language, setLanguage,
      login, logout, updateCredits,
      isAdmin, isSuperAdmin, isCompanyAdmin, isTestMode,
      canAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
