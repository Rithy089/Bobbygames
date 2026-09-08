const images = new Map<string, HTMLImageElement>();
// Only called by a lazy-loaded game route; never by the catalog.
export async function loadSprites(ids: string[]) {
  await Promise.all(
    ids.map(async (id) => {
      if (images.has(id)) return;
      const img = new Image();
      img.src =
        id === 'tower-bg' || id === 'street-bg'
          ? `/scenes/${id}.webp`
          : id === 'countryside'
            ? '/discover/countryside-960.webp'
            : `/sprites/${id}.webp`;
      await img.decode();
      images.set(id, img);
    }),
  );
}
export function sprite(
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number,
  y: number,
  w: number,
  h = w,
) {
  const img = images.get(id);
  if (!img) return false;
  ctx.drawImage(img, x, y, w, h);
  return true;
}
