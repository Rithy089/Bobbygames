export const config = {
  perfectTolerance: 7,
  baseWidth: 230,
  blockHeight: 31,
  maxSeconds: 3600,
};
export type Block = { x: number; width: number };
export function place(previous: Block, moving: Block) {
  const delta = moving.x - previous.x;
  if (Math.abs(delta) <= config.perfectTolerance)
    return { x: previous.x, width: previous.width, perfect: true, miss: false };
  const x = Math.max(previous.x, moving.x);
  const width = Math.max(
    0,
    Math.min(previous.x + previous.width, moving.x + moving.width) - x,
  );
  return { x, width, perfect: false, miss: width <= 0 };
}
export const difficulty = (height: number) => Math.min(380, 130 + height * 9);
export function award(height: number, combo: number, perfect: boolean) {
  return {
    height: height + 1,
    score: height + 1,
    combo: perfect ? combo + 1 : 0,
  };
}
