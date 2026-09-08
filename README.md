# BobbyGames 🇰🇭

Original Cambodian browser mini-games created for **Say Rithy (Bobby)**, a Junior–Mid Web Developer based in Phnom Penh.

- **Mango Catch** — fruit, hazards, lives and combos in the countryside.
- **Temple Tower** — precision stacking with a fictional Khmer-inspired sandstone design.
- **Tuk-Tuk Rush** — three-lane driving through an original Phnom Penh-inspired street.
- **Khmer Market Match** — accessible market memory cards, 6/8/12 pairs, local bests ranked by fewer moves then faster active time.

Made with creativity in Cambodia. [Bobby’s portfolio](https://sayrithy-portfolio.vercel.app/) · [GitHub](https://github.com/Rithy089) · [LinkedIn](https://www.linkedin.com/in/rithy-say-a59aa32a0/)

[Project source code](https://github.com/Rithy089/Bobbygames) is separate from Bobby’s personal GitHub profile. The September update retains guest progress, adds eight original illustrated Cambodia topics and improves in-game art/controls. Supabase rollout remains deliberately deferred. See [update scope](docs/UPDATE-2026-09.md), [asset/source register](docs/UPDATE-ASSETS.md) and [Khmer review queue](docs/KHMER-REVIEW.md).

## Local development

Node 22.13+ and npm are required.

```sh
npm ci
npm run dev
```

Guest play works without credentials. The development server prints its local URL. The portal includes catalog/search/category/sort, game detail and player routes, favorites, recent play, profiles, achievements, leaderboards, EN/Khmer, light/dark/system, Cambodia discovery, developer information, privacy, terms and 404.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run build
npm run test:e2e
npm run secrets
npm audit
```

See [actual results and limitations](docs/VERIFICATION.md). Browser tests use the production build and desktop/mobile Chromium. Database permission tests use PGlite’s PostgreSQL engine. Auth tests mock the external service; they do not prove email delivery.

## Supabase setup

1. Create or select a Supabase project. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (a public publishable/anon key, never a service-role key).
2. Apply both SQL migrations in supabase/migrations, in filename order, via the Supabase CLI or SQL editor. The catalog and achievement definitions are migration-owned; no fake leaderboard scores are seeded.
3. In Auth URL configuration set the site URL and allow the deployed /profile and /reset-password URLs (plus localhost when developing). Enable email confirmations. Configure your own SMTP provider and rate limits for public use.
4. Rebuild with the public environment values. Run a real signup, confirmation, login, password reset, profile edit, favorite sync and accepted-score smoke test on the target project before public launch.
5. Inspect Supabase’s database/security advisors and verify anon/authenticated permissions. Do not disable RLS.

The account UI clearly indicates when the service is unconfigured. Local scores are never directly uploaded. Accepted account scores require a server-created gameplay session. Generated avatar colors avoid upload/storage moderation requirements; Supabase Storage is intentionally not needed for version one.

## Deployment

A Vercel configuration is included. Import this repository into Vercel, configure the VITE_ public values and VITE_SITE_URL with your real origin, and use npm run build with output dist. Routes receive static metadata/OG HTML at build time and client navigation uses React Router. Fonts and game art are local, hashed JS/CSS receive immutable caching on Vercel.

.openai/hosting.json identifies the project’s Sites preview. The app can also be deployed as static assets with a SPA fallback. The separate Supabase migration files are never bundled as public assets. A private preview can demonstrate guest gameplay before the external account service is connected.

## Architecture and ownership

- src/app — shared layout and lazy routes.
- src/components — reusable portal/game UI; components/ui retains scaffolded accessible primitives.
- src/games/{game}/rules.ts — scoring/difficulty, tested independently.
- src/games/{game}/engine.ts — isolated scene and rendering.
- src/games/shared — lifecycle/input/audio contract. Exiting a route cancels frames, removes listeners and closes audio.
- src/features — optional account sync/auth and feature-detected WebMCP navigation.
- src/lib — catalog, structured Cambodia facts, state, Supabase client and SEO.
- src/i18n — English and reviewable Khmer drafts, English fallback.
- supabase — migration-based schema, RLS, session/score RPCs.
- docs — plan, security limits, asset provenance, review notes and case study.

Future games plug into the same GameOptions/Engine contract, receive catalog/translation entries, isolated imports, scoring tests and explicit server score bounds. Angkor Runner, Khmer Tile Match, Mekong Boat Journey, Khmer New Year Celebration, Cambodian Food Memory Match and Rice Field Adventure are roadmap ideas, not playable listings.

See [security](docs/SECURITY.md), [assets and cultural sources](docs/ASSETS.md), [Khmer review](docs/KHMER-REVIEW.md), [case study](docs/CASE-STUDY.md). No commercial game assets or copied portal source are used.
