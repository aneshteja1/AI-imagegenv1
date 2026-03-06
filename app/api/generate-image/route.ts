import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? '';
const CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  try {
    const { prompt, style, size, count, companyId } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const totalCredits = CREDIT_COST * (count ?? 1);

    if (FASTAPI_URL) {
      try {
        const res = await fetch(`${FASTAPI_URL}/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Company-ID': companyId ?? '' },
          body: JSON.stringify({ prompt, style, size, count }),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ ...data, creditsConsumed: totalCredits });
        }
      } catch { /* fall through */ }
    }

    // Mock response
    await new Promise(r => setTimeout(r, 600));
    return NextResponse.json({
      jobId: `job_img_${Date.now()}`,
      status: 'completed',
      results: Array.from({ length: count ?? 1 }, (_, i) => ({
        id: `img_${Date.now()}_${i}`,
        url: `/assets/avatars/${['Ava', 'Lora', 'henry', 'mark'][i % 4]}.png`,
        width: 1024, height: 1024,
      })),
      creditsConsumed: totalCredits,
      companyId,
    });

  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
