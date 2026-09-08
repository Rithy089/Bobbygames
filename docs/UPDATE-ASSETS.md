# September 2026 asset and fact register

All new images are original AI-assisted illustrations generated specifically for BobbyGames with the built-in image_gen tool on September 8, 2026. No photographs, third-party music, commercial logos or paid external API services were added. Do not describe this artwork as documentary photographs or exact architectural reproductions.

## Delivered assets
- `public/cambodia-flag.svg`: unchanged flag artwork from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Cambodia.svg), marked public domain / CC0 on the source page, downloaded September 8, 2026. Displayed at the original 1000:640 aspect ratio, blue/red/blue bands and white Angkor emblem. Used only for country attribution, never gameplay. Replaces platform-dependent flag emoji rendering in sidebar/footer.
- `public/discover/{angkor,phnom-penh,countryside,food,market,tonle-sap,dance,shadow}-{480,960}.webp`: responsive illustrations, generated sheets cropped and optimized with Sharp. Food shows rice, mango, coconut and a leaf-wrapped parcel. Shadow theatre uses the corrected large unarticulated Sbek Thom panels; an initial articulated-puppet draft was rejected.
- `public/sprites/{mango,dragon,bananas,coconut,basket,tuk-tuk,rice,fish,fan,teapot,watermelon,krama}.webp`: original transparent market objects; also reused for in-game fruit, basket and market details. Sprite output 256px, preserved alpha.
- `public/art/khmer-market-match-{480,960}.webp`: original imaginary market/card cover.
- Existing Canvas geometry extended for functional blocks, obstacles, scenery and vehicle. Decorative geometry is fictional, not a historic reconstruction.

## Fact review — 2026-09-08
- Angkor architecture: [UNESCO World Heritage](https://whc.unesco.org/en/list/668/).
- Phnom Penh capital and river confluence: [Phnom Penh Capital Hall](https://phnompenh.gov.kh/en/phnom-penh-city/facts/).
- Rice cultivation: [FAO Cambodia](https://www.fao.org/cambodia/our-office/cambodia-at-a-glance/en).
- Rice as staple: [FAO country fact sheet](https://www.fao.org/4/i3761e/i3761e.pdf). No outdated numeric dietary claim reproduced.
- Market crafts around Angkor: [UNESCO Angkor, protection and management section](https://whc.unesco.org/en/list/668/). A Ministry of Tourism Central Market URL returned 404 during final link checking; it and its associated claim were replaced before release.
- Existing Tonlé Sap, Royal Ballet and Sbek Thom citations remain in `src/lib/culture.ts` and ASSETS.md. New prose is concise paraphrase, not copied article text.

## Generation briefs
Discovery sheet: six isolated painted scenes, Angkor reflecting water, Phnom Penh-inspired riverside shophouses/tuk-tuk, rice fields/palms/stilt house, rice/mango/coconut meal, produce market, shadow theatre. Warm gold/green/cream, restrained red/blue; no text, logos or flags. Actual sheet 1774×887, 3×2 cells. Shadow cell excluded.

Wetland/dance sheet: two original painted panels, Tonlé Sap-inspired water/boat/birds and respectful full-figure Khmer classical dancer. No claim of actual performance documentation. Actual sheet 1774×887, 2×1 cells.

Corrected shadow scene: two large single-piece ornate leather cutout panels, figures embedded within their panels, no articulated joints; supported by two rods each before a warm lit screen. No specific historical work reproduced.

Sprite sheet: 4×3 equal cells, transparent background, ordered mango, dragon fruit, bananas, coconut, woven basket, tuk-tuk, rice bowl, fish, fan, teapot, watermelon, folded krama. Original cartoon forms and dark outlines readable at small sizes; no logos or flags.

Cover: Cambodian-inspired imaginary produce stall as a colorful miniature diorama, woven baskets, checked awning trim, red-blue tuk-tuk and six cream memory cards with mango/dragon pairs and patterned backs. No lettering, temple towers or sacred objects.

Arcade backdrops: `public/scenes/tower-bg.webp` (960×720) and `street-bg.webp` (800×600). Original 2048×768 painted sheet with sunset/palms/empty stacking center on left and overhead market street on right. No temples, vehicles, signs or flags in generated artwork. The engine adds readable Khmer signs, functional road lines, blocks and vehicles. Street segments are fitted to actual gameplay boundaries. Backdrops only load on their game routes.

Exact backdrop generation prompt: “Use case: stylized-concept. Asset type: original painted browser-game background contact sheet, TWO equal panels side by side, each precisely 4:3, total canvas 8:3 landscape. No gutter, no frame, exact vertical split at 50%. LEFT panel: warm hand-painted Khmer cartoon arcade backdrop for a fictional sandstone stacking game. Soft apricot and gold sunset sky fills upper two thirds, distant gently rolling green hills, sugar palms ONLY at extreme left/right edges. A simple warm sandstone platform low across bottom edge. Leave center and top open, low contrast, uncluttered for game blocks. No temples, no towers, no buildings. RIGHT panel: strictly overhead top-down original Phnom Penh-inspired street arcade background. Straight vertical charcoal blue road occupies exactly central 49% of this panel (local x25.5% to74.5%), runs full height without vanishing perspective, unmarked completely empty asphalt. Narrow warm cream sidewalks alongside road. Colorful shop roofs, striped awnings and illustrated market stalls, palms at extreme left and right outside road. No moving traffic or vehicles, no characters, no road lines (engine adds them). Both panels share friendly bold hand-painted shapes, warm sandstone gold, palm green, warm cream with small Cambodian red/blue accents, subtle paper texture, professional appealing game art, richly illustrated edges and readable empty gameplay space. Not photography, entirely fictional stylization. No text, letters, signage, logos, watermarks, flags, religious symbols or Angkor Wat. Output 2048x768 if possible.”
