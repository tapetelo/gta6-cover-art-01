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
