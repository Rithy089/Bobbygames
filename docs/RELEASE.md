# Release status and remaining configuration

## Subsequent Tuk-Tuk Rush update

Rush now uses a rear-view perspective road, original procedural street scenery and vehicles, smooth steering and direct lane taps. Scoring and local data are preserved. The source repository was populated on Bobby's request after the September update: https://github.com/Rithy089/Bobbygames. Earlier statements below about it being empty describe the checks before that push.

The known Vercel commit-author access restriction has not been resolved or bypassed. This update uses the existing owner-private Sites publishing workflow; it does not claim an updated public Vercel deployment.

## September 8, 2026 update

- Updated application source: `49cc80d0044231b4cc9beace2321ec8c108e11db`.
- Owner-private Sites preview updated successfully: https://bobbygames.sayrithy089.chatgpt.site (version 2). Hosting API reports deployment SUCCESS. An authenticated live-browser smoke test was unavailable; local production-output browser checks are recorded in VERIFICATION.md.
- Vercel production deployment `dpl_68UWQMWR6gKhojtmoWC1v7XdoeK7` was **BLOCKED**. The deployment API states: “The deployment was blocked because the commit author doesn’t have permission to create deployments for this project.” CLI 50.1.3 renders this as UNKNOWN and keeps waiting; the waiter was stopped after diagnosing the terminal access block.
- The public Vercel alias has not been updated by this release. Live checks for the new public version therefore could not run. Resolve the commit author's Vercel project access before retrying deployment; no author identity, account permissions or billing settings were changed to bypass the restriction.
- The project Source code URL is preserved separately from Bobby's personal GitHub profile. The project repository exists but is empty; this update was not pushed to public GitHub.

## Deployed September 7, 2026

- Public guest release: https://bobbygames.vercel.app
- Owner-private Sites preview: https://bobbygames.sayrithy089.chatgpt.site
- Deployed application source: `733e4366310cb1425abbf4bc3cc4bb0890d3dfa4`.
- Vercel production build succeeded. Live HTTP checks passed for the homepage, Mango Catch detail, discovery, sitemap and robots; canonical metadata uses the Vercel production origin. All three games started and paused without JavaScript errors or horizontal overflow in desktop and emulated Pixel 5 Chromium.
- Sites reports successful private deployment. Its automatic browser handoff could not run because this environment exposes no available browser provider.

## Remaining configuration

The September update contains four locally playable games, both languages, themes, illustrated discovery, favorites, history, personal progress and developer links. Market Match has difficulty-specific results ranked by moves and active time. The existing account routes and Supabase schema/RLS/RPC integration remain in place, but this does not mean the online platform is live or fully verified.

**Online accounts and global rankings are deliberately deferred at Bobby’s request.** No Supabase URL/key is configured. Production signup, confirmation email, login, recovery, cross-device sync and actual live global rankings must be smoke-tested when that phase resumes. The current release displays this state honestly and permits guest play. No fake global scores are shown. Market Match currently saves only local results and never submits its results to the arcade score RPC; any future online memory ranking needs a dedicated validated result contract and database catalog entry.

Khmer copy remains a draft pending Bobby’s review. See KHMER-REVIEW.md. The original artwork and factual sources are listed in ASSETS.md and UPDATE-ASSETS.md. No flag imagery is used in gameplay.

Privacy and Terms describe this actual portfolio application; review them against the eventual hosting/account configuration before a larger public launch. Account deletion requests currently go through Bobby’s portfolio contact links. Guest progress can be removed by clearing this site’s browser data. Personal statistics show up to the 300 most recent finished runs; best scores are retained separately.

Optional WebMCP tools list games and open their start screens. Their contract is tested with an emulated provider. This environment has no native supporting browser provider, so native WebMCP integration and the automatic browser handoff are not claimed as verified.

Keyboard/mouse and emulated mobile/touch checks use Chromium. Physical device, Safari and Firefox validation remain recommended before marketing broadly. Automated WCAG checks do not establish full accessibility certification; Canvas gameplay has screen-reader limitations.
