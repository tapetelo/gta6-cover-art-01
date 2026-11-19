// Original canvas-drawn decoration for SOLSTICE Cover Lab: palm silhouettes,
// a striped sun disc, halftone dots, film grain and scanlines. Every shape is
// drawn from paths here — no artwork is copied from anywhere.

// Draws one palm silhouette: a curved trunk with broad drooping fronds,
// rooted at (x, y) and rising `height` pixels. `lean` bends the crown
// sideways. Each frond is a filled tapered leaf, not a thin stroke.
export function drawPalm(ctx, x, y, height, lean, colour) {
  const topX = x + lean * height * 0.32;
  const topY = y - height;
  ctx.save();
  ctx.fillStyle = colour;
  // Trunk: a tapered curve from the root up to the crown.
  ctx.beginPath();
  const w0 = height * 0.032;
  const w1 = height * 0.012;
  ctx.moveTo(x - w0, y);
  ctx.quadraticCurveTo(x + lean * height * 0.16 - w0 * 0.4, y - height * 0.55, topX - w1, topY);
  ctx.lineTo(topX + w1, topY);
  ctx.quadraticCurveTo(x + lean * height * 0.16 + w0 * 0.4, y - height * 0.55, x + w0, y);
  ctx.closePath();
  ctx.fill();
  // Fronds: filled leaves fanning from the crown, longest at the sides.
  const fronds = 8;
  for (let i = 0; i < fronds; i++) {
    const t = i / (fronds - 1);
    const spread = (t - 0.5) * 2; // -1 (far left) .. 1 (far right)
    const reach = height * (0.30 + 0.16 * Math.abs(spread));
    const endX = topX + spread * reach;
    const endY = topY + reach * (0.34 + 0.30 * Math.abs(spread));
    const midX = topX + spread * reach * 0.55;
    const midY = topY - reach * 0.30;
    const leafW = height * 0.035;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(midX, midY - leafW, endX, endY);
    ctx.quadraticCurveTo(midX, midY + leafW * 0.6, topX, topY + leafW * 0.4);
    ctx.closePath();
    ctx.fill();
  }
  // Coconuts: two small circles under the crown.
  ctx.beginPath();
  ctx.arc(topX - height * 0.026, topY + height * 0.032, height * 0.024, 0, Math.PI * 2);
  ctx.arc(topX + height * 0.030, topY + height * 0.040, height * 0.020, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Draws the striped sun disc: a circle filled with a vertical gradient, with
// thin horizontal gaps cut into its lower half (the classic sunset look).
export function drawSunDisc(ctx, cx, cy, radius, topColour, midColour, bottomColour) {
  ctx.save();
  const grad = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
  grad.addColorStop(0, topColour);
  grad.addColorStop(0.55, midColour);
  grad.addColorStop(1, bottomColour);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  // Cut the stripes: clear thin bands, wider toward the bottom.
  ctx.globalCompositeOperation = 'destination-out';
  let y = cy + radius * 0.08;
  let band = radius * 0.03;
  while (y < cy + radius) {
    ctx.fillRect(cx - radius, y, radius * 2, band);
    y += band + radius * 0.075;
    band *= 1.45;
  }
  ctx.restore();
}

// Builds a small tile of random grey noise used as a repeating grain pattern.
let grainTile = null;
export function makeGrainPattern(ctx) {
  if (!grainTile) {
    grainTile = document.createElement('canvas');
    grainTile.width = 140;
    grainTile.height = 140;
    const g = grainTile.getContext('2d');
    const img = g.createImageData(140, 140);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 90 + Math.floor(Math.random() * 120);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  return ctx.createPattern(grainTile, 'repeat');
}

// Overlays halftone dots: a grid of dark dots whose size follows the local
// brightness sampled from `source` (a canvas holding the graded photo).
export function drawHalftone(ctx, source, w, h, cell) {
  const sample = document.createElement('canvas');
  const cols = Math.max(8, Math.floor(w / cell));
  const rows = Math.max(8, Math.floor(h / cell));
  sample.width = cols;
  sample.height = rows;
  const sctx = sample.getContext('2d');
  sctx.drawImage(source, 0, 0, cols, rows);
  let data;
  try {
    data = sctx.getImageData(0, 0, cols, rows).data;
  } catch {
    return;
  }
  ctx.save();
  ctx.fillStyle = 'rgba(10, 6, 24, 0.55)';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 4;
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      const radius = (1 - lum) * cell * 0.42;
      if (radius < 0.4) continue;
      ctx.beginPath();
      ctx.arc((c + 0.5) * cell, (r + 0.5) * cell, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Posterises a canvas in place: snaps every channel to `levels` steps.
export function posterize(canvas, levels) {
  const ctx = canvas.getContext('2d');
  let img;
  try {
    img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch {
    return;
  }
  const step = 255 / (levels - 1);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.round(Math.round(d[i] / step) * step);
    d[i + 1] = Math.round(Math.round(d[i + 1] / step) * step);
    d[i + 2] = Math.round(Math.round(d[i + 2] / step) * step);
  }
  ctx.putImageData(img, 0, 0);
}

// Draws faint horizontal scanlines over the whole cover.
export function drawScanlines(ctx, w, h, spacing) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
  for (let y = 0; y < h; y += spacing) {
    ctx.fillRect(0, y, w, Math.max(1, spacing * 0.35));
  }
  ctx.restore();
}
