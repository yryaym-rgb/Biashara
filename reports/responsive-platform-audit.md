# Platform Responsive + Interaction Audit Report

Generated: 2026-08-15T06:18:07.925Z

## Coverage Summary

- Pages tested: 74
- Pages skipped/unreachable: 5
- Total issues: 85

### Coverage gaps

- Platform authenticated routes skipped: E2E credentials not configured (missing env vars). Guest-accessible routes still audited.
- Missing vars sample: E2E_BUYER_EMAIL, E2E_BUYER_PASSWORD, E2E_SELLER_EMAIL, E2E_SELLER_PASSWORD, E2E_COOP_APPROVED_EMAIL, E2E_COOP_APPROVED_PASSWORD…
- Admin routes skipped: ADMIN_GATE_SECRET, ADMIN_PASSPHRASE, or E2E admin credentials not configured.
- Institution role not audited: no E2E fixture account exists (institution treated like buyer in code; add fixture to extend coverage).

### Skipped routes

| Page | Viewport | Role | Reason |
|------|----------|------|--------|
| /marketplace → marketplace-detail | 1440px | guest | no matching link on list page (empty state) |
| /marketplace → marketplace-detail | 1024px | guest | no matching link on list page (empty state) |
| /marketplace → marketplace-detail | 768px | guest | no matching link on list page (empty state) |
| /marketplace → marketplace-detail | 390px | guest | no matching link on list page (empty state) |
| /marketplace → marketplace-detail | 360px | guest | no matching link on list page (empty state) |

## Medium (35)

### / @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2893px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Accueil"

### / @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (20px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Marché"

### / @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1640px² intersection)
- **Elements:** a .group.relative "Accueil" ↔ span .text-[14px].font-bold "BIASHARA"

### / @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2360px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ button .inline-flex.h-10 "FR"

### / @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (210px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ a .hidden.text-[15px] "Se connecter"

### /prices @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2893px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Accueil"

### /prices @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (20px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Marché"

### /prices @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1640px² intersection)
- **Elements:** a .group.relative "Accueil" ↔ span .text-[14px].font-bold "BIASHARA"

### /prices @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2360px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ button .inline-flex.h-10 "FR"

### /prices @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (210px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ a .hidden.text-[15px] "Se connecter"

### /solutions @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2893px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Accueil"

### /solutions @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (20px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Marché"

### /solutions @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1640px² intersection)
- **Elements:** a .group.relative "Accueil" ↔ span .text-[14px].font-bold "BIASHARA"

### /solutions @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2360px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ button .inline-flex.h-10 "FR"

### /solutions @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (210px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ a .hidden.text-[15px] "Se connecter"

### /resources @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2893px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Accueil"

### /resources @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (20px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Marché"

### /resources @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1640px² intersection)
- **Elements:** a .group.relative "Accueil" ↔ span .text-[14px].font-bold "BIASHARA"

### /resources @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2360px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ button .inline-flex.h-10 "FR"

### /resources @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (210px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ a .hidden.text-[15px] "Se connecter"

### /about @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2893px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Accueil"

### /about @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (20px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Marché"

### /about @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1640px² intersection)
- **Elements:** a .group.relative "Accueil" ↔ span .text-[14px].font-bold "BIASHARA"

### /about @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2360px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ button .inline-flex.h-10 "FR"

### /about @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (210px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ a .hidden.text-[15px] "Se connecter"

### /calendar @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2893px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Accueil"

### /calendar @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (20px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Marché"

### /calendar @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1640px² intersection)
- **Elements:** a .group.relative "Accueil" ↔ span .text-[14px].font-bold "BIASHARA"

### /calendar @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2360px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ button .inline-flex.h-10 "FR"

### /calendar @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (210px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ a .hidden.text-[15px] "Se connecter"

### /marketplace @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2893px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Accueil"

### /marketplace @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (20px² intersection)
- **Elements:** a .relative.z-[2] "BIASHARA" ↔ a .group.relative "Marché"

### /marketplace @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1640px² intersection)
- **Elements:** a .group.relative "Accueil" ↔ span .text-[14px].font-bold "BIASHARA"

### /marketplace @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2360px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ button .inline-flex.h-10 "FR"

### /marketplace @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (210px² intersection)
- **Elements:** a .group.relative "Solutions" ↔ a .hidden.text-[15px] "Se connecter"

## Low (50)

### / @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Commercez avec audace.Échangez en confiance.Gran"

### /prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Cotations des matières premières"

### /prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /solutions @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Une plateforme. Quatre façons de commercer."

### /resources @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Comprendre le commerce minier en RDC"

### /about @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Notre mission"

### /calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendrier minier"

### /calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Tous"

### /login @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Connexion"

### /marketplace @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Toutes les annonces"

### / @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Commercez avec audace.Échangez en confiance.Gran"

### /prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Cotations des matières premières"

### /prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /solutions @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Une plateforme. Quatre façons de commercer."

### /resources @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Comprendre le commerce minier en RDC"

### /about @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Notre mission"

### /calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendrier minier"

### /calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Tous"

### /login @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Connexion"

### /marketplace @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Toutes les annonces"

### / @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Commercez avec audace.Échangez en confiance.Gran"

### /prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Cotations des matières premières"

### /prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /solutions @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Une plateforme. Quatre façons de commercer."

### /resources @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Comprendre le commerce minier en RDC"

### /about @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Notre mission"

### /calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendrier minier"

### /calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Tous"

### /login @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Connexion"

### /marketplace @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Toutes les annonces"

### /prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Cotations des matières premières"

### /prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /solutions @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Une plateforme. Quatre façons de commercer."

### /resources @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Comprendre le commerce minier en RDC"

### /about @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Notre mission"

### /calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendrier minier"

### /calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Tous"

### /login @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Connexion"

### /forgot-password @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.items-center "Envoyer le lien de réinitialisation"

### /marketplace @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Toutes les annonces"

### /prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Cotations des matières premières"

### /prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "RDC"

### /solutions @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Une plateforme. Quatre façons de commercer."

### /resources @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Comprendre le commerce minier en RDC"

### /about @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Notre mission"

### /calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .min-w-0.break-words "Calendrier minier"

### /calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Tous"

### /login @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Connexion"

### /forgot-password @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.items-center "Envoyer le lien de réinitialisation"

### /marketplace @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.inline-flex "Toutes les annonces"

