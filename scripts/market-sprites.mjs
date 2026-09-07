import sharp from 'sharp';
import fs from 'node:fs/promises';
const file = process.argv[2];
if (!file) throw Error('Pass the original 4 by 3 sprite sheet');
const { width, height, hasAlpha } = await sharp(file).metadata();
if (!hasAlpha) throw Error('Sprite sheet requires transparency');
await fs.mkdir('public/sprites', { recursive: true });
const ids = [
  'mango',
  'dragon',
  'bananas',
  'coconut',
  'basket',
  'tuk-tuk',
  'rice',
  'fish',
  'fan',
  'teapot',
  'watermelon',
  'krama',
];
for (const [i, id] of ids.entries()) {
  const left = Math.round(((i % 4) * width) / 4),
    top = Math.round((Math.floor(i / 4) * height) / 3);
  const crop = await sharp(file)
    .extract({
      left,
      top,
      width: Math.round((((i % 4) + 1) * width) / 4) - left,
      height: Math.round(((Math.floor(i / 4) + 1) * height) / 3) - top,
    })
    .toBuffer();
  await sharp(crop)
    .trim({ threshold: 5 })
    .resize(256, 256, { fit: 'contain', background: '#0000' })
    .webp({ quality: 88 })
    .toFile(`public/sprites/${id}.webp`);
}
