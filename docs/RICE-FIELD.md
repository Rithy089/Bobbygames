# Rice Field Adventure

Sixth original guest game, September 2026. Explore a fictional Cambodian-inspired rice field in four directions, complete three harvests of 12 bundles each and return to the cart after each harvest within 240 active seconds. Each bundle awards 100 points once per harvest. Bundle positions change each round; the score and timer carry forward. The mission bar displays the current harvest. Only the final delivery adds five points per remaining whole second. A buffalo encounter costs five seconds and grants 1.4 seconds of protection; animals are never harmed. Higher total scores rank first.

Keyboard arrows/WASD, pointer destinations and four touch buttons share normalized movement. Pause excludes elapsed time. Restart resets the harvest, penalties and destination. Shared game lifecycle manages visibility, audio, listeners and animation cleanup. Reduced motion removes walking rotation, floating bundles and collection rings while preserving readable static feedback.

Acceptance: all bundles can be collected once; returning home is required for the time bonus; time expiry ends play without a delivery bonus; scores persist locally; catalog, search, favorites and recent history include the game. Online accounts and rankings remain deferred.

## Original assets and audio

The cover, field and transparent farmer, rice bundle, buffalo and cart sprites were generated specifically for BobbyGames with OpenAI image generation. They depict illustrated fictional scenery, not authentic photographs or historical reconstruction. No third-party assets or factual claims were added. The brief specified warm cartoon rice fields, palms, wooden homes, a farmer with a straw hat and krama, and clear playable space without generated lettering.

Responsive covers: 480x320 and 960x640 WebP. Background: 1200x900 WebP. Sprites retain transparency and source proportions. Source sheet crops (x,y,width,height): farmer (160,8,345,580), bundle (698,20,472,585), buffalo (110,610,426,600), cart (710,645,467,585). Assets load with the game; only cover artwork loads in the catalog.

Original procedural 96 BPM soundtrack uses evolving warm plucked phrases over 32 bars (80 seconds). It is contemporary game music, not a claim of authentic traditional Cambodian music. Independent persisted music and effects controls reuse the existing audio system.

## Review

New Khmer game metadata, six-game About copy and all `rice.*` labels need Bobby's review. Physical mobile comfort and subjective speaker/headphone listening remain manual checks.

September 15 length update: three rounds replace the single short harvest. Existing local scores are preserved; longer runs can establish a new best. Review updated instructions, hint, rice.round and rice.complete in Khmer.
