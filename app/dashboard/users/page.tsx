'use client';

import { useState } from 'react';
import { useAuth, MOCK_USERS } from '@/app/context/auth-context';
import type { User, UserRole } from '@/lib/types';
import { getRoleLabel } from '@/lib/utils';
import { Plus, X, Search, Edit, Trash2, Key } from 'lucide-react';
import { toast } from 'sonner';

const ROLES: UserRole[] = ['user', 'company_admin', 'admin', 'super_admin'];

export default function UsersPage() {
  const { user: currentUser, isAdmin, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>(
    MOCK_USERS.filter(u => !isSuperAdmin ? u.companyId === currentUser?.companyId : true)
  );
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' as UserRole, credits: 500 });

  if (!isAdmin) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Access denied.</div>;
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function addUser() {
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: form.email,
      name: form.name,
      role: form.role,
      companyId: currentUser?.companyId,
      companyName: currentUser?.companyName,
      credits: form.credits,
      creditLimit: form.credits,
      createdAt: new Date().toISOString(),
      status: 'active',
      language: 'en',
    };
    setUsers(prev => [...prev, newUser]);
    setForm({ name: '', email: '', password: '', role: 'user', credits: 500 });
    setShowAdd(false);
    toast.success(`User ${newUser.name} created!`);
  }

  function deleteUser(id: string) {
    if (id === currentUser?.id) { toast.error("Can't delete yourself"); return; }
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('User deleted');
  }

  function resetPassword(u: User) {
    toast.success(`Password reset email sent to ${u.email}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            style={{
              width: '100%', height: '36px',
              padding: '0 0.75rem 0 2.25rem',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '8px', fontSize: 'var(--text-sm)',
              color: 'var(--foreground)', outline: 'none',
            }}
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--foreground)', color: 'var(--background)',
            border: 'none', borderRadius: '8px',
            fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer',
          }}
        >
          <Plus size={14} /> Add User
        </button>
      </div>

      {/* Add User Form */}
      {showAdd && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Add New User</h3>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {[
              { key: 'name',     label: 'Full Name',  type: 'text',     placeholder: 'John Doe' },
              { key: 'email',    label: 'Email',       type: 'email',    placeholder: 'john@company.com' },
              { key: 'password', label: 'Password',    type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(form as Record<string, string>)[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  style={{
                    width: '100%', height: '36px',
                    padding: '0 0.75rem',
                    background: 'var(--background)', border: '1px solid var(--border)',
                    borderRadius: '6px', fontSize: 'var(--text-sm)',
                    color: 'var(--foreground)', outline: 'none',
                  }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Role</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                style={{
                  width: '100%', height: '36px',
                  padding: '0 0.75rem',
                  background: 'var(--background)', border: '1px solid var(--border)',
                  borderRadius: '6px', fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)', outline: 'none',
                }}
              >
                {ROLES.filter(r => isSuperAdmin ? true : r !== 'super_admin').map(r => (
                  <option key={r} value={r}>{getRoleLabel(r)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Initial Credits</label>
              <input
                type="number"
                value={form.credits}
                onChange={e => setForm(f => ({ ...f, credits: Number(e.target.value) }))}
                style={{
                  width: '100%', height: '36px', padding: '0 0.75rem',
                  background: 'var(--background)', border: '1px solid var(--border)',
                  borderRadius: '6px', fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)', outline: 'none',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: '0.5rem 1rem', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>Cancel</button>
            <button onClick={addUser} style={{ padding: '0.5rem 1rem', background: 'var(--foreground)', color: 'var(--background)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>Create User</button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['User', 'Role', 'Company', 'Credits', 'Status', 'Actions'].map(col => (
                <th key={col} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'var(--foreground)', color: 'var(--background)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '12px', flexShrink: 0,
                    }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{u.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                    padding: '2px 8px',
                    background: 'var(--secondary)', borderRadius: '4px',
                  }}>
                    {getRoleLabel(u.role)}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                  {u.companyName ?? '—'}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{u.credits.toLocaleString()}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>/ {u.creditLimit.toLocaleString()}</div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                    background: u.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: u.status === 'active' ? '#15803d' : '#b91c1c',
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button title="Reset password" onClick={() => resetPassword(u)} style={{ padding: '0.25rem', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}>
                      <Key size={12} />
                    </button>
                    <button title="Delete user" onClick={() => deleteUser(u.id)} style={{ padding: '0.25rem', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#b91c1c', display: 'flex' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
