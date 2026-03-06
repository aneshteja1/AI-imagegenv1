'use client';

import { useAuth } from '@/app/context/auth-context';
import { useRouter } from 'next/navigation';
import { creditStatus, formatNumber } from '@/lib/utils';
import { BarChart2, RefreshCcw, Image, Video, Users, Building2, TrendingUp, Coins, AlertCircle, Layers } from 'lucide-react';
import Link from 'next/link';

// Mock data — replace with FastAPI calls
const MOCK_STATS = {
  swapsToday: 47,
  swapsTotal: 1284,
  creditsUsed: 2568,
  activeJobs: 3,
  successRate: 97.2,
  pendingApprovals: 4,
  totalCompanies: 12,
  totalUsers: 89,
  revenue: 12480,
};

const MOCK_RECENT = [
  { id: '1', type: 'Face Swap',        status: 'completed', time: '2m ago',  credits: 2 },
  { id: '2', type: 'Image Generation', status: 'completed', time: '5m ago',  credits: 1 },
  { id: '3', type: 'Video Generation', status: 'processing',time: '8m ago',  credits: 5 },
  { id: '4', type: 'Bulk Generation',  status: 'completed', time: '12m ago', credits: 8 },
  { id: '5', type: 'Virtual Reshoot',  status: 'failed',    time: '25m ago', credits: 0 },
];

export default function DashboardPage() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const creditPct = Math.round((user.credits / user.creditLimit) * 100);
  const cStatus = creditStatus(user.credits, user.creditLimit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Welcome back, {user.name.split(' ')[0]} 👋
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
            {user.isTest ? '🧪 Test mode — using dummy data' : `${user.companyName ?? 'VenkatTech'} · ${user.role.replace('_', ' ')}`}
          </p>
        </div>
        <Link
          href="/dashboard/swap-model"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--foreground)',
            color: 'var(--background)',
            borderRadius: '8px',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <RefreshCcw size={14} />
          New Swap
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(180px, 22vw, 240px), 1fr))',
        gap: 'clamp(0.75rem, 1.5vw, 1rem)',
      }}>
        {/* Credits */}
        <StatCard
          icon={<Coins size={18} />}
          label="Credits Remaining"
          value={formatNumber(user.credits)}
          sub={`of ${formatNumber(user.creditLimit)}`}
          accent={cStatus === 'low' ? 'red' : cStatus === 'medium' ? 'amber' : undefined}
          extra={
            <div className="credit-bar" style={{ marginTop: '0.5rem' }}>
              <div
                className={`credit-bar-fill ${cStatus}`}
                style={{ width: `${creditPct}%` }}
              />
            </div>
          }
        />

        <StatCard icon={<RefreshCcw size={18} />} label="Swaps Today" value={MOCK_STATS.swapsToday.toString()} sub="face swaps" />
        <StatCard icon={<TrendingUp size={18} />} label="Total Swaps" value={formatNumber(MOCK_STATS.swapsTotal)} sub="all time" />
        <StatCard icon={<AlertCircle size={18} />} label="Active Jobs" value={MOCK_STATS.activeJobs.toString()} sub="processing" />
        <StatCard icon={<BarChart2 size={18} />} label="Success Rate" value={`${MOCK_STATS.successRate}%`} sub="last 30 days" />

        {isAdmin && (
          <>
            <StatCard icon={<Building2 size={18} />} label="Companies" value={MOCK_STATS.totalCompanies.toString()} sub={`${MOCK_STATS.pendingApprovals} pending`} />
            <StatCard icon={<Users size={18} />} label="Total Users" value={MOCK_STATS.totalUsers.toString()} sub="across all companies" />
          </>
        )}

        {isSuperAdmin && (
          <StatCard icon={<Coins size={18} />} label="Revenue" value={`$${formatNumber(MOCK_STATS.revenue)}`} sub="this month" />
        )}
      </div>

      {/* Quick Actions + Recent */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 45%, 500px), 1fr))',
        gap: 'clamp(0.75rem, 1.5vw, 1rem)',
      }}>
        {/* Quick Actions */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { href: '/dashboard/swap-model',        icon: <RefreshCcw size={16} />, label: 'Swap Model',      credits: 2 },
              { href: '/dashboard/image-generation',  icon: <Image size={16} />,      label: 'Generate Image',  credits: 1 },
              { href: '/dashboard/video-generation',  icon: <Video size={16} />,      label: 'Generate Video',  credits: 5 },
              { href: '/dashboard/bulk-generation',   icon: <Layers size={16} />,     label: 'Bulk Generate',   credits: 1 },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem',
                  padding: '0.75rem',
                  background: 'var(--secondary)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--foreground)',
                  border: '1px solid transparent',
                  transition: 'border-color 150ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
              >
                <span style={{ color: 'var(--muted-foreground)' }}>{action.icon}</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{action.label}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{action.credits} cr</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Recent Activity</h3>
            <Link href="/dashboard/failed-jobs" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {MOCK_RECENT.map(job => (
              <div key={job.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                background: 'var(--secondary)',
                borderRadius: '6px',
              }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{job.type}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{job.time}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {job.credits > 0 && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>−{job.credits} cr</span>
                  )}
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin: Pending Approvals */}
      {isAdmin && MOCK_STATS.pendingApprovals > 0 && (
        <div style={{
          background: 'rgba(234,179,8,0.1)',
          border: '1px solid rgba(234,179,8,0.3)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#92400e' }}>
                {MOCK_STATS.pendingApprovals} company files awaiting approval
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: '#a16207' }}>
                Review and approve company documents to give them access
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/companies"
            style={{
              padding: '0.375rem 0.875rem',
              background: '#d97706',
              color: 'white',
              borderRadius: '6px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            Review Now
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent, extra }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: 'red' | 'amber';
  extra?: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${accent === 'red' ? 'rgba(220,38,38,0.3)' : accent === 'amber' ? 'rgba(217,119,6,0.3)' : 'var(--border)'}`,
      borderRadius: '12px',
      padding: '1rem 1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ color: 'var(--muted-foreground)' }}>{icon}</div>
      </div>
      <div style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 700,
        color: accent === 'red' ? '#dc2626' : accent === 'amber' ? '#d97706' : 'var(--foreground)',
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
        {label} {sub && <span>· {sub}</span>}
      </div>
      {extra}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    completed:  { bg: '#dcfce7', color: '#15803d', label: '✓ Done' },
    processing: { bg: '#e0f2fe', color: '#0369a1', label: '⟳ Running' },
    failed:     { bg: '#fee2e2', color: '#b91c1c', label: '✕ Failed' },
    queued:     { bg: '#f3f4f6', color: '#374151', label: '⏳ Queued' },
  };
  const s = map[status] ?? map.queued;
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600,
      padding: '2px 6px',
      background: s.bg, color: s.color,
      borderRadius: '4px',
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}
