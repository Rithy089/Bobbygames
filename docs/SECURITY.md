# Security model

Supabase Auth owns private email/password credentials. The browser receives only the project URL and publishable/anon key. Never configure a service-role key with a VITE_ prefix. Profiles contain only UUID, display name, avatar color index and created date; public leaderboard RPC returns only safe name/avatar, score, game, date. React escapes player text. There is no chat, rich text or avatar upload surface.

Every public table has RLS. Direct client writes to scores, sessions, awards and suspicious logs are denied. Profile updates are limited to safe display_name/avatar columns. Favorite and preference writes require auth.uid() ownership. Unpublished catalog records and translations are hidden. Session and score history are owner-only. Suspicious logs are operator-only.

start_game requires an authenticated user and a published game. A per-user transaction advisory lock serializes rate-limit checks: at most 12 new sessions per minute. Server creates UUID and start timestamp. submit_score locks an owned session, consumes it once, rejects expired (>2 hours), invalid/null/bounded values, active durations longer than observed wall time (+2 second tolerance), and scores exceeding game-specific rate limits. A rejected owned session records one suspicious event without rolling the log back. Replay cannot duplicate a score/award or flood logs. Supabase gateway/Auth additionally manage their own traffic limits; configure project quotas and monitoring before public launch.

These are portfolio-appropriate sanity checks, NOT cheat-proof gameplay verification. A modified client can forge plausible scores or duration, automate input, or wait before submission. Global scores should be treated as unverified competition without prizes. Stronger future protection would use server-seeded deterministic replays, signed action timelines and server simulation. Replays are not claimed in this release.

Database tests run the real migration and RLS/function queries in PGlite (PostgreSQL WASM) using anon/authenticated roles and a test auth.uid(). This validates SQL behavior but does not validate hosted Supabase Auth, PostgREST, email delivery, storage or production settings. Those require a configured project. Auth client tests mock the service and are labeled accordingly.

Local high scores/favorites are device data and editable by the visitor. They cannot be imported directly into the global leaderboard. A new authenticated server session is required for each eligible run. Guest local progress is preserved across account sessions; account rankings and awards use accepted server scores only.

Content links open with noopener/noreferrer. Fonts/images are self-hosted. No analytics/ad scripts. A source pattern scan and npm audit are run during delivery. Pattern scanning cannot prove the absence of every secret. Secret .env files, build results, test artifacts and provider credentials are ignored.

