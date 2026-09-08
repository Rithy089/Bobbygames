# Khmer and cultural review

Khmer in src/i18n/km.ts and src/lib/culture.ts is a draft for Bobby or another fluent Khmer reviewer. It is not labeled professionally reviewed. The Discover page states this limitation. English fallback is configured with i18next.

Review navigation tone, auth/recovery messages, gameplay instructions, the term for combo, and the biosphere-reserve translation. Check line breaks and font readability on a physical Android/iOS device. The main interface intentionally keeps EN and ខ្មែរ available. Fonts are locally hosted Noto Sans Khmer and Inter.

Do not save UTF-8 source through a Windows ANSI decoder. An encoding issue was caught by the browser language test and corrected; all source authoring/formatting uses UTF-8. Add English and Khmer keys together. Tests compare translation key coverage.

Game art is stylized fantasy and does not claim historical accuracy. Temple Tower explicitly identifies itself as an original fictional design inspired by Khmer architecture. The Cambodian flag is never used in gameplay. Culture cards use clearly labeled original illustrations and concise primary-source facts, with both languages present and source links for corrections.

## New review queue — September 8, 2026

All items below are drafts; none have been approved by a Khmer reviewer.

- `sourceCode`, `originalIllustration`, `illustrationNote`: project source link and original-art disclosure.
- `cambodiaFlag`: meaningful national-flag alt text.
- `perfectPlacement`, `missedFruit`, `stoneHit`: short in-game feedback; verify that the heart/life notation is clear.
- `memory`, `hard`, `aboutGames`, `explorerDesc`: category, difficulty and updated four-game/three-different-games copy.
- `khmer-market-match.title`, `.description`, `.hint`, `.instructions`: game name and complete instructions, including keyboard keys, pause and board-size reset behavior.
- Every key under `match`: moves/time/pairs labels, board/card accessibility names, face-up/down/matched states, match/mismatch/completion feedback, local-result explanation, ranking rule, restart-size notice, local bests and unavailable online results.
- Every key under `match.objects`: mango, dragon fruit, bananas, coconut, woven basket, tuk-tuk, rice, fish, fan, teapot, watermelon and krama.
- `src/lib/culture.ts`: new Khmer titles/descriptions for Phnom Penh, countryside, food and markets; all eight `cultureAlt.*.km` image descriptions. Existing Angkor/Tonlé Sap/dance/shadow descriptions remain for review.
- Existing decorative shop signs `ផ្សារ` and `សួស្តី` remain unchanged. Illustrations contain no generated lettering.

Check meaning, natural tone and mobile line breaks, especially “moves” (one attempt = two cards), “active time” (pause excluded), and size-specific best results. Correct English and Khmer data together if cultural interpretation changes.
