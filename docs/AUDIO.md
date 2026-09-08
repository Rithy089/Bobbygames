# Audio update — September 9, 2026

## Verified diagnosis

A fresh Chromium session started Mango Catch with `{sound:true,music:false,effects:true,volume:0.35}` saved locally and an AudioContext in `running` state. The verified fresh-session silence was the default-disabled music setting, not a browser restriction in that test. The old enabled music was one continuous 130.81 Hz sine oscillator with gain `volume * 0.025`; it had no composed melody or music assets. Existing saved settings also preserved music=false. There were no audio URLs to be missing or fail loading. Old resume promises were not caught and playback failures had no visible recovery state. Bobby's particular browser/device output settings were not inspected.

## Original compositions and effects

All audio is project-created procedural synthesis in `src/games/shared/composition.ts`. No external recordings, paid services or licenses are required. These are original contemporary arcade arrangements, not recordings or reconstructions of traditional Cambodian music.

Each soundtrack has 32 bars and four evolving eight-bar phrases, harmony, a bass part, melody variations and breathing space. Note tails wrap into the loop buffer. The first Start prepares only that game's mono 22,050 Hz buffer; the homepage downloads no soundtrack assets.

| Game | Music | Effects and visual feedback |
| --- | --- | --- |
| Mango Catch | Gentle major-key plucks, 100 BPM, 76.8-second loop | Soft catches, brighter combo chimes, restrained descending miss cue; six small catch particles and existing score/combo labels |
| Temple Tower | Slower sustained harmony and spacious melody, 72 BPM, 106.7-second loop | Short stone texture, perfect-placement chime; a localized gold stack outline and existing placement settle |
| Tuk-Tuk Rush | Livelier rhythmic plucks, 112 BPM, 68.6-second loop, quiet integrated engine hum | Pickup chime and soft collision cue; a small pickup ring and existing collision border |
| Khmer Market Match | Relaxed melody, 84 BPM, 91.4-second loop | Light flips, matching chimes, short completion phrase; card reveals, pair highlight and one completion animation |

## Preferences, failures and lifecycle

New settings enable music. Existing explicit music=false, master mute, effects mute and zero volume are preserved. Separate music/effect gains are added without changing the storage version or unrelated guest data. The existing volume slider remains the master level. No preference is forcibly unmuted by Start or Enable sound. A notice explains saved music-off settings.

Audio initializes/resumes from Start or an explicit recovery gesture. Settings and toolbar changes synchronize through the existing Zustand store. One looping source exists at most; pause stores its position, stops active effects and suspends the context. Resume continues the loop, restart cannot layer another track, and route cleanup disconnects/stops nodes, clears buffers, removes listeners/subscriptions and closes the context. Hidden tabs pause; returning does not resume manually or automatically paused gameplay. There are no audio scheduler intervals or timeouts. Effects are capped at eight voices, with rapid flip/catch rate limiting; completion clears earlier effects so its phrase is not dropped.

Diagnostics distinguish browser-blocked/suspended playback, unavailable AudioContext, and failed procedural audio preparation. No network assets are used, so a missing audio-file test is not applicable; injected buffer-generation failure covers preparation failure without preventing gameplay. Resume/close/suspend failures are caught. Enable sound retries initialization or browser resume without changing saved mute preferences.

## Verification and listening limits

Actual Chromium AudioContext/AudioBufferSourceNode output was measured with AnalyserNode after the output gains. All four games produced nonzero signals after Start, retained exactly one music source through three restarts, suspended on pause/hidden-tab simulation, and closed on navigation. Saved master mute created no contexts in all four games. Independent music/effects zero levels, effects-only card output, persistence, injected blocked resume/recovery, and injected preparation failure passed on desktop and Pixel 5 emulation. Buffer tests verify distinct durations, finite samples, bounded peaks and a small loop seam; unit tests also verify the effect cap and legacy preference merge.

These are real signal measurements, not a claim that speakers/headphones were heard. No listening-capable capture or physical phone validation was performed. Simulated visibility events do not reproduce every mobile OS interruption. Safari/iOS and Firefox remain unverified.

### Bobby's listening checklist

1. If your previous settings had music off, enable Music once; start each game at a comfortable device volume. Check that music stays softer than catches, placements and pickups.
2. Listen through one full loop (about 69–107 seconds), using restarts as needed. Check for clicks, uncomfortable notes or repetitive passages, and try a completion in Market Match.
3. Change both volume sliders, mute, pause/resume, restart several times, switch tabs and switch games. Confirm silence on pause/exit and no doubled tracks.
4. Repeat on your physical phone, including screen lock/unlock, headphones and the device's silent-mode settings. Returning should leave the game paused until you resume.

Existing Khmer was approved by Bobby. Only the seven new audio controls/messages listed in KHMER-REVIEW.md need review. Supabase, accounts and global rankings remain deferred.
