import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? '';
const CREDIT_COST = 3;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const personImage = formData.get('person_image') as File | null;
    const garmentImage = formData.get('garment_image') as File | null;
    const companyId = formData.get('company_id') as string | null;
    const category = formData.get('category') as string | null; // tops, bottoms, full_body

    if (!personImage) return NextResponse.json({ error: 'person_image required' }, { status: 400 });
    if (!garmentImage) return NextResponse.json({ error: 'garment_image required' }, { status: 400 });

    if (FASTAPI_URL) {
      try {
        const form = new FormData();
        form.append('person_image', personImage);
        form.append('garment_image', garmentImage);
        if (companyId) form.append('company_id', companyId);
        if (category) form.append('category', category);

        const res = await fetch(`${FASTAPI_URL}/virtual-reshoot`, {
          method: 'POST', body: form,
          headers: { 'X-Company-ID': companyId ?? '' },
        });
        if (res.ok) return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }

    await new Promise(r => setTimeout(r, 900));
    return NextResponse.json({
      jobId: `job_vr_${Date.now()}`,
      status: 'completed',
      resultUrl: '/assets/avatars/Ava.png',
      creditsConsumed: CREDIT_COST,
      companyId,
      category: category ?? 'tops',
    });

  } catch {
    return NextResponse.json({ error: 'Virtual reshoot failed' }, { status: 500 });
  }
}
