'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Save, Eye, EyeOff, Key, Bell, Shield, Globe, User, Building } from 'lucide-react';

export default function SettingsPage() {
  const { user, language, setLanguage } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: '', timezone: 'UTC' });
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({ email: true, creditLow: true, jobComplete: true, weeklyReport: false, marketing: false });
  const [api, setApi] = useState({ webhookUrl: '', webhookSecret: '' });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
    ...(user?.role === 'company_admin' ? [{ id: 'company', label: 'Company', icon: Building }] : []),
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  const inputStyle = {
    width: '100%', padding: '0.75rem', border: '1px solid var(--border)',
    borderRadius: '0.5rem', background: 'var(--background)', color: 'var(--foreground)',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'Satoshi, sans-serif'
  };

  const labelStyle = { display: 'block' as const, fontSize: '0.875rem', fontWeight: 600 as const, marginBottom: '0.5rem', color: 'var(--foreground)' };

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', color: 'var(--foreground)' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Manage your account preferences
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Sidebar Tabs */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '0.5rem' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.375rem', border: 'none',
                background: activeTab === tab.id ? 'var(--surface-2)' : 'transparent',
                color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: activeTab === tab.id ? 600 : 400,
                textAlign: 'left', transition: 'all 0.15s', marginBottom: '0.125rem'
              }}>
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>Profile Information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input style={inputStyle} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input style={inputStyle} type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input style={inputStyle} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label style={labelStyle}>Timezone</label>
                    <select style={inputStyle} value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Asia/Tbilisi">Tbilisi (Georgia)</option>
                    </select>
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                    <strong style={{ color: 'var(--foreground)' }}>Role:</strong> {user?.role?.replace('_', ' ').toUpperCase()} &nbsp;·&nbsp;
                    <strong style={{ color: 'var(--foreground)' }}>Credits:</strong> {user?.credits} &nbsp;·&nbsp;
                    <strong style={{ color: 'var(--foreground)' }}>Member since:</strong> Jan 2024
                  </p>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>Change Password</h2>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inputStyle, paddingRight: '2.5rem' }} type={showPassword ? 'text' : 'password'} value={security.currentPassword} onChange={e => setSecurity(s => ({ ...s, currentPassword: e.target.value }))} placeholder="Enter current password" />
                    <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input style={inputStyle} type="password" value={security.newPassword} onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))} placeholder="Minimum 8 characters" />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input style={inputStyle} type="password" value={security.confirmPassword} onChange={e => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))} placeholder="Repeat new password" />
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                    Password must be at least 8 characters and include uppercase, lowercase, and a number.
                  </p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>Notification Preferences</h2>
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive account updates via email' },
                  { key: 'creditLow', label: 'Low Credit Warning', desc: 'Alert when credits fall below 20% of plan' },
                  { key: 'jobComplete', label: 'Job Completion', desc: 'Notify when generation jobs finish' },
                  { key: 'weeklyReport', label: 'Weekly Report', desc: 'Usage summary every Monday morning' },
                  { key: 'marketing', label: 'Product Updates', desc: 'News about new features and promotions' },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.125rem' }}>{item.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px',
                        background: notifications[item.key as keyof typeof notifications] ? 'var(--foreground)' : 'var(--border)',
                        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: '3px',
                        left: notifications[item.key as keyof typeof notifications] ? '23px' : '3px',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Language Tab */}
            {activeTab === 'language' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>Language & Region</h2>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {[
                    { code: 'en', flag: '🇬🇧', label: 'English', native: 'English' },
                    { code: 'ge', flag: '🇬🇪', label: 'Georgian', native: 'ქართული' },
                  ].map(lang => (
                    <button key={lang.code} onClick={() => setLanguage(lang.code as 'en' | 'ge')} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                      border: `2px solid ${language === lang.code ? 'var(--foreground)' : 'var(--border)'}`,
                      borderRadius: '0.75rem', background: language === lang.code ? 'var(--surface-2)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                    }}>
                      <span style={{ fontSize: '1.75rem' }}>{lang.flag}</span>
                      <div>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>{lang.label}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{lang.native}</p>
                      </div>
                      {language === lang.code && (
                        <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--background)' }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === 'company' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>Company Settings</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Company Name</label>
                    <input style={inputStyle} defaultValue="Demo Corp" />
                  </div>
                  <div>
                    <label style={labelStyle}>Company Website</label>
                    <input style={inputStyle} placeholder="https://example.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>Business Email</label>
                    <input style={inputStyle} type="email" placeholder="business@company.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>Industry</label>
                    <select style={inputStyle}>
                      <option>Media & Entertainment</option>
                      <option>Marketing & Advertising</option>
                      <option>E-Commerce</option>
                      <option>Technology</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#ca8a04' }}>
                    ⚠️ Company changes require admin approval before taking effect.
                  </p>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>API Configuration</h2>
                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '0.5rem', fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                  <p style={{ marginBottom: '0.25rem' }}>Your API Key:</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <code style={{ flex: 1, color: 'var(--foreground)', letterSpacing: '0.05em' }}>sk-••••••••••••••••••••••••••••{user?.id?.slice(-6)}</code>
                    <button style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border)', borderRadius: '0.375rem', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Reveal
                    </button>
                    <button style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--border)', borderRadius: '0.375rem', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Webhook URL</label>
                  <input style={inputStyle} value={api.webhookUrl} onChange={e => setApi(a => ({ ...a, webhookUrl: e.target.value }))} placeholder="https://your-server.com/webhook" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Receive real-time job status updates</p>
                </div>
                <div>
                  <label style={labelStyle}>Webhook Secret</label>
                  <input style={inputStyle} type="password" value={api.webhookSecret} onChange={e => setApi(a => ({ ...a, webhookSecret: e.target.value }))} placeholder="Used to verify webhook authenticity" />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <button onClick={handleSave} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
                background: saved ? 'var(--surface-2)' : 'var(--foreground)',
                color: saved ? 'var(--foreground)' : 'var(--background)',
                border: '1px solid var(--border)', borderRadius: '0.5rem',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s'
              }}>
                <Save size={15} />
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
