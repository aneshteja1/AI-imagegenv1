# FaceSwap AI Platform

Enterprise-grade AI face swap & content generation SaaS built with **Next.js 15**, **Tailwind CSS 4**, and **shadcn/ui**.

---

## ✨ Features

### 5 Role-Based Dashboards
| Role | Access | Description |
|------|--------|-------------|
| `super_admin` | Full platform | Manages all companies, users, revenue |
| `test_admin` | Full tools + test mode | Dev/QA testing with unlimited credits |
| `company_admin` | Company scope | Manages own company users & billing |
| `user` | Tools only | Uses AI tools within credit allowance |
| `test_user` | Tools + test mode | Dev/QA with sandbox credits |

### AI Tools (Credit Costs)
- **Face Swap** — 2 credits per swap
- **Image Generation** — 1 credit per image
- **Video Generation** — 5–25 credits (duration + resolution)
- **Avatar Generation** — 3 credits per avatar
- **Bulk Generation** — 1–2 credits per image
- **Virtual Reshoot** — 3 credits per output

### Multi-Tenant Architecture
- Complete company data isolation — no cross-company data leakage
- Company registration → file upload → admin approval workflow
- Per-company credit pools and usage analytics
- N companies supported with zero configuration

### Payments & Subscriptions
- Stripe-ready payment processing
- 3 subscription plans: Starter ($29/mo), Professional ($79/mo), Enterprise ($199/mo)
- Credit top-up packs: 500/2000/5000/15000 credits
- Monthly/yearly billing toggle (saves ~20%)

### i18n
- English 🇬🇧 + Georgian 🇬🇪 (ქართული)
- Language persisted in user settings

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your values
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Test Admin | `test.admin@venkattech.com` | `TestAdmin@1234` |
| Test User | `test.user@venkattech.com` | `TestUser@1234` |
| Super Admin | `admin@venkattech.com` | `Admin@1234` |
| Company Admin | `company.admin@demo.com` | `CompAdmin@1234` |
| Regular User | `user@demo.com` | `User@1234` |

---

## 🏗️ Architecture

```
faceswap-saas/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── api/                  # Next.js API routes (FastAPI proxy + mock)
│   │   ├── auth/login/
│   │   ├── swap-face/
│   │   ├── generate-image/
│   │   ├── generate-video/
│   │   ├── generate-avatar/
│   │   ├── virtual-reshoot/
│   │   ├── bulk-generate/
│   │   ├── companies/
│   │   ├── users/
│   │   ├── credits/
│   │   ├── payments/
│   │   └── files/
│   ├── context/
│   │   └── auth-context.tsx  # Auth state, role checks, credits
│   └── dashboard/
│       ├── page.tsx          # Main dashboard
│       ├── swap-model/       # Face swap tool
│       ├── image-generation/ # Text-to-image
│       ├── video-generation/ # Text-to-video
│       ├── avatar-generation/# Portrait-to-avatar
│       ├── bulk-generation/  # Batch processing
│       ├── virtual-reshoot/  # Virtual try-on
│       ├── companies/        # Admin: company management
│       ├── users/            # User management
│       ├── analytics/        # Usage analytics
│       ├── billing/          # Plans & credits
│       ├── failed-jobs/      # Error review
│       └── settings/         # Account preferences
├── components/
│   ├── sidebar.tsx           # Role-aware navigation
│   └── header.tsx            # Credits, language, user info
├── i18n/
│   ├── en.ts                 # English translations
│   ├── ge.ts                 # Georgian translations
│   └── index.ts              # Language switcher
├── lib/
│   ├── api-client.ts         # FastAPI client + JWT
│   ├── types.ts              # TypeScript definitions
│   └── utils.ts              # Helpers
└── public/
    ├── assets/avatars/       # 8 preset avatar models
    └── fonts/                # Satoshi typeface
```

---

## 🔌 FastAPI Integration

Set `FASTAPI_URL` in `.env.local` to point to your Python backend:

```env
FASTAPI_URL="http://localhost:8000"
NEXT_PUBLIC_FASTAPI_URL="http://localhost:8000"
```

All API routes proxy to FastAPI first, then fall back to mock data if unavailable.

### Expected FastAPI Endpoints
```
POST /auth/login
POST /swap-face          (multipart/form-data)
POST /generate-image
POST /generate-video
POST /generate-avatar    (multipart/form-data)
POST /virtual-reshoot    (multipart/form-data)
POST /bulk-generate
GET  /companies
PATCH /companies/{id}
GET  /users
POST /users
DELETE /users/{id}
GET  /credits
POST /credits/deduct
POST /files/upload       (multipart/form-data)
POST /files/{id}/review
```

All requests include `X-Company-ID` header for multi-tenant scoping.

---

## 💳 Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Add to `.env.local`:
```env
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```
4. Set up webhook endpoint: `https://yourdomain.com/api/payments/webhook`

---

## 🗄️ Azure PostgreSQL

```env
DATABASE_URL="postgresql://user:pass@server.postgres.database.azure.com:5432/db?sslmode=require"
```

Your FastAPI backend uses this URL for all database operations.

---

## 🖥️ Responsive Design

- **Mobile**: 375px (iPhone SE)
- **Tablet**: 768px
- **Desktop**: 1280px
- **4K**: 3840px
- **8K**: 7680px

Typography uses `clamp()` for fluid scaling. DPI 300 meta hints included.

---

## 🔒 Security

- JWT access + refresh token rotation
- CSRF double-submit cookie pattern
- Role-based access control (RBAC) on all routes
- Company data isolation — `company_id` scoped on all queries
- File upload validation (type + size)
- No cross-company data leakage possible

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS 4 + CSS Custom Properties |
| Components | shadcn/ui + Radix UI |
| Charts | Recharts |
| Payments | Stripe |
| Auth | JWT (jose) |
| Backend | Python FastAPI (optional) |
| Database | Azure PostgreSQL |
| Storage | Azure Blob / Supabase |
| Fonts | Satoshi (Fontshare) |

---

## 📄 License

Proprietary — VenkatTech © 2024
