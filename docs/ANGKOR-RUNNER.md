# Angkor Runner

Seventh original BobbyGames game, September 2026. Endless side-view runner on a fictional Khmer-inspired forest trail. No timer ends a successful run; three lost lives end the game. Scenery is not a reconstruction or a route through real Angkor monuments. No historical claims, flags, sacred collectibles or destructible architecture.

## Gameplay and acceptance

- Space, Up/W or tap the canvas to jump. Down/S or Slide to duck. Two accessible touch buttons support pointer and keyboard input. Quick presses are retained until one frame consumes them; holding does not repeat a jump or extend a slide. Existing free-movement games retain their controls.
- Jump duration is about 0.8 seconds, maximum elevation 144 canvas pixels; slide lasts 0.75 seconds. Ground is y450 in an 800x600 scene. Collision bounds are inset from the character artwork. Horizontal swept collision tests prevent fast obstacles passing through the player.
- One point per metre plus 50 per mango. Combo counts consecutive pickups, resets on a missed fruit or collision, and changes the cue every third pickup without adding a hidden multiplier.
- Speed rises from 240 to 410 pixels/second. Spawn intervals shrink from 2.5 to 1.7 seconds; there is one obstacle per spawn plus a fruit behind it. The first obstacle is a log and the second a branch; later types vary. Protection lasts 1.4 seconds after an impact.
- Shared pause/restart/results, hidden-tab pause, persisted independent audio controls, local score saving, favorites, recent history and lazy engine loading. No Supabase or global-ranking configuration.
- Static scenic background avoids continuous full-screen motion; sparse trail markers and two running poses convey movement. Reduced motion removes markers, frame alternation, floating feedback and pickup rings while preserving gameplay and static impact feedback.

Acceptance checks cover jump/landing/no double jump, bounded slides, swept collisions, one-time pickups, impact protection, game-over, long-run object limits, restart, and a three-minute collision-free simulation through increasing speed.

## Audio and original artwork

Original 108 BPM procedural composition: 32 evolving bars (about 71.1 seconds), with warm plucked tones. This is contemporary game music, not an authentic traditional Cambodian recording. Original shared soft pickup/impact cues are reused. Music is initialized by Start and respects saved preferences.

Three image requests used the built-in OpenAI image tool, with no third-party references or licensed stock. Generated illustrations are fictional. Full briefs are recorded in `ANGKOR-RUNNER-ASSETS.json`.

Published files: `public/art/angkor-runner-{480,960}.webp`, `public/sprites/runner-bg.webp`, and `runner-{run-a,run-b,jump,slide,log,branch}.webp`. Existing original `mango.webp` is reused. Covers are 480x320 and 960x640; backdrop 1200x900; cropped alpha sprites are 240px wide. The branch is cropped without its trunk so no visible solid trunk contradicts the duck-under collision rules.

Source sheet 1536x1024 crop rectangles (x,y,width,height): run A (225,20,330,350); run B (950,20,320,355); jump (265,390,300,280); slide (910,450,420,230); log (80,790,610,165); branch (835,685,435,160). All assets are local, with no remote loading dependency.

## Remaining manual review

New Khmer metadata, Jump/Slide and seven-game About copy need Bobby's review. Browser audio signal verification does not replace listening on speakers/headphones; physical phone control comfort remains a manual check.
