'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Image, Video, User2, Layers,
  RefreshCcw, AlertCircle, BarChart2, CreditCard,
  Settings, Users, Building2, ChevronLeft, ChevronRight,
  Zap, LogOut, FlaskConical,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',         href: '/dashboard',                   icon: LayoutDashboard },
  { label: 'Image Generation',  href: '/dashboard/image-generation',  icon: Image },
  { label: 'Video Generation',  href: '/dashboard/video-generation',  icon: Video },
  { label: 'Avatar Generation', href: '/dashboard/avatar-generation', icon: User2 },
  { label: 'Bulk Generation',   href: '/dashboard/bulk-generation',   icon: Layers,     roles: ['super_admin','admin','company_admin','test_admin'] },
  { label: 'Swap Model',        href: '/dashboard/swap-model',        icon: RefreshCcw  },
  { label: 'Failed Jobs',       href: '/dashboard/failed-jobs',       icon: AlertCircle, roles: ['super_admin','admin','company_admin','test_admin'] },
  { label: 'Analytics',         href: '/dashboard/analytics',         icon: BarChart2,  roles: ['super_admin','admin','company_admin','test_admin'] },
  { label: 'Billing',           href: '/dashboard/billing',           icon: CreditCard, roles: ['super_admin','admin','company_admin'] },
  { label: 'Users',             href: '/dashboard/users',             icon: Users,      roles: ['super_admin','admin','company_admin','test_admin'] },
  { label: 'Companies',         href: '/dashboard/companies',         icon: Building2,  roles: ['super_admin','admin'] },
  { label: 'Settings',          href: '/dashboard/settings',          icon: Settings },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const filtered = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(user?.role ?? '')
  );

  const SidebarContent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--sidebar)',
      color: 'var(--sidebar-fg)',
    }}>
      {/* Logo */}
      <div style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: collapsed ? '0 1rem' : '0 1.25rem',
        borderBottom: '1px solid var(--sidebar-border)',
        flexShrink: 0,
      }}>
        <div style={{
          flexShrink: 0,
          width: '32px', height: '32px',
          background: 'var(--sidebar-fg)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={16} color="var(--sidebar)" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              VenkatTech
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--sidebar-accent-fg)', opacity: 0.7, whiteSpace: 'nowrap' }}>
              Media Studio
            </div>
          </div>
        )}
      </div>

      {/* Test Mode Banner */}
      {user?.isTest && !collapsed && (
        <div style={{
          margin: '0.75rem',
          padding: '0.375rem 0.75rem',
          background: 'rgba(234,179,8,0.2)',
          border: '1px solid rgba(234,179,8,0.4)',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          fontSize: 'var(--text-xs)',
          color: '#fde047',
        }}>
          <FlaskConical size={12} />
          TEST MODE
        </div>
      )}

      {/* Nav Items */}
      <nav style={{
        flex: 1,
        padding: '0.5rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        {filtered.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: collapsed ? '0.625rem' : '0.625rem 0.75rem',
                borderRadius: '8px',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--sidebar-fg)' : 'var(--sidebar-accent-fg)',
                background: isActive ? 'var(--sidebar-accent)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 150ms, color 150ms',
                justifyContent: collapsed ? 'center' : undefined,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-accent)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-fg)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-accent-fg)';
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      {user && (
        <div style={{
          borderTop: '1px solid var(--sidebar-border)',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {!collapsed && (
            <div style={{ padding: '0.25rem 0.5rem' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--sidebar-accent-fg)', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: collapsed ? '0.625rem' : '0.625rem 0.75rem',
              borderRadius: '8px',
              background: 'none', border: 'none',
              color: 'var(--sidebar-accent-fg)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              justifyContent: collapsed ? 'center' : undefined,
              width: '100%',
            }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {!collapsed && 'Logout'}
          </button>
        </div>
      )}

      {/* Collapse Toggle (desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex"
        style={{
          position: 'absolute',
          top: '50%',
          right: '-12px',
          transform: 'translateY(-50%)',
          width: '24px', height: '24px',
          background: 'var(--sidebar)',
          border: '1px solid var(--sidebar-border)',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--sidebar-fg)',
          zIndex: 10,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          transition: 'width 200ms ease',
          zIndex: 40,
          display: 'none',
        }}
        className="lg:block"
      >
        <div style={{ position: 'relative', height: '100%' }}>
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden"
        style={{
          position: 'fixed', top: '14px', left: '16px',
          zIndex: 50,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--foreground)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 45,
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0, left: 0, bottom: 0,
              width: 'var(--sidebar-width)',
              zIndex: 50,
            }}
          >
            <SidebarContent />
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', top: '16px', right: '-40px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none', borderRadius: '50%',
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
              }}
            >
              ✕
            </button>
          </aside>
        </>
      )}
    </>
  );
}
