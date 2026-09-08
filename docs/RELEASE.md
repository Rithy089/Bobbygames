# Release status and remaining configuration

## Deployed September 7, 2026

- Public guest release: https://bobbygames.vercel.app
- Owner-private Sites preview: https://bobbygames.sayrithy089.chatgpt.site
- Deployed application source: `733e4366310cb1425abbf4bc3cc4bb0890d3dfa4`.
- Vercel production build succeeded. Live HTTP checks passed for the homepage, Mango Catch detail, discovery, sitemap and robots; canonical metadata uses the Vercel production origin. All three games started and paused without JavaScript errors or horizontal overflow in desktop and emulated Pixel 5 Chromium.
- Sites reports successful private deployment. Its automatic browser handoff could not run because this environment exposes no available browser provider.

## Remaining configuration

The September update contains four locally playable games, both languages, themes, illustrated discovery, favorites, history, personal progress and developer links. Market Match has difficulty-specific results ranked by moves and active time. The existing account routes and Supabase schema/RLS/RPC integration remain in place, but this does not mean the online platform is live or fully verified.

**Online accounts and global rankings are deliberately deferred at Bobby’s request.** No Supabase URL/key is configured. Production signup, confirmation email, login, recovery, cross-device sync and actual live global rankings must be smoke-tested when that phase resumes. The current release displays this state honestly and permits guest play. No fake global scores are shown. Market Match currently saves only local results and never submits its results to the arcade score RPC; any future online memory ranking needs a dedicated validated result contract and database catalog entry.

Khmer copy remains a draft pending Bobby’s review. See KHMER-REVIEW.md. The original artwork and factual sources are listed in ASSETS.md. No flag imagery is used in gameplay.

Privacy and Terms describe this actual portfolio application; review them against the eventual hosting/account configuration before a larger public launch. Account deletion requests currently go through Bobby’s portfolio contact links. Guest progress can be removed by clearing this site’s browser data. Personal statistics show up to the 300 most recent finished runs; best scores are retained separately.

Optional WebMCP tools list games and open their start screens. Their contract is tested with an emulated provider. This environment has no native supporting browser provider, so native WebMCP integration and the automatic browser handoff are not claimed as verified.

Keyboard/mouse and emulated mobile/touch checks use Chromium. Physical device, Safari and Firefox validation remain recommended before marketing broadly. Automated WCAG checks do not establish full accessibility certification; Canvas gameplay has screen-reader limitations.
