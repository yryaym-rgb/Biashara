# Platform Responsive + Interaction Audit Report

Generated: 2026-08-15T10:44:25.207Z

## Coverage Summary

- Pages tested: 74
- Pages skipped/unreachable: 5
- Total issues: 66

### Coverage gaps

- Platform authenticated routes skipped: E2E credentials not configured (missing env vars). Guest-accessible routes still audited.
- Missing vars sample: E2E_BUYER_EMAIL, E2E_BUYER_PASSWORD, E2E_SELLER_EMAIL, E2E_SELLER_PASSWORD, E2E_COOP_APPROVED_EMAIL, E2E_COOP_APPROVED_PASSWORD…
- Admin routes skipped: ADMIN_GATE_SECRET, ADMIN_PASSPHRASE, or E2E admin credentials not configured.
- Institution role not audited: no E2E fixture account exists (institution treated like buyer in code; add fixture to extend coverage).
- Locale: en (routes prefixed with /en).

### Skipped routes

| Page | Viewport | Role | Reason |
|------|----------|------|--------|
| /en/marketplace → marketplace-detail | 1440px | guest | no matching link on list page (empty state) |
| /en/marketplace → marketplace-detail | 1024px | guest | no matching link on list page (empty state) |
| /en/marketplace → marketplace-detail | 768px | guest | no matching link on list page (empty state) |
| /en/marketplace → marketplace-detail | 390px | guest | no matching link on list page (empty state) |
| /en/marketplace → marketplace-detail | 360px | guest | no matching link on list page (empty state) |

## Low (66)

### /en @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Trade boldly.Exchange with confidence.Grow toget"

### /en/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Commodity prices"

### /en/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "DRC"

### /en/solutions @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "One platform. Four ways to trade."

### /en/resources @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Understanding mining trade in the DRC"

### /en/about @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Our mission"

### /en/calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Mining calendar"

### /en/calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "All"

### /en/login @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Sign in"

### /en/marketplace @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "All listings"

### /en @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Sign in"

### /en @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Trade boldly.Exchange with confidence.Grow toget"

### /en/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Sign in"

### /en/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Commodity prices"

### /en/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "DRC"

### /en/solutions @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Sign in"

### /en/solutions @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "One platform. Four ways to trade."

### /en/resources @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Sign in"

### /en/resources @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Understanding mining trade in the DRC"

### /en/about @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Sign in"

### /en/about @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Our mission"

### /en/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Sign in"

### /en/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Mining calendar"

### /en/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "All"

### /en/login @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Sign in"

### /en/marketplace @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Sign in"

### /en/marketplace @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "All listings"

### /en @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "EN"

### /en @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Trade boldly.Exchange with confidence.Grow toget"

### /en/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "EN"

### /en/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Commodity prices"

### /en/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "DRC"

### /en/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Copper"

### /en/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "USD"

### /en/solutions @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "EN"

### /en/solutions @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "One platform. Four ways to trade."

### /en/resources @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "EN"

### /en/resources @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Understanding mining trade in the DRC"

### /en/about @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "EN"

### /en/about @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Our mission"

### /en/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "EN"

### /en/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Mining calendar"

### /en/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "All"

### /en/login @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Sign in"

### /en/marketplace @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "EN"

### /en/marketplace @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "All listings"

### /en @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Trade boldly.Exchange with confidence.Grow toget"

### /en/prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Commodity prices"

### /en/prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "DRC"

### /en/solutions @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "One platform. Four ways to trade."

### /en/resources @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Understanding mining trade in the DRC"

### /en/about @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Our mission"

### /en/calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Mining calendar"

### /en/calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "All"

### /en/login @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Sign in"

### /en/marketplace @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "All listings"

### /en @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Trade boldly.Exchange with confidence.Grow toget"

### /en/prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Commodity prices"

### /en/prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "DRC"

### /en/solutions @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "One platform. Four ways to trade."

### /en/resources @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Understanding mining trade in the DRC"

### /en/about @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Our mission"

### /en/calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Mining calendar"

### /en/calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "All"

### /en/login @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Sign in"

### /en/marketplace @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "All listings"

