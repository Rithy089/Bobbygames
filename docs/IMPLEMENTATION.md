# BobbyGames implementation and acceptance plan

Original Cambodian arcade by Say Rithy (Bobby). React + strict TypeScript + Vite, React Router, Tailwind, Zustand, i18next, TanStack Query, optional Supabase. Adapt the generated Sites scaffold to the user's preferred Vite SPA architecture; retain reusable primitives. Native Canvas keeps three games lightweight, isolated and testable.

Visual direction: a midnight-blue arcade with sandstone highlights, vibrant game dioramas and restrained textile geometry. Light/dark/system share accessible tokens.

## Phases and acceptance
1. Foundation: responsive portal/catalog, routing, tokens, EN/Khmer, themes, auth shell, schema/RLS, developer/culture foundations. Types, lint, foundation tests, build, secret scan. Commit: feat: establish bilingual Cambodian arcade foundation.
2. Mango Catch: keyboard/pointer/touch, fruit/hazards/lives/combo, progression, pause/restart/game-over, best scores and audio. Rules and lifecycle tests plus shared gates. Commit: feat: add complete Mango Catch game.
3. Player platform: auth/reset/profile, preferences/favorites sync, statistics/achievements, public rankings, server session and score RPCs. Validate invalid/duplicate/cross-user submissions; SQL tests where possible. Shared gates. Commit: feat: add player profiles and protected leaderboards.
4. Additional games: Temple Tower and Tuk-Tuk Rush with independent loading, rules and controls. Shared gates plus browser tests. Commit: feat: add Temple Tower and Tuk-Tuk Rush.
5. Polish: sourced culture content, reviewable Khmer, accessibility/mobile QA, SEO/social previews/sitemap, documentation/case study, security review and deployment. Full gates. Commit: feat: polish Cambodia discovery and production delivery.

## Risks and release conditions
- External Supabase project configuration and real email delivery need credentials. Honest unavailable/empty states, no fabricated rankings. Never claim external integration passed without execution.
- Client scores cannot be cheat-proof. Server-created expiring single-use sessions, bounds, rates, ownership, locks, suspicious logs and closed direct writes reduce abuse.
- Khmer translations are drafts for Bobby/native-speaker review with English fallback.
- All game assets are original. Fantasy tower is explicitly fictional; factual culture descriptions use primary sources. No flag game objects.
- Never expose private personal data or browser service-role keys.
- Vercel configuration is provided. Sites preview is private unless explicitly changed; public account launch requires Supabase deployment.
- Record actual checks in VERIFICATION.md. No unverifiable claims.

