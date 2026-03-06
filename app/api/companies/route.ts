import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? '';

const MOCK_COMPANIES = [
  {
    id: 'comp_acme', name: 'Acme Corp', email: 'admin@acme.com', status: 'approved',
    plan: 'professional', credits: 3450, totalCreditsUsed: 1550,
    usersCount: 12, filesCount: 3, createdAt: '2024-01-10',
    address: '123 Main St, New York, NY', phone: '+1-555-0100',
    files: [
      { id: 'f1', name: 'business_license.pdf', status: 'approved', uploadedAt: '2024-01-10' },
      { id: 'f2', name: 'company_profile.pdf', status: 'approved', uploadedAt: '2024-01-10' },
    ]
  },
  {
    id: 'comp_techflow', name: 'TechFlow Solutions', email: 'admin@techflow.io', status: 'pending',
    plan: 'starter', credits: 800, totalCreditsUsed: 200,
    usersCount: 4, filesCount: 2, createdAt: '2024-01-13',
    address: '456 Tech Ave, San Francisco, CA', phone: '+1-555-0200',
    files: [
      { id: 'f3', name: 'registration.pdf', status: 'pending', uploadedAt: '2024-01-13' },
      { id: 'f4', name: 'tax_certificate.pdf', status: 'pending', uploadedAt: '2024-01-13' },
    ]
  },
  {
    id: 'comp_pixel', name: 'PixelPerfect Studio', email: 'hi@pixelperfect.design', status: 'pending',
    plan: 'starter', credits: 1000, totalCreditsUsed: 0,
    usersCount: 2, filesCount: 1, createdAt: '2024-01-14',
    address: '789 Design Blvd, Los Angeles, CA', phone: '+1-555-0300',
    files: [
      { id: 'f5', name: 'business_registration.pdf', status: 'pending', uploadedAt: '2024-01-14' },
    ]
  },
  {
    id: 'comp_media', name: 'MediaBlaze Inc', email: 'ops@mediablaze.com', status: 'rejected',
    plan: 'enterprise', credits: 0, totalCreditsUsed: 5200,
    usersCount: 0, filesCount: 2, createdAt: '2023-12-01',
    address: '321 Media Park, Austin, TX', phone: '+1-555-0400',
    files: [
      { id: 'f6', name: 'license.pdf', status: 'rejected', uploadedAt: '2023-12-01' },
    ]
  },
];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const companyId = url.searchParams.get('company_id');

    // Single-tenant scope: if company_id is provided, only return that company
    if (companyId) {
      const company = MOCK_COMPANIES.find(c => c.id === companyId);
      if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      return NextResponse.json({ company });
    }

    if (FASTAPI_URL) {
      try {
        const res = await fetch(`${FASTAPI_URL}/companies${status ? `?status=${status}` : ''}`, {
          headers: { 'X-Admin': 'true' },
        });
        if (res.ok) return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }

    const companies = status ? MOCK_COMPANIES.filter(c => c.status === status) : MOCK_COMPANIES;
    return NextResponse.json({ companies, total: companies.length });

  } catch {
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { companyId, action, reason } = await req.json();
    // action: 'approve' | 'reject' | 'suspend'

    if (!companyId || !action) {
      return NextResponse.json({ error: 'companyId and action required' }, { status: 400 });
    }

    const statusMap: Record<string, string> = { approve: 'approved', reject: 'rejected', suspend: 'suspended' };
    const newStatus = statusMap[action];
    if (!newStatus) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    if (FASTAPI_URL) {
      try {
        const res = await fetch(`${FASTAPI_URL}/companies/${companyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, reason }),
        });
        if (res.ok) return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }

    return NextResponse.json({ success: true, companyId, newStatus, reason });

  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
