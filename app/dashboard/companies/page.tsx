'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
// FIX: Removed unused 'useRouter' import
// FIX: Removed unused 'Building2', 'Check', 'Upload', 'Coins', 'Users' imports to prevent linting errors
import { X, Eye, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { Company } from '@/lib/types'; // FIX: Removed unused 'CompanyFile' import

const MOCK_COMPANIES: Company[] = [
  {
    id: 'comp-001', name: 'Acme Corp', email: 'admin@acme.com', status: 'approved',
    credits: 5000, creditLimit: 10000, plan: 'professional',
    adminId: 'u1', userCount: 12,
    files: [
      { id: 'f1', name: 'Business_License.pdf', type: 'application/pdf', url: '#', size: 245000, uploadedAt: '2025-01-10T10:00:00Z', status: 'approved' },
      { id: 'f2', name: 'Company_Registration.pdf', type: 'application/pdf', url: '#', size: 189000, uploadedAt: '2025-01-10T10:05:00Z', status: 'approved' },
    ],
    createdAt: '2025-01-10T09:00:00Z', approvedAt: '2025-01-12T14:00:00Z',
  },
  {
    id: 'comp-002', name: 'TechFlow Solutions', email: 'admin@techflow.com', status: 'pending',
    credits: 0, creditLimit: 5000, plan: 'starter',
    adminId: 'u2', userCount: 0,
    files: [
      { id: 'f3', name: 'Company_Docs.pdf', type: 'application/pdf', url: '#', size: 312000, uploadedAt: '2025-02-15T08:00:00Z', status: 'pending' },
      { id: 'f4', name: 'Tax_Certificate.pdf', type: 'application/pdf', url: '#', size: 98000, uploadedAt: '2025-02-15T08:05:00Z', status: 'pending' },
    ],
    createdAt: '2025-02-15T07:00:00Z',
  },
  {
    id: 'comp-003', name: 'PixelPerfect Studio', email: 'admin@pixelperfect.com', status: 'pending',
    credits: 0, creditLimit: 20000, plan: 'enterprise',
    adminId: 'u3', userCount: 0,
    files: [
      { id: 'f5', name: 'Legal_Entity_Proof.pdf', type: 'application/pdf', url: '#', size: 421000, uploadedAt: '2025-03-01T11:00:00Z', status: 'pending' },
    ],
    createdAt: '2025-03-01T10:30:00Z',
  },
  {
    id: 'comp-004', name: 'MediaBlaze Inc', email: 'admin@mediablaze.com', status: 'rejected',
    credits: 0, creditLimit: 0, plan: 'free',
    adminId: 'u4', userCount: 0,
    files: [],
    createdAt: '2025-02-01T09:00:00Z',
  },
];

const STATUS_COLORS = {
  pending:   { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  approved:  { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
  rejected:  { bg: '#fee2e2', color: '#b91c1c', label: 'Rejected' },
  suspended: { bg: '#f3f4f6', color: '#374151', label: 'Suspended' },
};

export default function CompaniesPage() {
  const { user, isAdmin } = useAuth();
  // FIX: Removed unused 'const router = useRouter();'
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [selected, setSelected] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');

  if (!isAdmin) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Access denied.</div>;
  }

  const filtered = companies.filter(c => {
    if (activeTab === 'pending')  return c.status === 'pending';
    if (activeTab === 'approved') return c.status === 'approved';
    return true;
  });

  function approveCompany(id: string) {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: user?.name } : c));
    toast.success('Company approved');
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'approved' } : null);
  }

  function rejectCompany(id: string) {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
    toast.error('Company rejected');
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'rejected' } : null);
  }

  function approveFile(companyId: string, fileId: string) {
    setCompanies(prev => prev.map(c =>
      c.id === companyId
        ? { ...c, files: c.files.map(f => f.id === fileId ? { ...f, status: 'approved' as const, reviewedBy: user?.name } : f) }
        : c
    ));
    toast.success('File approved');
  }

  const pendingCount = companies.filter(c => c.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
            {companies.length} total companies · {pendingCount} pending approval
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'var(--foreground)', color: 'var(--background)',
          border: 'none', borderRadius: '8px',
          fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer',
        }}>
          <Plus size={14} /> Add Company
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--secondary)', borderRadius: '8px', padding: '3px', width: 'fit-content' }}>
        {(['all', 'pending', 'approved'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab ? 'var(--card)' : 'transparent',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)',
              boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : undefined,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'pending' && pendingCount > 0 && (
              <span style={{
                marginLeft: '0.375rem',
                background: '#dc2626', color: 'white',
                borderRadius: '99px', fontSize: '10px',
                padding: '1px 5px', fontWeight: 700,
              }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1rem', alignItems: 'start' }}>

        {/* Table */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Company', 'Status', 'Plan', 'Credits', 'Users', 'Actions'].map(col => (
                  <th key={col} style={{
                    padding: '0.75rem 1rem', textAlign: 'left',
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                    color: 'var(--muted-foreground)', whiteSpace: 'nowrap',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(company => {
                const st = STATUS_COLORS[company.status];
                return (
                  <tr
                    key={company.id}
                    onClick={() => setSelected(selected?.id === company.id ? null : company)}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: selected?.id === company.id ? 'var(--secondary)' : undefined,
                    }}
                    onMouseEnter={e => { if (selected?.id !== company.id) (e.currentTarget as HTMLElement).style.background = 'var(--secondary)'; }}
                    onMouseLeave={e => { if (selected?.id !== company.id) (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{company.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{company.email}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 8px', background: st.bg, color: st.color, borderRadius: '4px' }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>{company.plan}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontSize: 'var(--text-sm)' }}>{company.credits.toLocaleString()}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>/ {company.creditLimit.toLocaleString()}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)' }}>{company.userCount}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        {company.status === 'pending' && (
                          <>
                            <button
                              onClick={e => { e.stopPropagation(); approveCompany(company.id); }}
                              style={{ padding: '0.25rem 0.5rem', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600 }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); rejectCompany(company.id); }}
                              style={{ padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600 }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(selected?.id === company.id ? null : company); }}
                          style={{ padding: '0.25rem 0.5rem', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontSize: 'var(--text-xs)' }}
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
              No companies found
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', position: 'sticky', top: 'calc(var(--header-height) + 1rem)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[
                ['Email', selected.email],
                ['Plan', selected.plan],
                ['Credits', `${selected.credits} / ${selected.creditLimit}`],
                ['Users', selected.userCount.toString()],
                ['Created', new Date(selected.createdAt).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Files */}
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '0.75rem' }}>
                Uploaded Files ({selected.files.length})
              </h4>
              {selected.files.length === 0 ? (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>No files uploaded</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selected.files.map(file => (
                    <div key={file.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--secondary)',
                      borderRadius: '6px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <FileText size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                        <span style={{ fontSize: 'var(--text-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                        {file.status === 'pending' && (
                          <button
                            onClick={() => approveFile(selected.id, file.id)}
                            style={{ padding: '2px 6px', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 600 }}
                          >
                            ✓
                          </button>
                        )}
                        {file.status === 'approved' && (
                          <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 600 }}>✓ Approved</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {selected.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => approveCompany(selected.id)}
                  style={{ flex: 1, padding: '0.5rem', background: '#15803d', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer' }}
                >
                  Approve Company
                </button>
                <button
                  onClick={() => rejectCompany(selected.id)}
                  style={{ flex: 1, padding: '0.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer' }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
