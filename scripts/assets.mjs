// Optional repeatable image optimization. Usage: node scripts/assets.mjs path/to/originals
// Input files must be mango-catch.png, temple-tower.png and tuk-tuk-rush.png.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const base = process.argv[2];
if (!base)
  throw Error('Provide a directory with the three original PNG covers.');
fs.mkdirSync('public/art', { recursive: true });
for (const id of ['mango-catch', 'temple-tower', 'tuk-tuk-rush'])
  for (const width of [480, 960])
    await sharp(path.join(base, id + '.png'))
      .resize(width)
      .webp({ quality: 83 })
      .toFile('public/art/' + id + '-' + width + '.webp');
console.log('Six responsive WebP assets created.');
