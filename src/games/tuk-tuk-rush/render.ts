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
  const p = project(400 + side * 300, y);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.scale, p.scale);
  // Five original storefront silhouettes, fixed in place for visual comfort.
  const colors = ['#dcae72', '#b8795e', '#91aaa0', '#c6bba3', '#8a9e71'];
  const heights = [118, 108, 182, 126, 96];
  const height = heights[index];
  ellipse(ctx, 0, 0, 82, 10, '#344b411c');
  rounded(ctx, -72, -height, 144, height - 5, 3, colors[index]);
  if (index === 1 || index === 4) {
    poly(
      ctx,
      [
        [-82, -height],
        [0, -height - 40],
        [82, -height],
      ],
      index === 1 ? '#a04d3b' : '#6d7955',
    );
  } else
    rounded(
      ctx,
      -79,
      -height - 8,
      158,
      12,
      2,
      index === 2 ? '#e5d5ac' : '#ead2a5',
    );
  rounded(ctx, -59, -66, 118, 57, 2, '#3f5552');
  ctx.fillStyle = '#304e43';
  ctx.font = 'bold 16px Inter, Noto Sans Khmer, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(index % 2 ? 'សួស្តី' : 'ផ្សារ', 0, index === 2 ? -83 : -height + 22);
  if (index === 0) {
    // Fruit stall: broad striped canopy and wooden produce crates.
    for (let i = 0; i < 6; i++)
      rounded(ctx, -81 + i * 27, -86, 27, 24, 2, i % 2 ? '#f2dbaf' : '#c58943');
    for (let i = 0; i < 3; i++) {
      rounded(ctx, -60 + i * 42, -30, 36, 23, 1, '#ab774b');
      for (let j = 0; j < 3; j++)
        ellipse(
          ctx,
          -53 + i * 42 + j * 10,
          -34,
          6,
          7,
          i % 2 ? '#98ad50' : '#efbd57',
        );
    }
  } else if (index === 1) {
    // Food kiosk: tiled roof, open serving counter and bowls.
    rounded(ctx, -63, -18, 126, 11, 2, '#e0b980');
    for (const x of [-37, 0, 37]) {
      ellipse(ctx, x, -24, 13, 5, '#f3e2bc');
      rounded(ctx, x - 9, -25, 18, 5, 2, '#69806c');
    }
    rounded(ctx, -64, -82, 128, 14, 2, '#f1d6a1');
  } else if (index === 2) {
    // Textile shophouse: upstairs shutters and hanging patterned cloth.
    for (const x of [-51, 12]) {
      rounded(ctx, x, -160, 39, 49, 2, '#456c68');
      for (let k = 0; k < 4; k++)
        rounded(ctx, x + 4, -151 + k * 9, 31, 3, 0, '#9cb7a4');
    }
    for (let k = 0; k < 4; k++) {
      const x = -51 + k * 28;
      rounded(ctx, x, -65, 22, 49, 1, k % 2 ? '#bf7866' : '#d5bd8d');
      for (let row = 0; row < 4; row++)
        rounded(ctx, x, -59 + row * 11, 22, 2, 0, '#efe0bb');
    }
  } else if (index === 3) {
    // Repair shop: wide roller door, tyres and tool board.
    rounded(ctx, -59, -100, 118, 26, 1, '#7e8b83');
    for (let k = 0; k < 4; k++)
      rounded(ctx, -57, -97 + k * 6, 114, 2, 0, '#b8bca9');
    for (const x of [-36, 0]) {
      ellipse(ctx, x, -25, 15, 19, '#344443');
      ellipse(ctx, x, -25, 7, 10, '#b1b8a3');
    }
    rounded(ctx, 25, -58, 25, 44, 2, '#b79b72');
    for (const x of [30, 40]) rounded(ctx, x, -52, 4, 29, 1, '#d5d7bd');
  } else {
    // Plant shop: timber slats, pitched green roof and potted foliage.
    for (let k = 0; k < 6; k++)
      rounded(ctx, -69 + k * 25, -height + 4, 3, height - 9, 0, '#687d58');
    for (const x of [-47, -14, 24, 51]) {
      rounded(ctx, x - 9, -20, 18, 19, 3, '#ba8059');
      ellipse(ctx, x, -34, 12, 18, '#416f51');
      ellipse(ctx, x + 8, -28, 9, 12, '#669456');
    }
  }
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
  // Only restrained lane markings move. Curbs and scenery stay anchored.
  for (let y = -150; y < 700; y += 130) {
    const offset = y + (reduced ? 0 : (scroll * 0.25) % 130);
    for (const x of [340, 460])
      roadBand(ctx, x - 1.5, x + 1.5, offset, offset + 54, '#bfc3b1');
  }
  const stores = [
    { side: -1, y: 120, style: 0 },
    { side: 1, y: 45, style: 2 },
    { side: 1, y: 285, style: 1 },
    { side: -1, y: 445, style: 3 },
    { side: 1, y: 570, style: 4 },
  ];
  for (const { side, y, style } of stores) shop(ctx, side, y, style);
  for (const [side, y] of [
    [-1, 280],
    [1, 420],
  ]) {
    const p = project(400 + side * 246, y);
    palm(ctx, p.x, p.y, p.scale * 0.48);
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
