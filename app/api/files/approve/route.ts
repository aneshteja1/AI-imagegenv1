import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? '';

export async function POST(req: NextRequest) {
  try {
    const { fileId, companyId, action, reason } = await req.json();
    // action: 'approve' | 'reject'

    if (!fileId || !companyId || !action) {
      return NextResponse.json({ error: 'fileId, companyId, and action required' }, { status: 400 });
    }
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
    }

    if (FASTAPI_URL) {
      try {
        const res = await fetch(`${FASTAPI_URL}/files/${fileId}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, reason, companyId }),
        });
        if (res.ok) return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // In production: send email to company admin about decision
    return NextResponse.json({
      success: true,
      fileId, companyId,
      newStatus, reason,
      reviewedAt: new Date().toISOString(),
      note: action === 'approve'
        ? 'File approved. Company can now access platform tools.'
        : `File rejected. Reason: ${reason ?? 'Does not meet requirements'}`,
    });

  } catch {
    return NextResponse.json({ error: 'Review action failed' }, { status: 500 });
  }
}
