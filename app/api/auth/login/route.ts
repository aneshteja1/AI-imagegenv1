import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? '';

// Mock users for development (matches auth-context.tsx)
const MOCK_USERS = [
  { id: 'u1', email: 'test.admin@venkattech.com', password: 'TestAdmin@1234', role: 'test_admin', name: 'Test Admin', credits: 9999, companyId: null, isTestMode: true },
  { id: 'u2', email: 'test.user@venkattech.com', password: 'TestUser@1234', role: 'test_user', name: 'Test User', credits: 500, companyId: null, isTestMode: true },
  { id: 'u3', email: 'admin@venkattech.com', password: 'Admin@1234', role: 'super_admin', name: 'Super Admin', credits: 99999, companyId: null, isTestMode: false },
  { id: 'u4', email: 'company.admin@demo.com', password: 'CompAdmin@1234', role: 'company_admin', name: 'Company Admin', credits: 2000, companyId: 'comp_acme', isTestMode: false },
  { id: 'u5', email: 'user@demo.com', password: 'User@1234', role: 'user', name: 'Demo User', credits: 150, companyId: 'comp_acme', isTestMode: false },
];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Try FastAPI backend first
    if (FASTAPI_URL) {
      try {
        const res = await fetch(`${FASTAPI_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fall through to mock
      }
    }

    // Mock authentication
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...safeUser } = user;
    const token = Buffer.from(JSON.stringify({ ...safeUser, iat: Date.now(), exp: Date.now() + 86400000 })).toString('base64');

    return NextResponse.json({
      user: safeUser,
      token,
      refreshToken: token + '_refresh',
    });

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
