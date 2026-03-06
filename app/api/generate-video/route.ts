import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, style, duration, resolution, referenceImageUrl, companyId } = body;

    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const durationCredits: Record<string, number> = { '3': 5, '5': 8, '10': 15, '15': 20 };
    const resCredits: Record<string, number> = { '720p': 0, '1080p': 2, '4k': 5 };
    const totalCredits = (durationCredits[duration] ?? 8) + (resCredits[resolution] ?? 2);

    if (FASTAPI_URL) {
      try {
        const res = await fetch(`${FASTAPI_URL}/generate-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Company-ID': companyId ?? '' },
          body: JSON.stringify(body),
        });
        if (res.ok) return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }

    await new Promise(r => setTimeout(r, 1000));
    return NextResponse.json({
      jobId: `job_vid_${Date.now()}`,
      status: 'completed',
      resultUrl: null, // would be presigned URL in production
      duration, resolution, style,
      creditsConsumed: totalCredits,
      companyId,
    });

  } catch {
    return NextResponse.json({ error: 'Video generation failed' }, { status: 500 });
  }
}
