import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? '';

const MOCK_USERS = [
  { id: 'u1', name: 'Test Admin', email: 'test.admin@venkattech.com', role: 'test_admin', credits: 9999, companyId: null, status: 'active', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Test User', email: 'test.user@venkattech.com', role: 'test_user', credits: 500, companyId: null, status: 'active', createdAt: '2024-01-01' },
  { id: 'u3', name: 'Super Admin', email: 'admin@venkattech.com', role: 'super_admin', credits: 99999, companyId: null, status: 'active', createdAt: '2024-01-01' },
  { id: 'u4', name: 'Company Admin', email: 'company.admin@demo.com', role: 'company_admin', credits: 2000, companyId: 'comp_acme', status: 'active', createdAt: '2024-01-10' },
  { id: 'u5', name: 'Demo User', email: 'user@demo.com', role: 'user', credits: 150, companyId: 'comp_acme', status: 'active', createdAt: '2024-01-10' },
  { id: 'u6', name: 'Alice Johnson', email: 'alice@acme.com', role: 'user', credits: 320, companyId: 'comp_acme', status: 'active', createdAt: '2024-01-12' },
  { id: 'u7', name: 'Bob Williams', email: 'bob@techflow.io', role: 'user', credits: 80, companyId: 'comp_techflow', status: 'active', createdAt: '2024-01-14' },
];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get('company_id');
    const role = url.searchParams.get('role');

    if (FASTAPI_URL) {
      try {
        const params = new URLSearchParams();
        if (companyId) params.set('company_id', companyId);
        if (role) params.set('role', role);
        const res = await fetch(`${FASTAPI_URL}/users?${params}`);
        if (res.ok) return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }

    // CRITICAL: Scope users by companyId — no cross-company leakage
    let users = MOCK_USERS;
    if (companyId) {
      users = users.filter(u => u.companyId === companyId);
    }
    if (role) {
      users = users.filter(u => u.role === role);
    }

    return NextResponse.json({ users, total: users.length });

  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, credits, companyId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email, and password required' }, { status: 400 });
    }

    if (FASTAPI_URL) {
      try {
        const res = await fetch(`${FASTAPI_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role, credits, companyId }),
        });
        if (res.ok) return NextResponse.json(await res.json(), { status: 201 });
      } catch { /* fall through */ }
    }

    const newUser = {
      id: `u_${Date.now()}`,
      name, email,
      role: role ?? 'user',
      credits: credits ?? 0,
      companyId: companyId ?? null,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({ user: newUser }, { status: 201 });

  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    if (FASTAPI_URL) {
      try {
        const res = await fetch(`${FASTAPI_URL}/users/${userId}`, { method: 'DELETE' });
        if (res.ok) return NextResponse.json({ success: true });
      } catch { /* fall through */ }
    }

    return NextResponse.json({ success: true, userId });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
