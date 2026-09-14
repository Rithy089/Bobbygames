# Mekong Boat Journey

Original guest-play arcade game added September 2026. Fictional Cambodian-inspired river illustration, not a photograph, historical reconstruction or real navigation guide. No new factual claims or external asset licenses.

## Rules and acceptance

- Five-minute run or three lost lives. One point per metre plus 50 per fruit basket. Combo counts consecutive collected baskets and resets on impact; every third basket has a brighter cue, without a hidden score multiplier.
- Free movement in both axes with arrows/WASD, pointer movement, tap/drag on water or four touch arrows. Boat movement is capped at 350 canvas pixels/second, including diagonals. Hull stays inside x=205–595, y=70–535 on the 800×600 river. One object per row leaves a passable channel. Swept relative collision bounds use both boat coordinates to prevent tunnelling; 1.5 seconds of protection follows an impact.
- Current speed rises from 145 to 310 pixels/second; spawning interval decreases to a minimum of 1.05 seconds. Decorative banks remain still. Gentle turning, a clipped paddle animation using the existing sprite, fading wakes, pickup rings and floating score feedback follow game time and freeze on pause. Reduced motion removes these decorative movements while preserving obstacles and clear static feedback. Ripple lifetimes are bounded at 0.85 seconds; no new loops or timers.
- Shared Start/pause/restart/results, audio settings, visibility handling and cleanup. Catalog, search, arcade category, newest sorting, favorites, recent history, personal bests and local rankings use existing portal data. No online game registration, authentication or ranking configuration was deployed.

## Audio and assets

Original procedural soundtrack: 88 BPM, 32 bars (about 87.3 seconds), low warm plucks with evolving phrases. Independent music/effects switches and volume settings remain shared. Music-only, saved-mute and cleanup checks include this game.

All seven WebP assets are from original built-in imagegen outputs created for this project. No third-party images were used. The cover depicts fictional scenery. Background stays separate from transparent boat, log, rock and fruit-basket sprites; optimized assets load only with this game's route, apart from responsive catalog covers.

Generation briefs: overhead teal river with clear central channel and green banks, palm trees and wooden homes; transparent overhead wooden canoe/paddler, log, mossy rock and fruit basket; warm cartoon cover showing a paddler and river obstacles. Source sprite sheet was 1254 square; crop rectangles before 3px padding: boat (227,38,227,593), log (651,182,546,289), rock (87,738,452,392), basket (717,705,452,440). Cover is distributed at 480×320 and 960×640; background at 1200×900. Sprites preserve alpha. No flag or temple assets.

## Review

The new `mekong-boat-journey` Khmer title, description, hint and instructions need Bobby's review, as does the updated five-game About heading. Previously approved wording remains unchanged. Physical-device comfort and actual speaker/headphone listening remain user checks.
