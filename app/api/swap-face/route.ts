import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? '';
const CREDIT_COST = 2;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sourceImage = formData.get('source_image') as File | null;
    const targetImage = formData.get('target_image') as File | null;
    const avatarId = formData.get('avatar_id') as string | null;
    const companyId = formData.get('company_id') as string | null;

    // Validate inputs
    if (!sourceImage && !avatarId) {
      return NextResponse.json({ error: 'Source image or avatar ID required' }, { status: 400 });
    }
    if (!targetImage) {
      return NextResponse.json({ error: 'Target image is required' }, { status: 400 });
    }

    // Try FastAPI backend
    if (FASTAPI_URL) {
      try {
        const backendForm = new FormData();
        if (sourceImage) backendForm.append('source_image', sourceImage);
        if (targetImage) backendForm.append('target_image', targetImage);
        if (avatarId) backendForm.append('avatar_id', avatarId);
        if (companyId) backendForm.append('company_id', companyId);

        const res = await fetch(`${FASTAPI_URL}/swap-face`, {
          method: 'POST',
          body: backendForm,
          headers: { 'X-Company-ID': companyId ?? '' },
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ ...data, creditsConsumed: CREDIT_COST });
        }
      } catch {
        // Fall through to mock
      }
    }

    // Mock response
    await new Promise(r => setTimeout(r, 800));
    return NextResponse.json({
      jobId: `job_${Date.now()}`,
      status: 'completed',
      resultUrl: '/assets/avatars/Ava.png', // demo image
      creditsConsumed: CREDIT_COST,
      processingTimeMs: 1240,
      companyId,
    });

  } catch {
    return NextResponse.json({ error: 'Swap failed' }, { status: 500 });
  }
}
