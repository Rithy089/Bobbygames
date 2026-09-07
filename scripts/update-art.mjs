import sharp from 'sharp';
import fs from 'node:fs/promises';
const [file, columnsText, rowsText, ...ids] = process.argv.slice(2);
const columns = Number(columnsText),
  rows = Number(rowsText);
if (!file || !columns || !rows || ids.length !== columns * rows)
  throw Error('Usage: node scripts/update-art.mjs sheet columns rows id...');
const meta = await sharp(file).metadata();
await fs.mkdir('public/discover', { recursive: true });
for (const [i, id] of ids.entries()) {
  if (id === 'skip') continue;
  const left = Math.round(((i % columns) * meta.width) / columns),
    top = Math.round((Math.floor(i / columns) * meta.height) / rows);
  const width = Math.round((((i % columns) + 1) * meta.width) / columns) - left,
    height =
      Math.round(((Math.floor(i / columns) + 1) * meta.height) / rows) - top;
  for (const size of [480, 960])
    await sharp(file)
      .extract({ left, top, width, height })
      .resize(size, (640 * size) / 960, { fit: 'cover', position: 'centre' })
      .webp({ quality: 84 })
      .toFile(`public/discover/${id}-${size}.webp`);
}
