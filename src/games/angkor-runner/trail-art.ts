// Original fictional trail props. No sacred imagery or real monument replicas.
export function drawCart(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#443b2b44';
  ctx.beginPath();
  ctx.ellipse(0, 0, 60, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const x of [-45, 45]) {
    ctx.fillStyle = '#40382a';
    ctx.fillRect(x - 9, -42, 18, 41);
    ctx.fillStyle = '#776343';
    ctx.fillRect(x - 4, -38, 5, 31);
  }
  const wood = ctx.createLinearGradient(-50, -120, 48, -20);
  wood.addColorStop(0, '#bf8b4a');
  wood.addColorStop(1, '#6a4227');
  ctx.fillStyle = wood;
  ctx.fillRect(-52, -78, 104, 53);
  ctx.fillStyle = '#dac28b';
  for (const x of [-26, 5, 29]) {
    ctx.beginPath();
    ctx.ellipse(x, -87, 22, 29, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ac8c54';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = wood;
  for (const y of [-78, -56, -34]) ctx.fillRect(-55, y, 110, 13);
  for (const x of [-49, 42]) {
    ctx.fillRect(x, -124, 7, 99);
    ctx.fillStyle = '#efd39c';
    ctx.fillRect(x, -124, 2, 94);
    ctx.fillStyle = wood;
  }
  ctx.strokeStyle = '#e0ac66';
  ctx.lineWidth = 2;
  for (const y of [-75, -53, -31]) {
    ctx.beginPath();
    ctx.moveTo(-44, y);
    ctx.lineTo(42, y);
    ctx.stroke();
  }
}

export function drawPillar(ctx: CanvasRenderingContext2D) {
  const stone = ctx.createLinearGradient(-27, 0, 30, 0);
  stone.addColorStop(0, '#9c7143');
  stone.addColorStop(0.4, '#d8b77b');
  stone.addColorStop(1, '#88623c');
  ctx.fillStyle = stone;
  ctx.fillRect(-25, -142, 50, 137);
  for (const [y, width, height] of [
    [-8, 72, 8],
    [-20, 62, 12],
    [-143, 65, 12],
    [-152, 55, 9],
  ]) {
    ctx.fillRect(-width / 2, y, width, height);
    ctx.fillStyle = '#ebce97';
    ctx.fillRect(-width / 2, y, width, 2);
    ctx.fillStyle = stone;
  }
  ctx.strokeStyle = '#947144';
  ctx.lineWidth = 2;
  ctx.strokeRect(-17, -128, 34, 94);
  // Simple geometric border, not a religious or historic inscription.
  for (const y of [-111, -86, -61]) {
    ctx.beginPath();
    ctx.moveTo(0, y - 7);
    ctx.lineTo(7, y);
    ctx.lineTo(0, y + 7);
    ctx.lineTo(-7, y);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.fillStyle = '#667340';
  ctx.fillRect(-25, -28, 8, 14);
}
