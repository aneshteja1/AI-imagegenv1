'use client';

import { useAuth } from '@/app/context/auth-context';
import { usePathname } from 'next/navigation';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { creditStatus, getRoleLabel } from '@/lib/utils';
import { Coins, Bell, ChevronDown, FlaskConical } from 'lucide-react';
import { useState } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/image-generation': 'Image Generation',
  '/dashboard/video-generation': 'Video Generation',
  '/dashboard/avatar-generation': 'Avatar Generation',
  '/dashboard/bulk-generation': 'Bulk Generation',
  '/dashboard/swap-model': 'Swap Model',
  '/dashboard/failed-jobs': 'Failed Jobs',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/billing': 'Billing',
  '/dashboard/settings': 'Settings',
  '/dashboard/users': 'User Management',
  '/dashboard/companies': 'Company Management',
};

export function Header() {
  const { user, language, setLanguage } = useAuth();
  const pathname = usePathname();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const title = PAGE_TITLES[pathname] ?? 'Dashboard';
  const creditPct = user ? Math.round((user.credits / user.creditLimit) * 100) : 0;
  const status = user ? creditStatus(user.credits, user.creditLimit) : 'high';

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: 0,
      height: 'var(--header-height)',
      background: 'var(--background)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(1rem, 2vw, 1.5rem)',
      zIndex: 30,
      paddingLeft: 'calc(var(--sidebar-width) + clamp(1rem, 2vw, 1.5rem))',
    }}>
      {/* Left: Title */}
      <div style={{ paddingLeft: 'clamp(0rem, 2vw, 0rem)' }}>
        <h1 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          marginLeft: '2.5rem', // mobile hamburger space
        }}>
          {title}
        </h1>
        {user?.isTest && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            fontSize: 'var(--text-xs)', color: '#d97706',
            marginLeft: '2.5rem',
          }}>
            <FlaskConical size={10} />
            Test Mode Active
          </div>
        )}
      </div>

      {/* Right: Credits + Language + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 1.5vw, 1rem)' }}>

        {/* Credits */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            background: 'var(--secondary)',
            borderRadius: '8px',
            fontSize: 'var(--text-xs)',
          }}>
            <Coins size={14} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ fontWeight: 600, color: status === 'low' ? '#dc2626' : 'var(--foreground)' }}>
              {user.credits.toLocaleString()}
            </span>
            <span style={{ color: 'var(--muted-foreground)', display: 'none' }} className="sm:inline">
              / {user.creditLimit.toLocaleString()} credits
            </span>
          </div>
        )}

        {/* Language Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.375rem 0.5rem',
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              color: 'var(--foreground)',
            }}
          >
            <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag ?? '🌐'}</span>
            <span style={{ display: 'none' }} className="sm:inline">
              {language.toUpperCase()}
            </span>
            <ChevronDown size={10} />
          </button>
          {showLangMenu && (
            <>
              <div onClick={() => setShowLangMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                zIndex: 100,
                minWidth: '120px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                {SUPPORTED_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLanguage(l.code); setShowLangMenu(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      width: '100%', padding: '0.5rem 0.75rem',
                      background: language === l.code ? 'var(--secondary)' : 'none',
                      border: 'none', cursor: 'pointer',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--foreground)',
                      textAlign: 'left',
                    }}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Badge */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.25rem 0.625rem',
            background: 'var(--secondary)',
            borderRadius: '8px',
            fontSize: 'var(--text-xs)',
          }}>
            <div style={{
              width: '24px', height: '24px',
              background: 'var(--foreground)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--background)',
              fontWeight: 700,
              fontSize: '10px',
              flexShrink: 0,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'none', flexDirection: 'column' }} className="sm:flex">
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{getRoleLabel(user.role)}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
