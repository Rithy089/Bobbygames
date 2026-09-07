# Release status and remaining configuration

The guest arcade is complete and locally tested: three games, both languages, themes, discovery, favorites, history, personal progress, score tables and developer links. All account routes and the Supabase schema/RLS/RPC integration are implemented.

**The online account service is not configured in this workspace.** No Supabase URL/key was provided. Production signup, confirmation email, login, recovery, cross-device sync and actual live global rankings must be smoke-tested after deploying migrations and configuring Auth redirects. The current release displays this state honestly and permits guest play. No fake global scores are shown.

Khmer copy remains a draft pending Bobby’s review. See KHMER-REVIEW.md. The original artwork and factual sources are listed in ASSETS.md. No flag imagery is used in gameplay.

Privacy and Terms describe this actual portfolio application; review them against the eventual hosting/account configuration before a larger public launch. Account deletion requests currently go through Bobby’s portfolio contact links. Guest progress can be removed by clearing this site’s browser data. Personal statistics show up to the 300 most recent finished runs; best scores are retained separately.

Optional WebMCP tools list games and open their start screens. Their contract is tested with an emulated provider. This environment has no native supporting browser provider, so native WebMCP integration and the automatic browser handoff are not claimed as verified.

Keyboard/mouse and emulated mobile/touch checks use Chromium. Physical device, Safari and Firefox validation remain recommended before marketing broadly. Automated WCAG checks do not establish full accessibility certification; Canvas gameplay has screen-reader limitations.

