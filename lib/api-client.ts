/**
 * FastAPI Client
 * Handles all communication with the Python FastAPI backend.
 * Falls back gracefully to Next.js mock API routes when FASTAPI_URL is not set.
 */

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL ?? '';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: object | FormData;
  token?: string;
  companyId?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const session = localStorage.getItem('auth_session');
    if (session) return JSON.parse(session).token;
  } catch { /* ignore */ }
  return null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, companyId } = options;

  const baseUrl = FASTAPI_URL || '';
  const url = `${baseUrl}${endpoint}`;

  const headers: HeadersInit = {};
  const authToken = token ?? getStoredToken();
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (companyId) headers['X-Company-ID'] = companyId;

  let fetchBody: BodyInit | undefined;
  if (body instanceof FormData) {
    fetchBody = body;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: fetchBody });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, err.error ?? err.detail ?? 'Request failed');
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: object; token: string; refreshToken: string }>('/api/auth/login', {
      method: 'POST', body: { email, password },
    }),

  logout: () =>
    request('/api/auth/logout', { method: 'POST' }),
};

// ─── Swap Face ────────────────────────────────────────────────────────────────
export const swapApi = {
  swapFace: (formData: FormData, companyId: string) =>
    request<{ jobId: string; status: string; resultUrl: string; creditsConsumed: number }>(
      '/api/swap-face', { method: 'POST', body: formData, companyId }
    ),
};

// ─── Image Generation ─────────────────────────────────────────────────────────
export const imageApi = {
  generate: (params: { prompt: string; style: string; size: string; count: number; companyId: string }) =>
    request<{ jobId: string; results: { id: string; url: string }[]; creditsConsumed: number }>(
      '/api/generate-image', { method: 'POST', body: params, companyId: params.companyId }
    ),
};

// ─── Video Generation ─────────────────────────────────────────────────────────
export const videoApi = {
  generate: (params: { prompt: string; style: string; duration: string; resolution: string; companyId: string }) =>
    request<{ jobId: string; status: string; resultUrl: string | null; creditsConsumed: number }>(
      '/api/generate-video', { method: 'POST', body: params, companyId: params.companyId }
    ),
};

// ─── Avatar Generation ────────────────────────────────────────────────────────
export const avatarApi = {
  generate: (formData: FormData, companyId: string) =>
    request<{ jobId: string; results: string[]; creditsConsumed: number }>(
      '/api/generate-avatar', { method: 'POST', body: formData, companyId }
    ),
};

// ─── Companies ────────────────────────────────────────────────────────────────
export const companiesApi = {
  list: (status?: string) =>
    request<{ companies: object[]; total: number }>(
      `/api/companies${status ? `?status=${status}` : ''}`
    ),

  get: (companyId: string) =>
    request<{ company: object }>(`/api/companies?company_id=${companyId}`),

  updateStatus: (companyId: string, action: 'approve' | 'reject' | 'suspend', reason?: string) =>
    request('/api/companies', { method: 'PATCH', body: { companyId, action, reason } }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (companyId?: string) =>
    request<{ users: object[]; total: number }>(
      `/api/users${companyId ? `?company_id=${companyId}` : ''}`
    ),

  create: (userData: { name: string; email: string; password: string; role: string; credits: number; companyId?: string }) =>
    request<{ user: object }>('/api/users', { method: 'POST', body: userData }),

  delete: (userId: string) =>
    request('/api/users', { method: 'DELETE', body: { userId } }),
};

// ─── Credits ─────────────────────────────────────────────────────────────────
export const creditsApi = {
  getHistory: (userId: string, companyId?: string) =>
    request<{ transactions: object[]; balance: number }>(
      `/api/credits?user_id=${userId}${companyId ? `&company_id=${companyId}` : ''}`
    ),

  deduct: (userId: string, companyId: string, operation: string, amount: number) =>
    request('/api/credits', { method: 'POST', body: { userId, companyId, operation, amount } }),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  createIntent: (type: 'subscription' | 'credit_pack', productId: string, userId: string, companyId: string) =>
    request<{ clientSecret: string; paymentIntentId: string; product: object }>(
      '/api/payments/create-intent', { method: 'POST', body: { type, productId, userId, companyId } }
    ),
};

// ─── Files ────────────────────────────────────────────────────────────────────
export const filesApi = {
  upload: (file: File, companyId: string, fileType?: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('company_id', companyId);
    if (fileType) form.append('file_type', fileType);
    return request<{ fileId: string; filename: string; status: string }>(
      '/api/files/upload', { method: 'POST', body: form, companyId }
    );
  },

  review: (fileId: string, companyId: string, action: 'approve' | 'reject', reason?: string) =>
    request('/api/files/approve', { method: 'POST', body: { fileId, companyId, action, reason } }),
};

export { ApiError };
