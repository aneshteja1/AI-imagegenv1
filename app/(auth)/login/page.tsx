'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/auth-context';
import { Eye, EyeOff, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTestCreds, setShowTestCreds] = useState(false);

  const TEST_CREDENTIALS = [
    { role: 'Super Admin',    email: 'admin@venkattech.com',       password: 'Admin@1234',       badge: '👑' },
    { role: 'Test Admin',     email: 'test.admin@venkattech.com',  password: 'TestAdmin@1234',   badge: '🧪' },
    { role: 'Company Admin',  email: 'company.admin@demo.com',     password: 'CompAdmin@1234',   badge: '🏢' },
    { role: 'Regular User',   email: 'user@demo.com',              password: 'User@1234',        badge: '👤' },
    { role: 'Test User',      email: 'test.user@venkattech.com',   password: 'TestUser@1234',    badge: '🧪' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      router.replace('/dashboard');
    } else {
      toast.error(result.error ?? 'Login failed');
    }
  }

  function quickFill(cred: typeof TEST_CREDENTIALS[0]) {
    setEmail(cred.email);
    setPassword(cred.password);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(1rem, 3vw, 2rem)',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px', height: '48px',
            background: 'var(--foreground)',
            borderRadius: '12px',
            marginBottom: '1rem',
          }}>
            <Zap size={24} color="var(--background)" />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '0.25rem' }}>
            VenkatTech Studio
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
            Enterprise AI Face Swap Platform
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 4vw, 2rem)',
        }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: '1.5rem' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 0.75rem',
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--foreground)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 2.5rem 0 0.75rem',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--foreground)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--muted-foreground)',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                height: '40px',
                background: 'var(--foreground)',
                color: 'var(--background)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                marginTop: '0.5rem',
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Test Credentials Toggle */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <button
              onClick={() => setShowTestCreds(!showTestCreds)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'none', border: 'none',
                color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)',
                cursor: 'pointer', fontWeight: 500,
              }}
            >
              🧪 Test Credentials
              {showTestCreds ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showTestCreds && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {TEST_CREDENTIALS.map(cred => (
                  <button
                    key={cred.email}
                    onClick={() => quickFill(cred)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--foreground)', fontWeight: 500 }}>
                      {cred.badge} {cred.role}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
                      {cred.email}
                    </span>
                  </button>
                ))}
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                  Click any row to auto-fill credentials
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
