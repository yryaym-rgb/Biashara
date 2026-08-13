# Platform Responsive + Interaction Audit Report

Generated: 2026-08-13T07:42:58.403Z

## Coverage Summary

- Pages tested: 60
- Pages skipped/unreachable: 5
- Total issues: 201

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

## High (72)

### /prices @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (33×37px): button [role=tab] .relative.pb-3 "RDC"

### /prices @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (57×37px): button [role=tab] .relative.pb-3 "Zambie"

### /prices @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (68×37px): button [role=tab] .relative.pb-3 "Tanzanie"

### /prices @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (48×37px): button [role=tab] .relative.pb-3 "Ghana"

### /prices @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (113×37px): button [role=tab] .relative.pb-3 "Afrique du Sud"

### /prices @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (54×37px): button [role=tab] .relative.pb-3 "Nigeria"

### /prices @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (80×37px): button [role=tab] .relative.pb-3 "Zimbabwe"

### /prices @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (61×37px): button [role=tab] .relative.pb-3 "Rwanda"

### /calendar @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (36×37px): button [role=tab] .relative.pb-3 "Tous"

### /calendar @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (62×37px): button [role=tab] .relative.pb-3 "Enchère"

### /calendar @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (114×37px): button [role=tab] .relative.pb-3 "Gouvernement"

### /calendar @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (92×37px): button [role=tab] .relative.pb-3 "Conférence"

### /calendar @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (42×37px): button [role=tab] .relative.pb-3 "Autre"

### /login @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (81×37px): button [role=tab] .relative.pb-3 "Connexion"

### /login @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (157×37px): button [role=tab] .relative.pb-3 "Connexion avec OTP"

### /login @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /login @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (142×21px): a .text-[13px].font-semibold "Mot de passe oublié ?"

### /register @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (13×16px): input .mt-1.h-4

### /register @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (151×16px): a .font-semibold.text-brand-blue "Conditions d'utilisation"

### /register @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (178×16px): a .font-semibold.text-brand-blue "Politique de confidentialité"

### /register?step=2 @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register?step=2 @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register?step=2 @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (13×16px): input .mt-1.h-4

### /register?step=2 @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (151×16px): a .font-semibold.text-brand-blue "Conditions d'utilisation"

### /register?step=2 @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (178×16px): a .font-semibold.text-brand-blue "Politique de confidentialité"

### /register?step=3 @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register?step=3 @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register?step=3 @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (13×16px): input .mt-1.h-4

### /register?step=3 @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (151×16px): a .font-semibold.text-brand-blue "Conditions d'utilisation"

### /register?step=3 @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (178×16px): a .font-semibold.text-brand-blue "Politique de confidentialité"

### /forgot-password @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (161×19px): a .font-semibold.text-brand-blue "Retour à la connexion"

### /marketplace @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (154×37px): button [role=tab] .relative.pb-3 "Toutes les annonces"

### /marketplace @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (52×37px): button [role=tab] .relative.pb-3 "Cobalt"

### /marketplace @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (49×37px): button [role=tab] .relative.pb-3 "Cuivre"

### /marketplace @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (20×37px): button [role=tab] .relative.pb-3 "Or"

### /marketplace @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (51×37px): button [role=tab] .relative.pb-3 "Coltan"

### /marketplace @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (55×37px): button [role=tab] .relative.pb-3 "Lithium"

### /marketplace @ 390px
- **Category:** tap-target
- **Issue:** undersized tap target (63×37px): button [role=tab] .relative.pb-3 "Diamant"

### /prices @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (33×37px): button [role=tab] .relative.pb-3 "RDC"

### /prices @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (57×37px): button [role=tab] .relative.pb-3 "Zambie"

### /prices @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (68×37px): button [role=tab] .relative.pb-3 "Tanzanie"

### /prices @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (48×37px): button [role=tab] .relative.pb-3 "Ghana"

### /prices @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (113×37px): button [role=tab] .relative.pb-3 "Afrique du Sud"

### /prices @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (54×37px): button [role=tab] .relative.pb-3 "Nigeria"

### /prices @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (80×37px): button [role=tab] .relative.pb-3 "Zimbabwe"

### /prices @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (61×37px): button [role=tab] .relative.pb-3 "Rwanda"

### /resources @ 360px
- **Category:** overflow
- **Issue:** Horizontal overflow: scrollWidth 363px exceeds viewport 360px

### /calendar @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (36×37px): button [role=tab] .relative.pb-3 "Tous"

### /calendar @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (62×37px): button [role=tab] .relative.pb-3 "Enchère"

### /calendar @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (114×37px): button [role=tab] .relative.pb-3 "Gouvernement"

### /calendar @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (92×37px): button [role=tab] .relative.pb-3 "Conférence"

### /calendar @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (42×37px): button [role=tab] .relative.pb-3 "Autre"

### /login @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (81×37px): button [role=tab] .relative.pb-3 "Connexion"

### /login @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (157×37px): button [role=tab] .relative.pb-3 "Connexion avec OTP"

### /login @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /login @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (142×21px): a .text-[13px].font-semibold "Mot de passe oublié ?"

### /register @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register?step=2 @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register?step=2 @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register?step=3 @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /register?step=3 @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (32×32px): button .absolute.right-3

### /forgot-password @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (161×19px): a .font-semibold.text-brand-blue "Retour à la connexion"

### /marketplace @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (154×37px): button [role=tab] .relative.pb-3 "Toutes les annonces"

### /marketplace @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (52×37px): button [role=tab] .relative.pb-3 "Cobalt"

### /marketplace @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (49×37px): button [role=tab] .relative.pb-3 "Cuivre"

### /marketplace @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (20×37px): button [role=tab] .relative.pb-3 "Or"

### /marketplace @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (51×37px): button [role=tab] .relative.pb-3 "Coltan"

### /marketplace @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (55×37px): button [role=tab] .relative.pb-3 "Lithium"

### /marketplace @ 360px
- **Category:** tap-target
- **Issue:** undersized tap target (63×37px): button [role=tab] .relative.pb-3 "Diamant"

## Medium (79)

### /login @ 1440px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R2skvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 1440px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 1440px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 1440px
- **Category:** overlap
- **Issue:** Elements overlap (2416px² intersection)
- **Elements:** a .font-semibold.text-brand-blue "Conditions d'utilisation" ↔ a .font-semibold.text-brand-blue "Politique de confidentialité"

### /register?step=2 @ 1440px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=2 @ 1440px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=2 @ 1440px
- **Category:** overlap
- **Issue:** Elements overlap (2416px² intersection)
- **Elements:** a .font-semibold.text-brand-blue "Conditions d'utilisation" ↔ a .font-semibold.text-brand-blue "Politique de confidentialité"

### /register?step=3 @ 1440px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=3 @ 1440px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=3 @ 1440px
- **Category:** overlap
- **Issue:** Elements overlap (2416px² intersection)
- **Elements:** a .font-semibold.text-brand-blue "Conditions d'utilisation" ↔ a .font-semibold.text-brand-blue "Politique de confidentialité"

### /login @ 1024px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R2skvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 1024px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 1024px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 1024px
- **Category:** overlap
- **Issue:** Elements overlap (2416px² intersection)
- **Elements:** a .font-semibold.text-brand-blue "Conditions d'utilisation" ↔ a .font-semibold.text-brand-blue "Politique de confidentialité"

### /register?step=2 @ 1024px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=2 @ 1024px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=2 @ 1024px
- **Category:** overlap
- **Issue:** Elements overlap (2416px² intersection)
- **Elements:** a .font-semibold.text-brand-blue "Conditions d'utilisation" ↔ a .font-semibold.text-brand-blue "Politique de confidentialité"

### /register?step=3 @ 1024px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=3 @ 1024px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=3 @ 1024px
- **Category:** overlap
- **Issue:** Elements overlap (2416px² intersection)
- **Elements:** a .font-semibold.text-brand-blue "Conditions d'utilisation" ↔ a .font-semibold.text-brand-blue "Politique de confidentialité"

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

### /login @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R2skvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2416px² intersection)
- **Elements:** a .font-semibold.text-brand-blue "Conditions d'utilisation" ↔ a .font-semibold.text-brand-blue "Politique de confidentialité"

### /register?step=2 @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=2 @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=2 @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2416px² intersection)
- **Elements:** a .font-semibold.text-brand-blue "Conditions d'utilisation" ↔ a .font-semibold.text-brand-blue "Politique de confidentialité"

### /register?step=3 @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=3 @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=3 @ 768px
- **Category:** overlap
- **Issue:** Elements overlap (2416px² intersection)
- **Elements:** a .font-semibold.text-brand-blue "Conditions d'utilisation" ↔ a .font-semibold.text-brand-blue "Politique de confidentialité"

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

### /login @ 390px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R2skvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 390px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 390px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=2 @ 390px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=2 @ 390px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=3 @ 390px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=3 @ 390px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /login @ 360px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R2skvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 360px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register @ 360px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=2 @ 360px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=2 @ 360px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=3 @ 360px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:R8svf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

### /register?step=3 @ 360px
- **Category:** overlap
- **Issue:** Elements overlap (1024px² intersection)
- **Elements:** input #:Rasvf6fjsq: .w-full.rounded-button ↔ button .absolute.right-3

## Low (50)

### / @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Commercez avec audace.Échangez en confiance.Gran"

### /prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Cotations des matières premières"

### /prices @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "RDC"

### /solutions @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Une plateforme. Quatre façons de commercer."

### /resources @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Comprendre le commerce minier en RDC"

### /about @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Notre mission"

### /calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Calendrier minier"

### /calendar @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Tous"

### /login @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Connexion"

### /marketplace @ 1440px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Toutes les annonces"

### / @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Commercez avec audace.Échangez en confiance.Gran"

### /prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Cotations des matières premières"

### /prices @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "RDC"

### /solutions @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Une plateforme. Quatre façons de commercer."

### /resources @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Comprendre le commerce minier en RDC"

### /about @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Notre mission"

### /calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Calendrier minier"

### /calendar @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Tous"

### /login @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Connexion"

### /marketplace @ 1024px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Toutes les annonces"

### / @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 .text-[36px].font-bold "Commercez avec audace.Échangez en confiance.Gran"

### /prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Cotations des matières premières"

### /prices @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "RDC"

### /solutions @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Une plateforme. Quatre façons de commercer."

### /resources @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Comprendre le commerce minier en RDC"

### /about @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Notre mission"

### /calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Calendrier minier"

### /calendar @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Tous"

### /login @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Connexion"

### /marketplace @ 768px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Toutes les annonces"

### /prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Cotations des matières premières"

### /prices @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "RDC"

### /solutions @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Une plateforme. Quatre façons de commercer."

### /resources @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Comprendre le commerce minier en RDC"

### /about @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Notre mission"

### /calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Calendrier minier"

### /calendar @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Tous"

### /login @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Connexion"

### /forgot-password @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.items-center "Envoyer le lien de réinitialisation"

### /marketplace @ 390px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Toutes les annonces"

### /prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Cotations des matières premières"

### /prices @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "RDC"

### /solutions @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Une plateforme. Quatre façons de commercer."

### /resources @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Comprendre le commerce minier en RDC"

### /about @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Notre mission"

### /calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** h1 "Calendrier minier"

### /calendar @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Tous"

### /login @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Connexion"

### /forgot-password @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button .inline-flex.items-center "Envoyer le lien de réinitialisation"

### /marketplace @ 360px
- **Category:** text-truncation
- **Issue:** Text may be truncated, clipped, or awkwardly wrapped
- **Elements:** button [role=tab] .relative.pb-3 "Toutes les annonces"

