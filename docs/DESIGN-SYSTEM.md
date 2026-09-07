# Design system

Semantic colors live in app/globals.css. Dark surfaces: #101725 / #171f2f / #202a3b; foreground #f1f2f5; muted #a0aabb. Light surfaces: #f6f5f1 / #fff / #eeede9; foreground #182338. Mango gold #f8bd54 is the primary control fill; dark navy text sits on gold. Light-theme gold text uses the darker #8d5900 for contrast. Coral and purple appear in game artwork and bounded secondary accents.

Inter and Noto Sans Khmer are self-hosted. Main educational/instruction prose is 16px; portal controls use 14px, secondary metadata 12px. Fluid headings respect viewport and Khmer line height. Primary spacing follows 4/8px rhythm with section gaps 32–48px. Controls are at least 44px where practical, mobile game controls 48px. Cards use 12–16px corners, controls 8–10px. Soft shadows establish game-card depth. Transitions stay around 150–300ms and reduced motion disables movement.

Components: GameCard, Choice (Base UI Select via scaffold primitives), AudioSettings (Switch/Slider), shared player frame, catalog toolbar, preference rows, safe generated avatars and stateful empty/error feedback. Focus indicators are visible. Canvas accessibility is limited; names, instructions, HUD, mobile buttons and pause/restart remain in semantic HTML.

