// The cover renderer for SOLSTICE Cover Lab: paints the background, the photo
// panels with the chosen colour grade, the drawn decoration, and the lettering
// onto any canvas at any size. The preview and every PNG export go through
// this one function, so what you see is exactly what you download.

import { gradeById, layoutById } from './state.js';
import { drawHalftone, drawPalm, drawScanlines, drawSunDisc, makeGrainPattern, posterize } from './decor.js';
import { drawLettering } from './lettering.js';

// Converts a layout panel (fractions) to pixel geometry for a w×h cover.
export function panelRect(panel, w, h) {
  return { x: panel.x * w, y: panel.y * h, w: panel.w * w, h: panel.h * h };
}

// Traces a panel's clip path (its polygon when it has one, else its rect).
function tracePanel(ctx, panel, w, h) {
  ctx.beginPath();
  if (panel.poly) {
    panel.poly.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px * w, py * h);
      else ctx.lineTo(px * w, py * h);
    });
    ctx.closePath();
  } else {
    const r = panelRect(panel, w, h);
    ctx.rect(r.x, r.y, r.w, r.h);
  }
}

// Draws one photo into one panel honouring its zoom and pan. The photo is
// cover-fitted, then scaled by `zoom` and shifted by the pan fractions.
function drawPhotoInPanel(ctx, img, rect, crop, grade) {
  const coverScale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const scale = coverScale * crop.zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const spareX = pw - rect.w;
  const spareY = ph - rect.h;
  const dx = rect.x - spareX / 2 + crop.panX * (spareX / 2);
  const dy = rect.y - spareY / 2 + crop.panY * (spareY / 2);
  ctx.save();
  ctx.filter = grade.filter;
  ctx.drawImage(img, dx, dy, pw, ph);
  ctx.filter = 'none';
  // Colour wash over the photo, in the grade's blend mode.
  ctx.globalCompositeOperation = grade.blend;
  const wash = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  grade.wash.forEach(([at, colour]) => wash.addColorStop(at, colour));
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

// Paints the empty-panel placeholder: a dark gradient with a plus mark, so a
// cover with no photos yet still reads as a designed poster.
function drawEmptyPanel(ctx, rect, grade, index) {
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  grad.addColorStop(0, grade.bg[1]);
  grad.addColorStop(1, grade.bg[0]);
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = Math.max(2, rect.w * 0.012);
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const arm = Math.min(rect.w, rect.h) * 0.14;
  ctx.beginPath();
  ctx.moveTo(cx - arm, cy);
  ctx.lineTo(cx + arm, cy);
  ctx.moveTo(cx, cy - arm);
  ctx.lineTo(cx, cy + arm);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = `${Math.max(11, rect.w * 0.055)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`PANEL ${index + 1}`, cx, cy + arm + rect.h * 0.09);
  ctx.restore();
}

// Renders the full cover. `opts.highlight` (a panel index, or -1) draws the
// editor's selection outline; exports pass -1 so nothing extra is baked in.
export function renderCover(canvas, state, opts = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = gradeById(state.gradeId);
  const layout = layoutById(state.layoutId);
  const shortSide = Math.min(w, h);

  // Background: a deep gradient in the grade's colours.
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, grade.bg[0]);
  bg.addColorStop(0.62, grade.bg[1]);
  bg.addColorStop(1, grade.bg[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Sun disc behind the panels, centred on the panel zone.
  if (state.showSun) {
    const sunLayer = document.createElement('canvas');
    sunLayer.width = w;
    sunLayer.height = h;
    drawSunDisc(sunLayer.getContext('2d'), w / 2, h * 0.37, shortSide * 0.34, '#ffe95e', '#ff8a3c', '#ff2e88');
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(sunLayer, 0, 0);
    ctx.restore();
  }

  // Panels.
  layout.panels.forEach((panel, i) => {
    const rect = panelRect(panel, w, h);
    const crop = state.panels[i] ?? { photo: 0, zoom: 1, panX: 0, panY: 0 };
    const photo = state.photos[crop.photo];
    ctx.save();
    tracePanel(ctx, panel, w, h);
    ctx.clip();
    if (photo) {
      drawPhotoInPanel(ctx, photo.img, rect, crop, grade);
    } else {
      drawEmptyPanel(ctx, rect, grade, i);
    }
    ctx.restore();
    // Panel keyline.
    ctx.save();
    tracePanel(ctx, panel, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(2, shortSide * 0.004);
    ctx.stroke();
    ctx.restore();
  });

  // Halftone / pop treatment over the panel zone.
  if (state.halftone) {
    const zone = document.createElement('canvas');
    zone.width = w;
    zone.height = Math.round(h * 0.72);
    zone.getContext('2d').drawImage(canvas, 0, 0, w, zone.height, 0, 0, w, zone.height);
    posterize(zone, 5);
    ctx.drawImage(zone, 0, 0);
    drawHalftone(ctx, zone, w, zone.height, Math.max(6, shortSide * 0.012));
  }

  // Palm silhouettes rooted at the outer corners of the panel zone, kept
  // short so they frame the photos instead of covering faces.
  if (state.showPalms) {
    const ink = 'rgba(10, 4, 26, 0.92)';
    drawPalm(ctx, w * 0.015, h * 0.715, h * 0.20, 0.5, ink);
    drawPalm(ctx, w * 0.985, h * 0.715, h * 0.23, -0.5, ink);
  }

  // Vignette.
  if (state.vignette > 0) {
    const vig = ctx.createRadialGradient(w / 2, h / 2, shortSide * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, `rgba(4, 0, 14, ${0.75 * state.vignette})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  // Grain.
  if (state.grain > 0) {
    ctx.save();
    ctx.globalAlpha = state.grain * 0.5;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = makeGrainPattern(ctx);
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  if (state.scanlines) drawScanlines(ctx, w, h, Math.max(3, shortSide * 0.006));

  // Lettering last, so it sits on top of every effect.
  drawLettering(ctx, w, h, state.title, state.subtitle, state.tilt, state.arc);

  // Editor selection outline (never exported).
  const hi = opts.highlight ?? -1;
  if (hi >= 0 && layout.panels[hi]) {
    ctx.save();
    tracePanel(ctx, layout.panels[hi], w, h);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = Math.max(3, shortSide * 0.007);
    ctx.setLineDash([shortSide * 0.02, shortSide * 0.012]);
    ctx.stroke();
    ctx.restore();
  }
}

// Hit-tests a point (in canvas pixels) against the layout's panels.
// Returns the panel index, or -1 when the point lands outside every panel.
export function panelAt(state, w, h, x, y) {
  const layout = layoutById(state.layoutId);
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const panel = layout.panels[i];
    if (panel.poly) {
      // Point-in-polygon, ray casting.
      let inside = false;
      const pts = panel.poly;
      for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) {
        const xi = pts[a][0] * w;
        const yi = pts[a][1] * h;
        const xj = pts[b][0] * w;
        const yj = pts[b][1] * h;
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) return i;
    } else {
      const r = panelRect(panel, w, h);
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
    }
  }
  return -1;
}
