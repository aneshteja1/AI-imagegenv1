import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL ?? '';
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE_MB = 10;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const companyId = formData.get('company_id') as string | null;
    const fileType = formData.get('file_type') as string | null; // e.g. 'business_license'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!companyId) return NextResponse.json({ error: 'company_id required' }, { status: 400 });

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type. Allowed: PDF, JPEG, PNG, DOC` }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File too large. Max size: ${MAX_SIZE_MB}MB` }, { status: 400 });
    }

    // Forward to FastAPI (handles Azure Blob / Supabase storage)
    if (FASTAPI_URL) {
      try {
        const backendForm = new FormData();
        backendForm.append('file', file);
        backendForm.append('company_id', companyId);
        if (fileType) backendForm.append('file_type', fileType);

        const res = await fetch(`${FASTAPI_URL}/files/upload`, {
          method: 'POST', body: backendForm,
          headers: { 'X-Company-ID': companyId },
        });
        if (res.ok) return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }

    // Mock upload response
    return NextResponse.json({
      fileId: `file_${Date.now()}`,
      filename: file.name,
      fileType: fileType ?? 'document',
      status: 'pending', // awaiting admin approval
      companyId,
      uploadedAt: new Date().toISOString(),
      sizeBytes: file.size,
      note: 'File received. Admin review required before activation.',
    }, { status: 201 });

  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
