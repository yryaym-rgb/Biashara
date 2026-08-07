# BIASHARA

Production B2B platform for mineral trading, traceability, and secure transactions in the Democratic Republic of Congo. Supports cobalt, copper, gold, coltan, lithium, and diamond markets.

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 App Router + TypeScript strict | SSR, server actions, Netlify deployment |
| Database | Supabase Postgres + RLS | Managed Postgres with row-level security |
| Auth | Supabase Auth | Email/password with built-in transactional email |
| Validation | Zod | Single source of truth via `z.infer<>` |
| Server state | TanStack Query | Cached server data, no premature Zustand |
| i18n | next-intl | FR default (`/dashboard`), EN prefixed (`/en/dashboard`) |
| Deployment | Netlify + `@netlify/plugin-nextjs` | Managed Next.js hosting |

## Architecture

```
[Browser]
    │
    ▼
[Next.js Middleware]
    ├── Locale resolution (next-intl, localePrefix: as-needed)
    ├── Session refresh (@supabase/ssr cookies)
    └── RBAC gate (lib/rbac.ts → canAccessRoute)
    │
    ▼
[Server Components / Server Actions]
    ├── Zod validation (lib/validators/*)
    ├── Authorization (requireRole, requireKycApproved)
    └── Sanitization (lib/sanitize.ts)
    │
    ▼
[Supabase Client (server)] ──► [Postgres + RLS policies]
    │
    ▼
[Storage buckets] ◄── signed URLs (kyc-docs, listing-photos, contracts)

[metals.dev API] ──► [/api/prices] ──► [price_cache table] ──► [Browser]
                         │
                    15-min TTL cache
                    coltan/diamond: price=null, priceType=indicative
```

## Project Structure

```
app/
  [locale]/
    (marketing)/     landing, prices, solutions, resources, about
    (auth)/          login, register, forgot-password, verify
    (platform)/      dashboard, marketplace, offers, orders, …
    (admin)/         admin dashboard, users, kyc-review, …
  api/               /health, /prices
lib/
  supabase/          browser, server, admin (service-role), middleware clients
  auth/              session helpers, auth actions
  rbac.ts            requireRole(), requireKycApproved(), canAccessRoute()
  validators/        one Zod schema file per domain
  constants/         minerals.ts, kyc-requirements.ts
  email.ts           email abstraction (Supabase now, Resend later)
actions/             all mutations (Zod-validated server actions)
types/               database.types.ts (generated), domain.ts (z.infer exports)
messages/            fr.json (default), en.json
supabase/migrations/ versioned SQL (13 migrations)
```

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase CLI (`npm i -g supabase`)
- Docker (for local Supabase)

### Setup

```bash
# Clone and install
npm install

# Environment
cp .env.example .env
# Fill in Supabase URL, anon key, service role key, METALS_API_KEY

# Start local Supabase and apply migrations
supabase start
supabase db reset

# Regenerate TypeScript types (optional — stub included)
npm run types:gen

# Create admin user (one-time)
npx tsx scripts/create-admin.ts

# Development
npm run dev
```

### Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Security Architecture

### Authorization

- **Single surface**: `lib/rbac.ts` — middleware calls `canAccessRoute()`, server actions call `requireRole()` / `requireKycApproved()`
- **RLS on every table**: policies read `profiles.role` directly, not stale JWT claims
- **Never use `user_metadata`** for authorization — only `app_metadata` / `profiles` table
- **Service role**: `lib/supabase/admin.ts` has `import 'server-only'` + ESLint blocks client import

### KYC Requirements by Role

| Role | Required documents |
|------|--------------------|
| buyer | id_card |
| institution | id_card, business_registration |
| seller | id_card, business_registration |
| cooperative | id_card, business_registration, mining_permit |

Enforced in `lib/constants/kyc-requirements.ts` and `actions/kyc.ts`.

### Order Creation

Orders are created **only** via `create_order_from_offer()` SECURITY DEFINER function — atomically accepts offer, snapshots price/qty, expires sibling offers, marks listing sold. One transaction, no partial states.

### Storage Buckets

| Bucket | Access |
|--------|--------|
| kyc-docs | Private — owner + admin read |
| listing-photos | Public read — owner write |
| contracts | Private — order parties + admin |

### Audit Log

Append-only `audit_log` table — INSERT via Postgres triggers on kyc_documents, listings, offers, orders. No UPDATE/DELETE grants.

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Privilege escalation | Role in `profiles` + RLS; admin via `is_admin()` |
| IDOR | RLS party-scoped; server actions re-validate ownership |
| XSS | `lib/sanitize.ts` on write; React escapes on read |
| Service role leak | server-only guard + ESLint rule |
| Audit tampering | INSERT-only audit_log; trigger-based |
| API abuse | Rate limit on `/api/prices` (60 req/min/IP) |

## Phase Plan

### Phase 1 (Weeks 1–3): Foundation, Auth+KYC, Marketplace, Price Feed, Messaging

| Component | Routes | Tables |
|-----------|--------|--------|
| Foundation | all stubs | migrations 00001–00002 |
| Auth | `(auth)/*` | profiles |
| KYC | settings | kyc_documents, storage kyc-docs |
| Marketplace | marketplace, marketplace/[id] | listings, listing_photos |
| Price feed | prices, /api/prices | price_cache |
| Messaging | listing detail | conversations, messages |

### Phase 2 (Weeks 4–6): Offers, Orders, Contracts, Dashboard, Admin

| Component | Routes | Tables |
|-----------|--------|--------|
| Offers | offers | offers |
| Orders | orders | orders (via create_order_from_offer) |
| Contracts | contracts | contracts, storage contracts |
| Payments | payments (stub) | — (Phase 2 business decision) |
| Dashboard | dashboard | cross-table reads |
| Admin | (admin)/* | all + audit_log |

### Phase 3 (Weeks 7–8): Traceability, Shipments, Notifications, Reports, Hardening

| Component | Routes | Tables |
|-----------|--------|--------|
| Traceability | listing detail, reports | lot_traceability, custody_events |
| Logistics | logistics | shipments |
| Notifications | header bell | notifications |
| Reports | reports | analytics queries |
| E2E | — | Playwright test suite |

## API Routes

### `GET /api/health`

Health check for Netlify. Returns `{ status, timestamp, version }`.

### `GET /api/prices`

Proxies metals.dev spot prices with 15-minute cache in `price_cache`.

Response shape per mineral:

```json
{
  "minerals": [
    {
      "mineral": "cobalt",
      "price": 33500,
      "currency": "USD",
      "unit": "MT",
      "priceType": "fixed",
      "source": "metals.dev",
      "fetchedAt": "2026-08-07T05:00:00Z",
      "isIndicative": false
    },
    {
      "mineral": "coltan",
      "price": null,
      "currency": "USD",
      "unit": "kg",
      "priceType": "indicative",
      "source": "none",
      "fetchedAt": "2026-08-07T05:00:00Z",
      "isIndicative": true
    }
  ],
  "cachedAt": "2026-08-07T05:00:00Z",
  "fromCache": true
}
```

Coltan and diamond always return `price: null` with `isIndicative: true` — UI renders "Prix indicatif — négocié".

## Type Generation

```bash
npm run types:gen
```

Regenerates `types/database.types.ts` from local Supabase. The committed stub matches migrations — regenerate after any schema change.

## Design System

UI implementation rules are in `.cursor/rules/biashara-design-system.mdc`. Reference screens: `design/reference-screens.png`.

## License

Proprietary — BIASHARA platform.
