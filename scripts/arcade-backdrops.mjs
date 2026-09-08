import sharp from 'sharp';
import fs from 'node:fs/promises';
const file = process.argv[2];
if (!file) throw Error('Pass the 2048x768 two-panel original sheet');
await fs.mkdir('public/scenes', { recursive: true });
await sharp(file)
  .extract({ left: 0, top: 0, width: 1049, height: 768 })
  .resize(960, 720)
  .webp({ quality: 85 })
  .toFile('public/scenes/tower-bg.webp');
// Fit the empty street to the engine road without distorting the roadside objects.
const base = sharp({
  create: { width: 800, height: 600, channels: 3, background: '#414c56' },
});
const segments = [
  { left: 1049, width: 282, out: 205, x: 0 },
  { left: 1331, width: 380, out: 390, x: 205 },
  { left: 1711, width: 337, out: 205, x: 595 },
];
const parts = await Promise.all(
  segments.map(async (s) => ({
    input: await sharp(file)
      .extract({ left: s.left, top: 0, width: s.width, height: 768 })
      .resize(s.out, 600)
      .toBuffer(),
    left: s.x,
    top: 0,
  })),
);
await base
  .composite(parts)
  .webp({ quality: 85 })
  .toFile('public/scenes/street-bg.webp');
