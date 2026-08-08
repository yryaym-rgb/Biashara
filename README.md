# BIASHARA

Plateforme B2B de production pour le négoce minier, la traçabilité et les transactions sécurisées en République démocratique du Congo. Prend en charge les marchés du cobalt, du cuivre, de l'or, du coltan, du lithium et du diamant.

## Stack technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Framework | Next.js 14 App Router + TypeScript strict | SSR, server actions, déploiement Netlify |
| Base de données | Supabase Postgres + RLS | Postgres managé avec sécurité au niveau des lignes |
| Authentification | Supabase Auth | E-mail/mot de passe avec e-mails transactionnels intégrés |
| Validation | Zod | Source unique de vérité via `z.infer<>` |
| État serveur | TanStack Query | Données serveur mises en cache, pas de Zustand prématuré |
| i18n | next-intl | FR par défaut (`/dashboard`), EN préfixé (`/en/dashboard`) |
| Déploiement | Netlify + `@netlify/plugin-nextjs` | Hébergement Next.js managé |

## Architecture

```
[Navigateur]
    │
    ▼
[Middleware Next.js]
    ├── Résolution de locale (next-intl, localePrefix: as-needed)
    ├── Rafraîchissement de session (cookies @supabase/ssr)
    └── Contrôle RBAC (lib/rbac.ts → canAccessRoute)
    │
    ▼
[Server Components / Server Actions]
    ├── Validation Zod (lib/validators/*)
    ├── Autorisation (requireRole, requireKycApproved)
    └── Assainissement (lib/sanitize.ts)
    │
    ▼
[Client Supabase (serveur)] ──► [Postgres + politiques RLS]
    │
    ▼
[Buckets Storage] ◄── URLs signées (kyc-docs, listing-photos, contracts)

[API metals.dev] ──► [/api/prices] ──► [table price_cache] ──► [Navigateur]
                         │
                    cache TTL 15 min
                    coltan/diamond : price=null, priceType=indicative
```

## Structure du projet

```
app/
  [locale]/
    (marketing)/     accueil, cotations, solutions, ressources, à propos
    (auth)/          connexion, inscription, mot de passe oublié, vérification
    (platform)/      tableau de bord, place de marché, offres, commandes, …
    (admin)/         administration, utilisateurs, révision KYC, …
  api/               /health, /prices
lib/
  supabase/          clients navigateur, serveur, admin (service-role), middleware
  auth/              helpers de session, actions d'authentification
  rbac.ts            requireRole(), requireKycApproved(), canAccessRoute()
  validators/        un fichier schéma Zod par domaine
  constants/         minerals.ts, kyc-requirements.ts
  email.ts           abstraction e-mail (Supabase maintenant, Resend plus tard)
actions/             toutes les mutations (server actions validées par Zod)
types/               database.types.ts (généré), domain.ts (exports z.infer)
messages/            fr.json (canonique), en.json (traduction)
supabase/migrations/ SQL versionné (13 migrations)
```

## Démarrage rapide

### Prérequis

- Node.js 20+
- Supabase CLI (`npm i -g supabase`)
- Docker (pour Supabase local)

### Installation

```bash
# Cloner et installer les dépendances
npm install

# Variables d'environnement
cp .env.example .env
# Renseigner l'URL Supabase, la clé anon, la clé service role, METALS_API_KEY

# Démarrer Supabase local et appliquer les migrations
supabase start
supabase db reset

# Régénérer les types TypeScript (optionnel — stub inclus)
npm run types:gen

# Créer l'utilisateur administrateur (une fois)
npx tsx scripts/create-admin.ts

# Développement
npm run dev
```

### Vérification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### Tests end-to-end (Playwright)

Les tests e2e visitent chaque route publique, chaque page d'authentification, l'espace plateforme (session utilisateur réelle) et l'administration (porte secrète + phrase de passe + connexion admin). Chaque test attend le rendu de la page, puis échoue si une `console.error` ou une exception non interceptée se produit — c'est le garde-fou principal contre les boucles de rendu React et les erreurs d'hydratation.

**Prérequis**

1. Supabase local (ou projet de test) démarré avec les migrations appliquées (`supabase start` puis `supabase db reset`).
2. Un utilisateur plateforme et un administrateur créés (voir `npx tsx scripts/create-admin.ts` pour l'admin).
3. Variables dans `.env` (voir `.env.example`) :

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000
E2E_USER_EMAIL=test@example.com
E2E_USER_PASSWORD=...
E2E_ADMIN_EMAIL=admin@biashara.cd
E2E_ADMIN_PASSWORD=...
ADMIN_GATE_SECRET=your-secret-gate-segment
ADMIN_PASSPHRASE=your-admin-passphrase
```

**Exécution**

```bash
# Build de production puis suite e2e (Playwright démarre `npm run start` automatiquement)
npm run build
npm run test:e2e
```

Pour cibler uniquement les pages marketing sans authentification :

```bash
npx playwright test --project=guest
```

**Checklist PR** : tout changement touchant l'interface (`components/`, `app/`, styles) doit passer `npm run test:e2e` en local avant merge.

## Architecture de sécurité

### Autorisation

- **Surface unique** : `lib/rbac.ts` — le middleware appelle `canAccessRoute()`, les server actions appellent `requireRole()` / `requireKycApproved()`
- **RLS sur chaque table** : les politiques lisent `profiles.role` directement, pas les claims JWT obsolètes
- **Ne jamais utiliser `user_metadata`** pour l'autorisation — uniquement `app_metadata` / table `profiles`
- **Service role** : `lib/supabase/admin.ts` a `import 'server-only'` + ESLint bloque l'import côté client

### Documents KYC requis par rôle

| Rôle | Documents requis |
|------|------------------|
| buyer | id_card |
| institution | id_card, business_registration |
| seller | id_card, business_registration |
| cooperative | id_card, business_registration, mining_permit |

Appliqué dans `lib/constants/kyc-requirements.ts` et `actions/kyc.ts`.

### Création de commande

Les commandes sont créées **uniquement** via la fonction SECURITY DEFINER `create_order_from_offer()` — accepte l'offre de façon atomique, fige prix/quantité, expire les offres sœurs, marque l'annonce comme vendue. Une transaction, aucun état partiel.

### Buckets Storage

| Bucket | Accès |
|--------|-------|
| kyc-docs | Privé — propriétaire + admin en lecture |
| listing-photos | Lecture publique — écriture propriétaire |
| contracts | Privé — parties de la commande + admin |

### Journal d'audit

Table `audit_log` en append-only — INSERT via déclencheurs Postgres sur kyc_documents, listings, offers, orders. Aucun droit UPDATE/DELETE.

### Modèle de menaces

| Menace | Atténuation |
|--------|-------------|
| Escalade de privilèges | Rôle dans `profiles` + RLS ; admin via `is_admin()` |
| IDOR | RLS limité aux parties ; les server actions re-valident la propriété |
| XSS | `lib/sanitize.ts` à l'écriture ; React échappe à la lecture |
| Fuite service role | garde server-only + règle ESLint |
| Altération de l'audit | audit_log INSERT-only ; basé sur des déclencheurs |
| Abus d'API | Rate limit sur `/api/prices` (60 req/min/IP) |

## Plan de phases

### Phase 1 (semaines 1–3) : Fondation, Auth+KYC, Place de marché, Cotations, Messagerie

| Composant | Routes | Tables |
|-----------|--------|--------|
| Fondation | tous les stubs | migrations 00001–00002 |
| Auth | `(auth)/*` | profiles |
| KYC | settings | kyc_documents, storage kyc-docs |
| Place de marché | marketplace, marketplace/[id] | listings, listing_photos |
| Cotations | prices, /api/prices | price_cache |
| Messagerie | détail annonce | conversations, messages |

### Phase 2 (semaines 4–6) : Offres, Commandes, Contrats, Tableau de bord, Admin

| Composant | Routes | Tables |
|-----------|--------|--------|
| Offres | offers | offers |
| Commandes | orders | orders (via create_order_from_offer) |
| Contrats | contracts | contracts, storage contracts |
| Paiements | payments (stub) | — (décision métier Phase 2) |
| Tableau de bord | dashboard | lectures croisées |
| Admin | (admin)/* | toutes + audit_log |

### Phase 3 (semaines 7–8) : Traçabilité, Expéditions, Notifications, Rapports, Durcissement

| Composant | Routes | Tables |
|-----------|--------|--------|
| Traçabilité | détail annonce, reports | lot_traceability, custody_events |
| Logistique | logistics | shipments |
| Notifications | cloche en-tête | notifications |
| Rapports | reports | requêtes analytiques |
| E2E | — | suite de tests Playwright |

## Routes API

### `GET /api/health`

Contrôle de santé pour Netlify. Retourne `{ status, timestamp, version }`.

### `GET /api/prices`

Proxy des cotations spot metals.dev avec cache de 15 minutes dans `price_cache`.

Forme de réponse par minerai :

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

Le coltan et le diamant retournent toujours `price: null` avec `isIndicative: true` — l'interface affiche « Prix indicatif — négocié ».

## Génération des types

```bash
npm run types:gen
```

Régénère `types/database.types.ts` depuis Supabase local. Le stub commité correspond aux migrations — régénérer après toute modification de schéma.

## Système de design

Les règles d'implémentation de l'interface sont dans `.cursor/rules/biashara-design-system.mdc`. Écrans de référence : `design/reference-screens.png`.

## Internationalisation

- **Locale par défaut** : `fr` avec `localePrefix: 'as-needed'` — le français est servi à `/dashboard`, l'anglais à `/en/dashboard`
- **Source canonique** : `messages/fr.json` — rédigé en premier en français professionnel
- **Traduction** : `messages/en.json` — traduction fidèle de la version française
- **Formatage** : `Intl.DateTimeFormat('fr-FR')` et `Intl.NumberFormat('fr-FR')` via `lib/utils/format.ts` et `lib/utils/dates.ts`

## Licence

Propriétaire — plateforme BIASHARA.
