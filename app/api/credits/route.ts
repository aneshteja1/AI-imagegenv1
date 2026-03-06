import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? '';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const companyId = url.searchParams.get('company_id');

    if (FASTAPI_URL) {
      try {
        const res = await fetch(`${FASTAPI_URL}/credits?user_id=${userId}&company_id=${companyId}`);
        if (res.ok) return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }

    // Mock credit history — scoped to companyId
    const transactions = [
      { id: 't1', type: 'debit', operation: 'face_swap', amount: 2, timestamp: '2024-01-15 14:30', userId, companyId },
      { id: 't2', type: 'debit', operation: 'image_generation', amount: 1, timestamp: '2024-01-15 13:00', userId, companyId },
      { id: 't3', type: 'credit', operation: 'subscription_renewal', amount: 5000, timestamp: '2024-01-01 00:00', userId, companyId },
      { id: 't4', type: 'debit', operation: 'video_generation', amount: 8, timestamp: '2024-01-14 18:45', userId, companyId },
    ];

    return NextResponse.json({ transactions, balance: 3450 });

  } catch {
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId, operation, amount } = await req.json();

    if (!userId || !operation || !amount) {
      return NextResponse.json({ error: 'userId, operation, and amount required' }, { status: 400 });
    }

    const CREDIT_COSTS: Record<string, number> = {
      face_swap: 2, image_generation: 1, video_generation: 5,
      avatar_generation: 3, bulk_generation: 1, virtual_reshoot: 3,
    };

    const cost = CREDIT_COSTS[operation];
    if (!cost) return NextResponse.json({ error: 'Unknown operation' }, { status: 400 });

    if (FASTAPI_URL) {
      try {
        const res = await fetch(`${FASTAPI_URL}/credits/deduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, companyId, operation, amount: cost }),
        });
        if (res.ok) return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: `t_${Date.now()}`, type: 'debit',
        operation, amount: cost, userId, companyId,
        timestamp: new Date().toISOString(),
      },
      newBalance: (amount ?? 0) - cost,
    });

  } catch {
    return NextResponse.json({ error: 'Credit deduction failed' }, { status: 500 });
  }
}
