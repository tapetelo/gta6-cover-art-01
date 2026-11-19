// Bold cover lettering for SOLSTICE Cover Lab: huge condensed-style capitals
// with a vertical pink-to-yellow gradient fill, a dark outline and a drop
// shadow, auto-fitted to the cover width. System fonts only — nothing here
// is copied from any game.

// The condensed stack: Arial Black and Impact ship with desktop systems; the
// generic fallbacks keep the lettering bold where they are missing.
export const TITLE_FONT = '"Arial Black", Impact, "Franklin Gothic Heavy", sans-serif';
export const SUB_FONT = 'Impact, "Arial Black", "Franklin Gothic Heavy", sans-serif';

// Picks the largest font size (starting at `start`) whose rendered width fits
// inside `maxWidth`. Returns the size in pixels.
export function fitFontSize(ctx, text, fontFamily, start, maxWidth) {
  let size = start;
  ctx.font = `${size}px ${fontFamily}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= Math.max(1, Math.floor(size * 0.04));
    ctx.font = `${size}px ${fontFamily}`;
  }
  return size;
}

// Draws one line of gradient lettering centred at (cx, baselineY).
// `arcLift` > 0 bends the line along a shallow arc, letter by letter.
export function drawGradientLine(ctx, text, cx, baselineY, size, fontFamily, arcLift) {
  ctx.save();
  ctx.font = `${size}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const grad = ctx.createLinearGradient(0, baselineY - size, 0, baselineY);
  grad.addColorStop(0, '#ffe95e');
  grad.addColorStop(0.45, '#ffb347');
  grad.addColorStop(0.75, '#ff5e3a');
  grad.addColorStop(1, '#ff2e88');
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(8, 2, 20, 0.85)';
  ctx.shadowBlur = size * 0.12;
  ctx.shadowOffsetY = size * 0.06;

  if (!arcLift) {
    ctx.strokeStyle = '#160a2e';
    ctx.lineWidth = Math.max(2, size * 0.14);
    ctx.strokeText(text, cx, baselineY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = grad;
    ctx.fillText(text, cx, baselineY);
    // A thin bright top edge so the letters read as glossy.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillText(text, cx, baselineY - size * 0.02);
    ctx.restore();
    return;
  }

  // Arced line: lay the letters along a parabola, each rotated to its slope.
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  [...text].forEach((ch, i) => {
    const w = widths[i];
    const t = total === 0 ? 0 : (x + w / 2 - cx) / (total / 2);
    const lift = arcLift * (1 - t * t);
    const slope = Math.atan2(-2 * arcLift * t, total / 2);
    ctx.save();
    ctx.translate(x + w / 2, baselineY - lift);
    ctx.rotate(slope);
    ctx.strokeStyle = '#160a2e';
    ctx.lineWidth = Math.max(2, size * 0.14);
    ctx.strokeText(ch, 0, 0);
    ctx.fillStyle = grad;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    x += w;
  });
  ctx.restore();
}

// Draws one five-pointed star centred at (cx, cy) with outer radius `r`.
function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// Draws a row of `count` gold stars centred at (cx, cy) — the classic
// "wanted level" row, drawn from paths like everything else here.
export function drawStarRow(ctx, cx, cy, count, size) {
  if (!count) return;
  ctx.save();
  ctx.fillStyle = '#ffd21a';
  ctx.strokeStyle = '#160a2e';
  ctx.lineWidth = Math.max(1.5, size * 0.1);
  ctx.shadowColor = 'rgba(8, 2, 20, 0.85)';
  ctx.shadowBlur = size * 0.35;
  const step = size * 2.3;
  const startX = cx - ((count - 1) * step) / 2;
  for (let i = 0; i < count; i++) {
    drawStar(ctx, startX + i * step, cy, size);
    ctx.stroke();
  }
  ctx.restore();
}

// Draws the circular cover seal: a double ring with a sun-and-palm emblem
// and the word SOLSTICE curved along the bottom edge. All original paths.
export function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.shadowColor = 'rgba(8, 2, 20, 0.8)';
  ctx.shadowBlur = r * 0.18;
  ctx.shadowOffsetY = r * 0.05;
  const face = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  face.addColorStop(0, '#ffe95e');
  face.addColorStop(0.5, '#ff8a3c');
  face.addColorStop(1, '#ff2e88');
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#160a2e';
  ctx.lineWidth = r * 0.07;
  ctx.stroke();
  ctx.lineWidth = r * 0.03;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  // Mini sun + horizon inside the ring.
  ctx.fillStyle = '#160a2e';
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.08, r * 0.3, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - r * 0.55, cy + r * 0.02, r * 1.1, r * 0.05);
  ctx.fillRect(cx - r * 0.42, cy + r * 0.14, r * 0.84, r * 0.04);
  // Curved word along the lower arc.
  const word = 'SOLSTICE';
  ctx.fillStyle = '#160a2e';
  ctx.font = `${r * 0.24}px ${SUB_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const spread = 1.5;
  [...word].forEach((ch, i) => {
    const t = word.length === 1 ? 0 : i / (word.length - 1);
    const ang = Math.PI * (0.5 + (t - 0.5) * spread);
    const x = cx + Math.cos(ang) * r * 0.62;
    const y = cy + Math.sin(ang) * r * 0.62;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang + Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

// Draws the title block OVER the artwork (Collage 9 / Slash / Key Art):
// a huge gradient title across the middle-lower third with a heavier
// outline, the star row and quote above it, the seal in a corner.
export function drawLetteringOverArt(ctx, w, h, opts) {
  const { title, subtitle, quote, tiltDeg, arc, seal, stars } = opts;
  const cleanTitle = (title || '').trim().toUpperCase() || 'SOLSTICE';
  const cleanSub = (subtitle || '').trim().toUpperCase();
  const cleanQuote = (quote || '').trim();
  const maxW = w * 0.96;
  const titleY = h * 0.80;

  // Soft dark scrim behind the words so they stay readable over busy art.
  const scrim = ctx.createLinearGradient(0, h * 0.52, 0, h);
  scrim.addColorStop(0, 'rgba(10, 4, 26, 0)');
  scrim.addColorStop(0.45, 'rgba(10, 4, 26, 0.42)');
  scrim.addColorStop(1, 'rgba(10, 4, 26, 0.78)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.52, w, h * 0.48);

  ctx.save();
  ctx.translate(w / 2, titleY);
  ctx.rotate((tiltDeg * Math.PI) / 180);
  ctx.translate(-w / 2, -titleY);

  if (stars) drawStarRow(ctx, w / 2, h * 0.635, stars, Math.min(w, h) * 0.026);

  const titleSize = fitFontSize(ctx, cleanTitle, TITLE_FONT, h * 0.145, maxW);
  drawGradientLine(ctx, cleanTitle, w / 2, titleY, titleSize, TITLE_FONT, arc ? titleSize * 0.35 : 0);

  if (cleanSub) {
    const spaced = [...cleanSub].join(' ');
    const subSize = fitFontSize(ctx, spaced, SUB_FONT, h * 0.052, maxW * 0.92);
    ctx.font = `${subSize}px ${SUB_FONT}`;
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#160a2e';
    ctx.lineWidth = Math.max(2, subSize * 0.16);
    ctx.shadowColor = 'rgba(8, 2, 20, 0.85)';
    ctx.shadowBlur = subSize * 0.15;
    ctx.shadowOffsetY = subSize * 0.06;
    ctx.strokeText(spaced, w / 2, h * 0.885);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(spaced, w / 2, h * 0.885);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  if (cleanQuote) {
    const qSize = fitFontSize(ctx, `“${cleanQuote}”`, SUB_FONT, h * 0.034, maxW * 0.8);
    ctx.font = `italic ${qSize}px ${SUB_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe95e';
    ctx.shadowColor = 'rgba(8, 2, 20, 0.9)';
    ctx.shadowBlur = qSize * 0.2;
    ctx.fillText(`“${cleanQuote}”`, w / 2, h * 0.945);
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  if (seal) drawSeal(ctx, w * 0.875, h * 0.115, Math.min(w, h) * 0.085);
}

// Draws the title and subtitle block at the foot of the cover. The block is
// tilted by `tiltDeg` degrees around its centre and scaled to fit `w`.
export function drawLettering(ctx, w, h, title, subtitle, tiltDeg, arc) {
  const cleanTitle = (title || '').trim().toUpperCase() || 'SOLSTICE';
  const cleanSub = (subtitle || '').trim().toUpperCase();
  const zoneTop = h * 0.715;
  const zoneH = h - zoneTop;
  const maxW = w * 0.94;

  ctx.save();
  ctx.translate(w / 2, zoneTop + zoneH / 2);
  ctx.rotate((tiltDeg * Math.PI) / 180);
  ctx.translate(-w / 2, -(zoneTop + zoneH / 2));

  // Title: as large as fits, capped by the zone height.
  let titleSize = fitFontSize(ctx, cleanTitle, TITLE_FONT, zoneH * (cleanSub ? 0.52 : 0.62), maxW);
  const titleY = zoneTop + zoneH * (cleanSub ? 0.58 : 0.68);
  drawGradientLine(ctx, cleanTitle, w / 2, titleY, titleSize, TITLE_FONT, arc ? titleSize * 0.35 : 0);

  if (cleanSub) {
    // Subtitle with wide letter-spacing, in flat white with a dark edge.
    const spaced = [...cleanSub].join('\u2009');
    const subSize = fitFontSize(ctx, spaced, SUB_FONT, zoneH * 0.24, maxW * 0.9);
    ctx.font = `${subSize}px ${SUB_FONT}`;
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#160a2e';
    ctx.lineWidth = Math.max(2, subSize * 0.16);
    ctx.shadowColor = 'rgba(8, 2, 20, 0.8)';
    ctx.shadowBlur = subSize * 0.15;
    ctx.shadowOffsetY = subSize * 0.06;
    const subY = zoneTop + zoneH * 0.92;
    ctx.strokeText(spaced, w / 2, subY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(spaced, w / 2, subY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.restore();
}
