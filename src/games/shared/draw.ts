import { W, H } from './types';
export function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
export function palm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#685740';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(10, -60, 0, -125);
  ctx.stroke();
  ctx.fillStyle = '#235f54';
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.translate(0, -125);
    ctx.rotate((i * Math.PI) / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(40, -32, 72, 12);
    ctx.quadraticCurveTo(28, -7, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
export function countryside(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#9acbbc');
  sky.addColorStop(0.7, '#f7d68d');
  sky.addColorStop(1, '#5d9b64');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffe2a0';
  ctx.beginPath();
  ctx.arc(620, 100, 53, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#88ad73';
  ctx.beginPath();
  ctx.moveTo(0, 340);
  ctx.quadraticCurveTo(300, 250, 800, 340);
  ctx.lineTo(800, H);
  ctx.lineTo(0, H);
  ctx.fill();
  ctx.fillStyle = '#6b9560';
  ctx.fillRect(0, 390, W, 210);
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = '#bfd08b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(i * 130, 405);
    ctx.lineTo(i * 200 - 200, H);
    ctx.stroke();
  }
  palm(ctx, 73, 380, 0.9);
  palm(ctx, 740, 370, 1.2);
  ctx.fillStyle = '#c6a467';
  ctx.fillRect(0, 548, W, 52);
  ctx.fillStyle = '#977748';
  ctx.fillRect(0, 548, W, 7);
}
export function fruit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: 'mango' | 'dragon' | 'stone',
  angle = 0,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (type === 'stone') {
    ctx.fillStyle = '#43515c';
    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.lineTo(3, -21);
    ctx.lineTo(21, -3);
    ctx.lineTo(13, 18);
    ctx.lineTo(-15, 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#99a5a1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(8, 6);
    ctx.moveTo(-3, 9);
    ctx.lineTo(7, -8);
    ctx.stroke();
  } else {
    ctx.fillStyle = type === 'mango' ? '#ffc047' : '#e360a0';
    ctx.beginPath();
    ctx.ellipse(0, 0, type === 'mango' ? 17 : 20, 24, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = type === 'mango' ? '#ffe29a' : '#ffb4d4';
    ctx.beginPath();
    ctx.ellipse(-6, -7, 5, 11, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3b8853';
    ctx.beginPath();
    ctx.ellipse(8, -22, 11, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
export function basket(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = '#7d4b2e';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(x, y - 6, 37, 30, 0, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = '#c58544';
  ctx.beginPath();
  ctx.moveTo(x - 49, y - 8);
  ctx.lineTo(x + 49, y - 8);
  ctx.lineTo(x + 36, y + 30);
  ctx.lineTo(x - 36, y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f2bc6d';
  ctx.lineWidth = 3;
  for (let j = 0; j < 4; j++) {
    ctx.beginPath();
    ctx.moveTo(x - 40, y + j * 8);
    ctx.lineTo(x + 40, y + j * 8);
    ctx.stroke();
  }
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 11, y - 5);
    ctx.lineTo(x + i * 9, y + 30);
    ctx.stroke();
  }
  rounded(ctx, x - 51, y - 13, 102, 11, 5, '#edb664');
}
