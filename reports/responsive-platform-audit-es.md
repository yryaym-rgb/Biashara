# Platform Responsive + Interaction Audit Report

Generated: 2026-08-15T10:51:59.071Z

## Coverage Summary

- Pages tested: 74
- Pages skipped/unreachable: 5
- Total issues: 64

### Coverage gaps

- Platform authenticated routes skipped: E2E credentials not configured (missing env vars). Guest-accessible routes still audited.
- Missing vars sample: E2E_BUYER_EMAIL, E2E_BUYER_PASSWORD, E2E_SELLER_EMAIL, E2E_SELLER_PASSWORD, E2E_COOP_APPROVED_EMAIL, E2E_COOP_APPROVED_PASSWORD…
- Admin routes skipped: ADMIN_GATE_SECRET, ADMIN_PASSPHRASE, or E2E admin credentials not configured.
- Institution role not audited: no E2E fixture account exists (institution treated like buyer in code; add fixture to extend coverage).
- Locale: es (routes prefixed with /es).

### Skipped routes

| Page | Viewport | Role | Reason |
|------|----------|------|--------|
| /es/marketplace → marketplace-detail | 1440px | guest | no matching link on list page (empty state) |
| /es/marketplace → marketplace-detail | 1024px | guest | no matching link on list page (empty state) |
| /es/marketplace → marketplace-detail | 768px | guest | no matching link on list page (empty state) |
| /es/marketplace → marketplace-detail | 390px | guest | no matching link on list page (empty state) |
| /es/marketplace → marketplace-detail | 360px | guest | no matching link on list page (empty state) |

## Low (64)

### /es @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Comercie con audacia.Intercambie con confianza.C"

### /es/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Cotizaciones de materias primas"

### /es/prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /es/solutions @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Una plataforma. Cuatro formas de comerciar."

### /es/resources @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Comprender el comercio minero en RDC"

### /es/about @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Nuestra misión"

### /es/calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendario Minero"

### /es/calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todo"

### /es/login @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Iniciar sesión"

### /es/marketplace @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos los anuncios"

### /es @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sesión"

### /es @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Comercie con audacia.Intercambie con confianza.C"

### /es/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sesión"

### /es/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Cotizaciones de materias primas"

### /es/prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /es/solutions @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sesión"

### /es/solutions @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Una plataforma. Cuatro formas de comerciar."

### /es/resources @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sesión"

### /es/resources @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Comprender el comercio minero en RDC"

### /es/about @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sesión"

### /es/about @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Nuestra misión"

### /es/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sesión"

### /es/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendario Minero"

### /es/calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todo"

### /es/login @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Iniciar sesión"

### /es/marketplace @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** a .hidden.min-w-0 "Iniciar sesión"

### /es/marketplace @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos los anuncios"

### /es @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Español"

### /es @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Comercie con audacia.Intercambie con confianza.C"

### /es/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Español"

### /es/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Cotizaciones de materias primas"

### /es/prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /es/solutions @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Español"

### /es/solutions @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Una plataforma. Cuatro formas de comerciar."

### /es/resources @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Español"

### /es/resources @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Comprender el comercio minero en RDC"

### /es/about @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Español"

### /es/about @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Nuestra misión"

### /es/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Español"

### /es/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendario Minero"

### /es/calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todo"

### /es/login @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Iniciar sesión"

### /es/marketplace @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.h-10 "Español"

### /es/marketplace @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos los anuncios"

### /es/prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Cotizaciones de materias primas"

### /es/prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /es/solutions @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Una plataforma. Cuatro formas de comerciar."

### /es/resources @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Comprender el comercio minero en RDC"

### /es/about @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Nuestra misión"

### /es/calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendario Minero"

### /es/calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todo"

### /es/login @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Iniciar sesión"

### /es/forgot-password @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.items-center "Enviar enlace de restablecimiento"

### /es/marketplace @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos los anuncios"

### /es/prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Cotizaciones de materias primas"

### /es/prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /es/solutions @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Una plataforma. Cuatro formas de comerciar."

### /es/resources @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Comprender el comercio minero en RDC"

### /es/about @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Nuestra misión"

### /es/calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendario Minero"

### /es/calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todo"

### /es/login @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Iniciar sesión"

### /es/forgot-password @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.items-center "Enviar enlace de restablecimiento"

### /es/marketplace @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Todos los anuncios"

