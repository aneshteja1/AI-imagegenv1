'use client';

import { useAuth } from '@/app/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--background)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px', height: '32px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--foreground)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <Sidebar />
      <Header />
      <main style={{
        paddingLeft: 'var(--sidebar-width)',
        paddingTop: 'var(--header-height)',
        minHeight: '100vh',
        background: 'var(--gray-50)',
        transition: 'padding-left 200ms ease',
      }}>
        <div style={{
          padding: 'clamp(1rem, 2.5vw, 1.5rem)',
          maxWidth: '1800px',
          width: '100%',
        }}>
          {children}
        </div>
      </main>

      {/* Mobile: no sidebar push */}
      <style>{`
        @media (max-width: 1023px) {
          main { padding-left: 0 !important; }
        }
        @media (min-width: 1024px) {
          main { padding-left: var(--sidebar-width) !important; }
        }
      `}</style>
    </div>
  );
}
