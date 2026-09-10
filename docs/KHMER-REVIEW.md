# Khmer and cultural review

Portfolio cursor adds `cursorAction` ("ទៅ", English "GO") for review. It reuses the wording on Bobby's portfolio; previously reviewed strings remain unchanged.

Audio-control clarification adds `muteAllAudio` (“បិទសំឡេងទាំងអស់”) for review. Existing Music and Sound effects translations are reused unchanged.

Bobby approved the existing Khmer copy on September 9, 2026. Preserve that copy. The older review notes below are historical; English fallback remains configured with i18next.

New audio strings awaiting review: `musicVolume`, `effectsVolume`, `enableSound`, `musicOffNotice`, `audioStatus_blocked`, `audioStatus_unavailable`, `audioStatus_failed` in `src/i18n/km.ts`. All existing Khmer strings are unchanged in the audio update.

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
# Tuk-Tuk Rush perspective update

- Recheck `tuk-tuk-rush.instructions` in `src/i18n/km.ts`: added “ប៉ះគន្លងនៅលើផ្លូវ” to explain tapping a road lane. This is draft copy awaiting Bobby's review.
- Existing decorative signs “ផ្សារ” and “សួស្តី” are reused; no new cultural or historical claims were added.
