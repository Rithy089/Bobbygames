import { project } from './rules';
import { sprite } from '../shared/sprites';

// Same world speed as obstacles. Perspective makes near details pass faster.
// Wrap behind the camera and fade at the horizon, never inside the visible trail.
export function sceneryDepth(
  index: number,
  spacing: number,
  distance: number,
  count: number,
) {
  const span = spacing * count;
  return ((((index * spacing - distance * 3 + 40) % span) + span) % span) - 40;
}

export function drawScenery(
  ctx: CanvasRenderingContext2D,
  distance: number,
  reduced: boolean,
  environment: number[] = [1, 0, 0, 0, 0],
) {
  const travel = reduced ? 0 : distance;
  ctx.save();
  // Paving joints flow only in the courtyard; remain below all gameplay objects.
  if (environment[3] > 0) {
    ctx.strokeStyle = '#947345';
    ctx.lineWidth = 1;
    ctx.globalAlpha = environment[3] * 0.22;
    for (let i = 0; i < 22; i++) {
      const z = sceneryDepth(i, 22, travel, 22);
      const left = project(-2, z),
        right = project(2, z);
      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();
    }
  }
  // Broken, low-contrast sand ripples give the trail a flowing surface.
  for (let i = 0; i < 56; i++) {
    const z = sceneryDepth(i, 8, travel, 56);
    if (z < -24) continue;
    const lane = (((i * 13) % 23) - 11) / 8;
    const p = project(lane, z);
    ctx.globalAlpha = Math.min(1, (424 - z) / 65) * 0.17;
    ctx.strokeStyle = i % 3 ? '#997341' : '#ffe1a0';
    ctx.lineWidth = 2.5 * p.scale;
    ctx.beginPath();
    ctx.moveTo(p.x - 14 * p.scale, p.y);
    ctx.quadraticCurveTo(
      p.x,
      p.y + 3 * p.scale,
      p.x + 20 * p.scale,
      p.y - p.scale,
    );
    ctx.stroke();
  }
  // Only roadside decoration: all silhouettes stay outside the playable lanes.
  const roadside = Array.from({ length: 24 }, (_, i) => ({
    i,
    z: sceneryDepth(i, 22, travel, 24),
  })).sort((a, b) => b.z - a.z);
  for (const { i, z } of roadside) {
    const side = i % 2 ? 1 : -1;
    const p = project(side * (2.65 + (i % 3) * 0.3), z);
    if (p.x < -100 || p.x > 900) continue;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, (488 - z) / 90));
    ctx.translate(p.x, p.y);
    ctx.scale(p.scale, p.scale);
    ctx.fillStyle = '#43513233';
    ctx.beginPath();
    ctx.ellipse(0, 2, 28, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    const pillarOpacity =
      i % 3 === 0
        ? environment[3] + (i % 6 === 0 ? environment[0] * 0.55 : 0)
        : 0;
    if (pillarOpacity > 0) {
      ctx.save();
      ctx.globalAlpha *= pillarOpacity;
      sprite(ctx, 'runner-pillar-v2', -52, -137, 104, 137);
      ctx.restore();
    }
    if (i % 4 === 0) {
      // Small rounded roadside stones differ clearly from tall collision rocks.
      const stone = ctx.createLinearGradient(0, -17, 0, 2);
      stone.addColorStop(0, '#b4a27a');
      stone.addColorStop(1, '#796e4e');
      ctx.fillStyle = stone;
      ctx.beginPath();
      ctx.moveTo(-21, 0);
      ctx.lineTo(-15, -11);
      ctx.lineTo(3, -17);
      ctx.lineTo(19, -9);
      ctx.lineTo(24, 1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c4b18a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-13, -10);
      ctx.lineTo(3, -14);
      ctx.lineTo(14, -8);
      ctx.stroke();
    } else {
      // Original stylized broad-leaf plants, no extra asset downloads.
      for (let leaf = -2; leaf <= 2; leaf++) {
        const tipX = leaf * 17;
        const tipY = -43 + Math.abs(leaf) * 8 - (i % 3) * 5;
        const green = ctx.createLinearGradient(0, 0, tipX, tipY);
        green.addColorStop(0, '#344c25');
        green.addColorStop(0.65, leaf % 2 ? '#647b32' : '#809040');
        green.addColorStop(1, '#adab57');
        ctx.fillStyle = green;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(tipX - 15, tipY * 0.65, tipX, tipY);
        ctx.quadraticCurveTo(tipX + 10, tipY * 0.45, 0, 0);
        ctx.fill();
        ctx.strokeStyle = '#acb764';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(tipX * 0.65, tipY * 0.55, tipX, tipY);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  ctx.restore();
}
