# Angkor Runner

Seventh original BobbyGames game, September 2026. Endless forward-facing three-lane runner on a fictional Khmer-inspired forest trail. No timer ends a successful run; three lost lives end the game. Scenery is not a reconstruction or a route through real Angkor monuments. No historical claims, flags, sacred collectibles or destructible architecture.

## Gameplay and acceptance

- Left/Right or A/D change lanes; Space/Up/W or tap jumps; Down/S slides. Four accessible buttons also support keyboard input. Swipes use the dominant direction with a 24 CSS-pixel threshold and one action per gesture. Cancelled/paused gestures cannot trigger an action. Quick presses are retained for one frame. Existing free-movement games retain their controls.
- Jump lasts about 0.8 seconds, maximum elevation 144 canvas pixels; slide lasts 0.75 seconds. Lane transitions take about 0.125 seconds, including while jumping/sliding. A fixed perspective camera projects depth toward y500. Collision tests sweep the depth crossing and interpolate lane/elevation at contact, not the target lane. Logs can be jumped, branches ducked under, and rocks require changing lanes.
- One point per metre plus 50 per gold coin. Combo counts consecutive pickups, resets on a missed coin or collision, and changes the cue every third pickup without adding a hidden multiplier.
- Speed rises from 55 to 90 world units/second (three units per displayed metre). Row intervals shrink from 2.4 to 1.65 seconds. The first three rows introduce single obstacles; later rows occupy two lanes with at least one open lane. Three-coin paths guide the open lane. Protection lasts 1.4 seconds. Old local scores remain; score balancing changes with the redesign.
- Shared pause/restart/results, hidden-tab pause, persisted independent audio controls, local score saving, favorites, recent history and lazy engine loading. No Supabase or global-ranking configuration.
- A steady scenic background, projected approaching objects and moving trail markers convey forward travel without camera shake. Reduced motion removes markers, bobbing, frame alternation, floating feedback and rings; lane movement and approaching objects remain essential gameplay.

Acceptance covers lane limits/interpolation, jump/slide rules, swept collisions, one-time pickups, protection, game-over, reachable rows, restart and a three-minute safe-lane simulation. Browser checks exercise keyboard lanes, four-way browser touch swipes, tap, cancellation, pause, saved results and cleanup.

## Audio and original artwork

Original 108 BPM procedural composition: 32 evolving bars (about 71.1 seconds), with warm plucked tones. This is contemporary game music, not an authentic traditional Cambodian recording. Original shared soft pickup/impact cues are reused. Music is initialized by Start and respects saved preferences.

Three image requests used the built-in OpenAI image tool, with no third-party references or licensed stock. Generated illustrations are fictional. Full briefs are recorded in `ANGKOR-RUNNER-ASSETS.json`.

The forward-view update added two original built-in image-generation requests, documented in ANGKOR-RUNNER-FORWARD-ASSETS.json. Current artwork uses runner-forward-bg.webp, runner-rear-{run-a,run-b,jump,slide}.webp and upgraded object sprites documented in RUNNER-OBJECT-ASSETS.json. Background is 1200x900; rear sprites retain alpha at 320px high. Existing covers and legacy assets are preserved, but legacy character/background files no longer load in this game.

Source sheet 1536x1024 crop rectangles (x,y,width,height): run A (225,20,330,350); run B (950,20,320,355); jump (265,390,300,280); slide (910,450,420,230); log (80,790,610,165); branch (835,685,435,160). All assets are local, with no remote loading dependency.

## Remaining manual review

Updated Khmer description, hint and instructions for three lanes, rocks and swipes need Bobby's review. Browser audio signal verification does not replace listening on speakers/headphones; physical phone control comfort remains a manual check.

## Gold coins and grounded movement

Gold tokens use an original illustrated WebP with a geometric diamond and restrained rotation. No external asset or real currency imagery is used. Mango sprites no longer preload in this game. Coin values, collisions and local-score compatibility remain unchanged. Strides track distance, lane changes lean from the feet, jump shadows soften, and landings compress briefly. Sparse projected ground details and bounded analytic dust reinforce travel without camera movement. Reduced motion disables these decorative animations.

## Moving scenery: first review step

Original Canvas roadside plants and small stones move with world distance, with perspective producing stronger nearby motion. Low-contrast sand ripples flow along the trail. The distant illustration and camera stay fixed. Decorative silhouettes remain outside playable lanes, and no obstacle, collision, score or difficulty rule changed. Reduced motion freezes the new scenery; pause freezes distance, and restart resets it. This uses the existing game loop with no extra assets, listeners or timers. No new Khmer strings.

## Step two: portrait view and trail props

On portrait phones, runner-only 13:15 framing enlarges the action by about 54% compared with the old 4:3 frame. Center cropping preserves 520 of 800 world pixels, including all three lanes and approaching obstacle widths; it does not stretch art or change swipe distances. Touch controls occupy one row. Desktop and other games retain their framing.

Original illustrated wooden carts with sacks introduce a later dodge-only visual variant of rock obstacles, starting at row seven on alternating rows when a rock is generated. Existing collision rules, jump/slide timing, score values, difficulty and open-lane guarantees stay unchanged. Original geometric sandstone pillars decorate the roadside only; these are fictional, non-sacred, non-destructible props. The first Canvas art has since been replaced with local game sprites.

## Step three: changing environments

Five original illustrated settings cycle by distance: forest, respectful distant Angkor Wat vista, fictional Siem Reap-inspired riverside, sandstone garden courtyard, and lush green trail. Each segment lasts 550 metres; the last 140 metres ease into the next background. The first transition begins at 410 metres rather than 225 metres, and a full cycle takes 2,750 metres. Angkor Wat is distant scenery across water, never the running surface or an obstacle. The riverside composition is fictional. Camera and collision projection remain fixed. Courtyard paving and extra roadside pillars blend with the background; pillars are absent by the river and the Angkor view. Reduced motion still shows each setting, switching at segment boundaries without the animated crossfade. Pause holds distance and blend; restart returns to forest. No new copy, score rules or controls.

Four game-route-only WebP variants are documented in RUNNER-ENVIRONMENT-ASSETS.json, including the art prompts and primary sources for Angkor Wat's location and Siem Reap's river. The new views are original stylized illustrations, not photographs or exact location reconstructions.

## Object art update

The runner now uses six new original transparent WebP sprites: fallen log (jump), leafy crossbar (slide), angular boulder (dodge), market handcart (dodge), gold token (collect), and roadside sandstone pillar (decoration). They share the scenery's lighting and painterly style. The pillar is fictional and stays off the playable lanes. The token is fictional currency. The prior flat cart, simple pillar, round shared Mekong rock, and vector coin are no longer used by this game. Log/branch collision types remain unchanged internally, along with scoring, obstacle timing, and the clear lane in every row. The six assets total about 217 KB and load with the runner route only. Sources, exact prompts and crop details are in RUNNER-OBJECT-ASSETS.json. No new Khmer strings.
