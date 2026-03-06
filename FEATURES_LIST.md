# COMPLETE FEATURES LIST
# venkatTech Enterprise AI Fashion Platform

## ROLES (6 total)
super_admin     Full platform control. Manages all companies, users, revenue, and settings.
test_admin      Full tools access plus test mode banner. For QA and development testing.
company_admin   Manages own company only. Sees own users, billing, images, and analytics.
user            Standard access. Uses AI tools within company credit allowance.
test_user       Standard tools plus test mode flag. Sandbox credits for QA testing.
admin           Defined in types.ts but has no mock user or documented permissions. Needs clarification.

NOTE: admin role exists in the TypeScript type definition but is orphaned.
It has no mock user, no documented permissions, and no sidebar access map entry.
This must be resolved before production.

## AI GENERATION TOOLS (6 tools)
Face Swap             2 credits per swap. Upload model photo and target face.
Image Generation      1 credit per image. Select LoRA avatar, upload garment, generate.
Video Generation      5 to 25 credits. Cost formula based on duration and resolution.
Avatar Generation     3 credits per avatar. Upload reference photos to create LoRA identity.
Bulk Generation       1 to 2 credits per image. Upload ZIP of garments, process in batch.
Virtual Reshoot       3 credits per output. Replace mannequin or flat-lay with avatar wearing garment.

## CREDIT SYSTEM
Per-operation deduction at point of confirmed AI success (not on request)
Per-company credit pools with individual credit limits per user
Credit balance shown in header on every page
Negative balance prevention enforced on FastAPI
Credit transaction history with operation type, amount, and timestamp

CREDIT TOP-UP PACKS (4 options):
500 credits
2000 credits
5000 credits
15000 credits
Each pack requires a separate Stripe product and price ID on Azure FastAPI.

## SUBSCRIPTION PLANS (4 tiers)
free            $0 per month
starter         $29 per month
professional    $79 per month
enterprise      $199 per month
Monthly and yearly billing toggle (yearly saves approximately 20 percent)
Subscription expiry warning sent by email 3 days before renewal

## PAYMENT SYSTEM
Stripe integration for all subscriptions and credit top-ups
Payment intent created by FastAPI only (Stripe secret key never in Vercel)
Stripe webhook receiver validates signatures on FastAPI
Failed payments logged to audit trail
Stripe customer ID stored per company in PostgreSQL

## AUTHENTICATION
5 test credential pairs in README for development and QA
JWT access token plus refresh token rotation
7-day token expiry
httpOnly Secure SameSite Strict cookies (target state, currently localStorage)
Role-based access control on every page and every API route
Company data isolation enforced via X-Company-ID header on all requests

## COMPANY MANAGEMENT
Company registration with multi-step approval workflow
Pending, approved, rejected, and suspended company statuses
Company admin sees only their own company data
Super admin sees all companies
Per-company credit pools separate from individual user credits
Company file upload for compliance documents
Admin approval or rejection of uploaded files with reason required

## MULTI-TENANT ARCHITECTURE
Complete data isolation between companies
No cross-company data leakage possible
X-Company-ID header on every API request validated against JWT claims
PostgreSQL Row Level Security enforced on all tables
N companies supported with zero configuration changes

## INTERNATIONALISATION
English (en) — 80 translation keys
Georgian (ge) — 80 translation keys, must always match English exactly
Language persisted per user in settings
Language toggle in header on every page
document.lang attribute updated on language change for screen readers

## DASHBOARD PAGES (12 pages)
Main Dashboard        Credit balance, recent job history, usage statistics
Face Swap             Upload model and target, see result
Image Generation      Avatar selector, garment upload, single image output
Video Generation      Avatar selector, garment upload, duration selector, video output
Avatar Generation     Reference photo upload, LoRA training job submission
Bulk Generation       ZIP upload, batch processing, bulk download of all results
Virtual Reshoot       Person photo plus garment photo, category selector, output
Analytics             Usage charts, API cost tracking, Recharts visualisations
Billing               Current plan, credit balance, upgrade and top-up options
User Management       Admin only. List, invite, suspend, delete users.
Company Management    Admin only. List, approve, reject, suspend companies.
Settings              Theme selector, language toggle, profile editing
Failed Jobs           Review failed AI jobs, retry with adjusted parameters

MISSING PAGES (must be built):
Register              2-step wizard for new user and company signup
Virtual Reshoot       UI page exists in audit but not in zip
Audit Logs            Searchable table of all platform events with CSV export

## THEME SYSTEM
Dark mode
Light mode
System mode (follows OS preference, updates automatically)
Theme toggle in sidebar bottom and in settings page
Theme applied before React hydration (no white flash)
Black, grey, and white design palette throughout

## NAVIGATION (Sidebar)
Role-based section groups:
Tools section          visible to all roles — AI generation tools
Advanced section       visible to admin roles only
Manage section         visible to company admin and above
TEST MODE banner       visible when user has isTest flag set to true

## PERFORMANCE FEATURES
Next.js 15 App Router with React 19
Tailwind CSS 4 with CSS custom properties
Satoshi font family (10 weight files)
Fluid typography using CSS clamp across all screen sizes
Loading skeleton screens on all dashboard routes (target state, missing in zip)
Lazy loading on all non-critical images
Font preloading to prevent FOIT on first load
jszip for bulk download of generated images
next-themes for flash-free theme switching

## ANALYTICS AND MONITORING (Admin)
Per-user and per-company credit usage charts
API cost tracking per operation type
Image and video generation counts
User activity over time
Failed job rate tracking
Azure Monitor and Application Insights on FastAPI side
Sentry on Vercel frontend side

## SECURITY FEATURES (implemented and planned)
RBAC on all routes
Company data isolation via X-Company-ID validation
Self-delete prevention on user delete route
File type allowlist on uploads (explicit allow, not blocklist)
Rejection reason required when rejecting company files
User enumeration protection (same error for wrong email and wrong password)
robots.txt set to noindex nofollow for the private platform

SECURITY FEATURES TO BE ADDED:
httpOnly cookies for token storage
Redis-backed rate limiting
CSRF protection
Content-Security-Policy header
Strict-Transport-Security header
Permissions-Policy header
Email verification on registration
Magic byte file validation
Signed Blob URLs with 1-hour expiry
IP-based and per-account brute force detection
