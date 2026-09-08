import { rounded, palm } from '../shared/draw';

// Logical collision space stays fixed; the renderer projects everything through
// the same camera. No camera shake or field-of-view changes during driving.
export const project = (x: number, y: number) => {
  const depth = Math.max(0, (y + 70) / 670);
  const scale = 0.22 + depth * 0.88;
  return { x: 400 + (x - 400) * scale, y: 126 + depth * 474, scale };
};
type Ctx = CanvasRenderingContext2D;
function poly(ctx: Ctx, points: number[][], fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
}
function ellipse(
  ctx: Ctx,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function roadBand(
  ctx: Ctx,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  color: string,
) {
  const a = project(x1, y1),
    b = project(x2, y1),
    c = project(x2, y2),
    d = project(x1, y2);
  poly(
    ctx,
    [
      [a.x, a.y],
      [b.x, b.y],
      [c.x, c.y],
      [d.x, d.y],
    ],
    color,
  );
}
function shop(ctx: Ctx, side: number, y: number, index: number) {
  const p = project(400 + side * 340, y);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.scale, p.scale);
  const color = ['#e8b87f', '#83aa9c', '#d58d73', '#ced3ae'][index % 4];
  ellipse(ctx, 5, 0, 94, 15, '#344b4129');
  rounded(ctx, -87, -188, 174, 180, 2, color);
  poly(
    ctx,
    [
      [-87, -188],
      [87, -188],
      [102, -205],
      [-72, -205],
    ],
    '#f3d7a1',
  );
  poly(
    ctx,
    [
      [87, -188],
      [102, -205],
      [102, -25],
      [87, -8],
    ],
    '#8c7961',
  );
  rounded(ctx, -77, -170, 154, 11, 1, '#f6dfb4');
  for (const x of [-61, 8]) {
    rounded(ctx, x, -144, 47, 44, 1, '#42636a');
    rounded(ctx, x + 4, -140, 15, 34, 1, '#93bdb4');
    rounded(ctx, x - 4, -100, 55, 5, 0, '#fae2ae');
  }
  rounded(ctx, -74, -84, 148, 27, 2, '#fff0c9');
  ctx.fillStyle = '#314e45';
  ctx.font = 'bold 17px Inter, Noto Sans Khmer, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(index % 2 ? 'សួស្តី' : 'ផ្សារ', 0, -64);
  rounded(ctx, -72, -52, 144, 45, 1, '#3e5250');
  for (let k = 0; k < 8; k++) {
    const x = -90 + k * 22.5;
    poly(
      ctx,
      [
        [x, -57],
        [x + 22.5, -57],
        [x + 26, -36],
        [x - 3, -36],
      ],
      k % 2 ? '#f6deb0' : '#bb5d4a',
    );
    rounded(ctx, x - 3, -36, 29, 8, 3, k % 2 ? '#e9c998' : '#9e483b');
  }
  rounded(ctx, -66, -15, 132, 10, 1, '#b48151');
  for (let k = 0; k < 7; k++)
    ellipse(ctx, -53 + k * 17, -19, 7, 6, k % 2 ? '#dda539' : '#8fa74a');
  ctx.restore();
}
export function street(ctx: Ctx, scroll: number, reduced: boolean) {
  const sky = ctx.createLinearGradient(0, 0, 0, 180);
  sky.addColorStop(0, '#81b9ca');
  sky.addColorStop(1, '#fbe3ad');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 800, 600);
  ellipse(ctx, 615, 54, 27, 27, '#fff2c4');
  // Fictional Phnom Penh-inspired shophouses, no real businesses or monuments.
  for (let i = 0; i < 15; i++) {
    const x = i * 59 - 14,
      h = 24 + ((i * 17) % 39);
    rounded(ctx, x, 130 - h, 48, h + 20, 1, i % 2 ? '#a8b1a0' : '#bdba9e');
    for (let floor = 0; floor < 3; floor++)
      for (let col = 0; col < 4; col++)
        rounded(
          ctx,
          x + 6 + col * 10,
          135 - h + floor * 12,
          4,
          6,
          0,
          '#82998f55',
        );
  }
  ctx.fillStyle = '#becc9c';
  ctx.fillRect(0, 136, 800, 464);
  roadBand(ctx, 120, 680, -70, 650, '#d9c5a2');
  roadBand(ctx, 192, 608, -70, 650, '#f6e4bd');
  roadBand(ctx, 205, 595, -70, 650, '#535e62');
  roadBand(ctx, 211, 589, -70, 650, '#5c6668');
  // Projected dashed markings and curb tiles supply speed cues without streaks.
  for (let y = -150; y < 700; y += 86) {
    const offset = y + (scroll % 86);
    for (const x of [340, 460])
      roadBand(ctx, x - 2, x + 2, offset, offset + 39, '#eadfbf');
    for (const x of [194, 595])
      roadBand(ctx, x, x + 11, offset, offset + 43, '#b8624d');
  }
  const sceneryScroll = reduced ? 0 : scroll * 0.72;
  const rows = Array.from({ length: 5 }, (_, i) => ({
    y: -100 + i * 200 + (sceneryScroll % 200),
    i: (((i - Math.floor(sceneryScroll / 200)) % 4) + 4) % 4,
  }));
  for (const { y, i } of rows) {
    shop(ctx, -1, y, i);
    shop(ctx, 1, y + 70, i + 1);
    for (const side of [-1, 1]) {
      const p = project(400 + side * 234, y + 88);
      palm(ctx, p.x, p.y, p.scale * 0.63);
      const light = project(400 + side * 210, y + 8);
      ctx.save();
      ctx.translate(light.x, light.y);
      ctx.scale(light.scale, light.scale);
      rounded(ctx, -2, -135, 4, 135, 1, '#596a64');
      rounded(ctx, side < 0 ? 0 : -29, -137, 29, 4, 1, '#596a64');
      rounded(ctx, side < 0 ? 19 : -31, -138, 14, 7, 3, '#fff0ba');
      ctx.restore();
    }
  }
}
export function vehicle(
  ctx: Ctx,
  x: number,
  y: number,
  kind: 'tuk' | 'car',
  variant = 0,
  lean = 0,
  crashed = false,
) {
  const p = project(x, y);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.scale, p.scale);
  ellipse(ctx, 5, 17, kind === 'tuk' ? 48 : 42, 14, '#182d354d');
  ctx.rotate(lean);
  if (kind === 'car') {
    const color = ['#cf785c', '#d7ccaa', '#57999c', '#8797b3'][variant % 4];
    rounded(ctx, -37, -21, 10, 42, 3, '#263335');
    rounded(ctx, 27, -21, 10, 42, 3, '#263335');
    rounded(ctx, -34, -75, 68, 96, 10, color);
    poly(
      ctx,
      [
        [-26, -57],
        [26, -57],
        [30, -23],
        [-30, -23],
      ],
      '#294c57',
    );
    poly(
      ctx,
      [
        [-22, -53],
        [18, -53],
        [-6, -28],
        [-26, -28],
      ],
      '#91bac3',
    );
    rounded(ctx, -25, -18, 50, 25, 5, color);
    rounded(ctx, -28, 9, 15, 7, 2, '#e55047');
    rounded(ctx, 13, 9, 15, 7, 2, '#e55047');
    rounded(ctx, -10, 12, 20, 6, 1, '#f0e3c3');
    rounded(ctx, -29, 23, 58, 4, 2, '#35474b');
  } else {
    // Rear view of an original motorized three-wheeler: canvas canopy,
    // open passenger cabin, padded bench, steel frame, axle and rear lamps.
    rounded(ctx, -45, -9, 13, 41, 4, '#203238');
    rounded(ctx, 32, -9, 13, 41, 4, '#203238');
    rounded(ctx, -41, -3, 4, 29, 2, '#72817e');
    rounded(ctx, 37, -3, 4, 29, 2, '#72817e');
    rounded(ctx, -35, -58, 70, 80, 8, '#247c79');
    rounded(ctx, -31, -54, 62, 56, 5, '#243e43');
    rounded(ctx, -27, -24, 54, 16, 5, '#c07d43');
    rounded(ctx, -27, -8, 54, 9, 3, '#e2a861');
    rounded(ctx, -3, -48, 6, 24, 2, '#51747a');
    ellipse(ctx, 0, -49, 8, 9, '#bb8860');
    poly(
      ctx,
      [
        [-40, -73],
        [34, -73],
        [43, -54],
        [-44, -54],
      ],
      '#b33d36',
    );
    rounded(ctx, -42, -56, 84, 9, 3, '#d15d47');
    for (const sx of [-31, 29]) rounded(ctx, sx, -49, 3, 55, 1, '#d5d7bd');
    rounded(ctx, -36, 4, 72, 25, 4, '#278f89');
    rounded(ctx, -34, 6, 68, 4, 1, '#edc876');
    rounded(ctx, -30, 16, 12, 7, 2, crashed ? '#ff9a6d' : '#e75843');
    rounded(ctx, 18, 16, 12, 7, 2, crashed ? '#ff9a6d' : '#e75843');
    rounded(ctx, -11, 17, 22, 8, 1, '#fff1d2');
    rounded(ctx, -37, 31, 74, 5, 2, '#b8c2b5');
    rounded(ctx, -46, -40, 8, 12, 3, '#d1d8c4');
    rounded(ctx, 38, -40, 8, 12, 3, '#d1d8c4');
    ctx.strokeStyle = '#eec87b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-25, -67);
    ctx.lineTo(25, -67);
    ctx.stroke();
  }
  ctx.restore();
}
export function object(ctx: Ctx, x: number, y: number, type: 'coin' | 'cone') {
  const p = project(x, y);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.scale, p.scale);
  ellipse(ctx, 3, 13, 25, 7, '#233b3b33');
  if (type === 'coin') {
    ellipse(ctx, 0, -7, 19, 21, '#a57927');
    ellipse(ctx, -2, -9, 17, 20, '#ffda6a');
    ctx.strokeStyle = '#bd852e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-2, -9, 11, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    poly(
      ctx,
      [
        [-2, -20],
        [1, -12],
        [9, -9],
        [1, -6],
        [-2, 2],
        [-5, -6],
        [-13, -9],
        [-5, -12],
      ],
      '#fff4b6',
    );
  } else {
    rounded(ctx, -27, 8, 54, 9, 3, '#34454a');
    poly(
      ctx,
      [
        [0, -37],
        [22, 10],
        [-22, 10],
      ],
      '#ef9050',
    );
    poly(
      ctx,
      [
        [0, -37],
        [22, 10],
        [4, 10],
      ],
      '#c8633c',
    );
    poly(
      ctx,
      [
        [-9, -17],
        [9, -17],
        [14, -6],
        [-14, -6],
      ],
      '#fff0cc',
    );
  }
  ctx.restore();
}
