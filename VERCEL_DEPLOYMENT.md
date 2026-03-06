# VERCEL DEPLOYMENT PACKAGE
# venkatTech Enterprise AI Fashion Platform
# Frontend - Next.js 15 Application

## WHAT THIS PACKAGE CONTAINS
All files in this zip run on Vercel only.
Nothing here should be deployed to Azure.

## VERCEL ENVIRONMENT VARIABLES (Dashboard > Settings > Environment Variables)
Only add these - all others go to Azure Key Vault:

NEXT_PUBLIC_APP_NAME=FaceSwap AI Platform
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
NEXT_PUBLIC_FASTAPI_URL=https://your-fastapi.azurewebsites.net
FASTAPI_URL=https://your-fastapi.azurewebsites.net
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

DO NOT ADD TO VERCEL:
- JWT_SECRET
- STRIPE_SECRET_KEY
- DATABASE_URL
- AZURE_STORAGE_CONNECTION_STRING
- GOOGLE_VERTEX_AI_CREDENTIALS
- NANO_BANANA_PRO2_KEY
All of the above belong in Azure Key Vault only.

## DEPLOY COMMAND
Connect this repo to Vercel.
Build Command: npm run build
Output Directory: .next
Install Command: npm install

## MISSING FILES THAT MUST BE CREATED BEFORE DEPLOY
app/(auth)/register/page.tsx          - Registration page (MISSING)
app/dashboard/virtual-reshoot/page.tsx - Virtual reshoot UI (MISSING)
app/dashboard/audit-logs/page.tsx     - Audit log viewer (MISSING)
app/api/auth/register/route.ts        - Register proxy route (EMPTY)
app/api/auth/logout/route.ts          - Logout route (EMPTY)
app/api/bulk-generate/route.ts        - Bulk generate proxy (EMPTY)
app/api/payments/webhook/route.ts     - Stripe webhook receiver (EMPTY)
app/api/generate-avatar/route.ts      - Avatar generation proxy (EMPTY)
app/error.tsx                         - Error boundary (MISSING)
app/global-error.tsx                  - Global error boundary (MISSING)
app/not-found.tsx                     - 404 page (MISSING)

## BUGS TO FIX BEFORE FIRST DEPLOY
1. JSX syntax error in app/dashboard/swap-model/page.tsx onError handler
2. Remove hardcoded passwords from app/api/auth/login/route.ts
3. Move token from localStorage to httpOnly cookie
4. Add 3840 and 7680 to deviceSizes in next.config.mjs for 4K/8K support
5. Add Content-Security-Policy and HSTS headers to next.config.mjs
6. Fix api-client.ts to read from correct storage key
7. Fix isTest vs isTestMode mismatch in mock users
8. Remove silent mock fallback in production - throw 503 if FastAPI unavailable
