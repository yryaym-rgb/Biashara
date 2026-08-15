# Platform Responsive + Interaction Audit Report

Generated: 2026-08-15T10:36:40.916Z

## Coverage Summary

- Pages tested: 74
- Pages skipped/unreachable: 5
- Total issues: 70

### Coverage gaps

- Platform authenticated routes skipped: E2E credentials not configured (missing env vars). Guest-accessible routes still audited.
- Missing vars sample: E2E_BUYER_EMAIL, E2E_BUYER_PASSWORD, E2E_SELLER_EMAIL, E2E_SELLER_PASSWORD, E2E_COOP_APPROVED_EMAIL, E2E_COOP_APPROVED_PASSWORD…
- Admin routes skipped: ADMIN_GATE_SECRET, ADMIN_PASSPHRASE, or E2E admin credentials not configured.
- Institution role not audited: no E2E fixture account exists (institution treated like buyer in code; add fixture to extend coverage).
- Locale: pt (routes prefixed with /pt).

### Skipped routes

| Page | Viewport | Role | Reason |
|------|----------|------|--------|
| /pt/marketplace → marketplace-detail | 1440px | guest | no matching link on list page (empty state) |
| /pt/marketplace → marketplace-detail | 1024px | guest | no matching link on list page (empty state) |
| /pt/marketplace → marketplace-detail | 768px | guest | no matching link on list page (empty state) |
| /pt/marketplace → marketplace-detail | 390px | guest | no matching link on list page (empty state) |
| /pt/marketplace → marketplace-detail | 360px | guest | no matching link on list page (empty state) |

## Low (70)

### /pt @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .group.relative "Soluções"

### /pt @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Negocie com ousadia.Troque com confiança.Cresça "

### /pt/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .group.relative "Soluções"

### /pt/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Preços das matérias-primas"

### /pt/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /pt/solutions @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .group.relative "Soluções"

### /pt/solutions @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Uma plataforma. Quatro formas de negociar."

### /pt/resources @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .group.relative "Soluções"

### /pt/resources @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Compreender o comércio mineiro na RDC"

### /pt/about @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .group.relative "Soluções"

### /pt/about @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "A nossa missão"

### /pt/calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .group.relative "Soluções"

### /pt/calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendário mineiro"

### /pt/calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos"

### /pt/login @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Iniciar sessão"

### /pt/marketplace @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .group.relative "Soluções"

### /pt/marketplace @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos os anúncios"

### /pt @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sessão"

### /pt @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Negocie com ousadia.Troque com confiança.Cresça "

### /pt/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sessão"

### /pt/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Preços das matérias-primas"

### /pt/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /pt/solutions @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sessão"

### /pt/solutions @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Uma plataforma. Quatro formas de negociar."

### /pt/resources @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sessão"

### /pt/resources @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Compreender o comércio mineiro na RDC"

### /pt/about @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sessão"

### /pt/about @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "A nossa missão"

### /pt/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sessão"

### /pt/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendário mineiro"

### /pt/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos"

### /pt/login @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Iniciar sessão"

### /pt/marketplace @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sessão"

### /pt/marketplace @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos os anúncios"

### /pt @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Português"

### /pt @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Negocie com ousadia.Troque com confiança.Cresça "

### /pt/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Português"

### /pt/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Preços das matérias-primas"

### /pt/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /pt/solutions @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Português"

### /pt/solutions @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Uma plataforma. Quatro formas de negociar."

### /pt/resources @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Português"

### /pt/resources @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Compreender o comércio mineiro na RDC"

### /pt/about @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Português"

### /pt/about @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "A nossa missão"

### /pt/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Português"

### /pt/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendário mineiro"

### /pt/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos"

### /pt/login @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Iniciar sessão"

### /pt/marketplace @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Português"

### /pt/marketplace @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos os anúncios"

### /pt/prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Preços das matérias-primas"

### /pt/prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /pt/solutions @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Uma plataforma. Quatro formas de negociar."

### /pt/resources @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Compreender o comércio mineiro na RDC"

### /pt/about @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "A nossa missão"

### /pt/calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendário mineiro"

### /pt/calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos"

### /pt/login @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Iniciar sessão"

### /pt/marketplace @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos os anúncios"

### /pt/prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Preços das matérias-primas"

### /pt/prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /pt/solutions @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Uma plataforma. Quatro formas de negociar."

### /pt/resources @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Compreender o comércio mineiro na RDC"

### /pt/about @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "A nossa missão"

### /pt/calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendário mineiro"

### /pt/calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos"

### /pt/login @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Iniciar sessão"

### /pt/forgot-password @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.items-center "Enviar ligação de redefinição"

### /pt/marketplace @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos os anúncios"

