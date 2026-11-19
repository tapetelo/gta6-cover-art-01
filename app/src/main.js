// SOLSTICE Cover Lab — the editor wiring. Loads photos from this machine
// (file picker, drag-and-drop, or the bundled samples), keeps the preview
// canvas in sync with the controls, handles per-panel crop gestures, and
// exports the finished cover as a PNG. Nothing is uploaded anywhere.

import { EXPORT_SIZES, GRADES, LAYOUTS, MAX_PHOTOS, freshPanel, sizeById, state, syncPanels } from './state.js';
import { panelAt, panelRect, renderCover } from './render.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const zoomInput = document.getElementById('zoom');
const panelPhotoSelect = document.getElementById('panel-photo');

function say(text) {
  statusEl.textContent = text;
}

// Loads an image from a URL (a local file's object URL, or a bundled sample),
// resolving once it can be drawn.
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

// Repaints the preview at the chosen export size, highlighting the selected
// panel so crop gestures have a visible target. In cover-screenshot mode the
// outline is suppressed so the shot shows the exported artwork alone.
function redraw() {
  const size = sizeById(state.exportSize);
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  const highlight = document.body.classList.contains('shot-cover') ? -1 : state.selected;
  renderCover(canvas, state, { highlight });
  syncCropControls();
}

// Keeps the zoom slider and panel-photo picker showing the selected panel.
function syncCropControls() {
  const panel = state.panels[state.selected];
  if (panel) zoomInput.value = String(panel.zoom);
  panelPhotoSelect.replaceChildren();
  state.photos.forEach((photo, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `Photo ${i + 1} — ${photo.name}`;
    panelPhotoSelect.append(opt);
  });
  if (!state.photos.length) {
    const opt = document.createElement('option');
    opt.textContent = 'No photos yet';
    panelPhotoSelect.append(opt);
  }
  if (panel) panelPhotoSelect.value = String(Math.min(panel.photo, Math.max(0, state.photos.length - 1)));
}

// Renders the loaded-photo list with thumbnails and remove buttons.
function renderPhotoList() {
  const list = document.getElementById('photo-list');
  list.replaceChildren();
  state.photos.forEach((photo, i) => {
    const li = document.createElement('li');
    const thumb = document.createElement('img');
    thumb.src = photo.img.src;
    thumb.alt = '';
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = `${i + 1}. ${photo.name}`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      state.photos.splice(i, 1);
      state.panels.forEach((p) => {
        if (p.photo >= state.photos.length) p.photo = Math.max(0, state.photos.length - 1);
      });
      syncPanels();
      renderPhotoList();
      redraw();
    });
    li.append(thumb, name, remove);
    list.append(li);
  });
}

// Adds one loaded image to the photo pool (capped at MAX_PHOTOS) and spreads
// it across panels that have no photo of their own yet.
function addPhoto(img, name) {
  if (state.photos.length >= MAX_PHOTOS) {
    say(`Photo limit reached (${MAX_PHOTOS}). Remove one first.`);
    return;
  }
  state.photos.push({ img, name });
  const index = state.photos.length - 1;
  syncPanels();
  state.panels.forEach((panel, i) => {
    if (state.photos.length === 1) panel.photo = 0;
    else if (i % state.photos.length === index) panel.photo = index;
  });
  renderPhotoList();
  redraw();
  say(`Added ${name}. ${state.photos.length} of ${MAX_PHOTOS} photos loaded.`);
}

// Adds every image file from a FileList (picker or drop).
async function addFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    try {
      const img = await loadImage(URL.createObjectURL(file));
      addPhoto(img, file.name);
    } catch {
      say(`Could not read ${file.name}.`);
    }
  }
}

// Loads one of the bundled samples by name ('pier' or 'boulevard').
async function loadSample(name) {
  const img = await loadImage(`samples/${name}.jpg`);
  addPhoto(img, `${name}.jpg (sample)`);
}

// --- Layout and grade pickers -------------------------------------------------

// Draws a miniature of a layout's panels into a small canvas.
function layoutThumb(layout) {
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 62;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#241845';
  ctx.fillRect(0, 0, 96, 62);
  ctx.fillStyle = '#ff8a3c';
  layout.panels.forEach((panel) => {
    ctx.beginPath();
    if (panel.poly) {
      panel.poly.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x * 96, y * 62);
        else ctx.lineTo(x * 96, y * 62);
      });
      ctx.closePath();
    } else {
      const r = panelRect(panel, 96, 62);
      ctx.rect(r.x, r.y, r.w, r.h);
    }
    ctx.fill();
  });
  ctx.fillStyle = '#ffe95e';
  ctx.fillRect(6, 48, 84, 8);
  return c;
}

function buildPickers() {
  const layoutPicker = document.getElementById('layout-picker');
  LAYOUTS.forEach((layout) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layout-card';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(layout.id === state.layoutId));
    btn.title = layout.blurb;
    const label = document.createElement('span');
    label.textContent = layout.name;
    btn.append(layoutThumb(layout), label);
    btn.addEventListener('click', () => {
      state.layoutId = layout.id;
      layoutPicker.querySelectorAll('.layout-card').forEach((el) => el.setAttribute('aria-checked', 'false'));
      btn.setAttribute('aria-checked', 'true');
      syncPanels();
      redraw();
    });
    layoutPicker.append(btn);
  });

  const gradePicker = document.getElementById('grade-picker');
  GRADES.forEach((grade) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grade-card';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(grade.id === state.gradeId));
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = `linear-gradient(90deg, ${grade.bg[0]}, ${grade.bg[1]}, ${grade.bg[2]})`;
    const name = document.createElement('strong');
    name.textContent = grade.name;
    const blurb = document.createElement('small');
    blurb.textContent = grade.blurb;
    btn.append(swatch, name, blurb);
    btn.addEventListener('click', () => {
      state.gradeId = grade.id;
      gradePicker.querySelectorAll('.grade-card').forEach((el) => el.setAttribute('aria-checked', 'false'));
      btn.setAttribute('aria-checked', 'true');
      redraw();
    });
    gradePicker.append(btn);
  });

  const sizeSelect = document.getElementById('export-size');
  EXPORT_SIZES.forEach((size) => {
    const opt = document.createElement('option');
    opt.value = size.id;
    opt.textContent = size.name;
    sizeSelect.append(opt);
  });
  sizeSelect.value = state.exportSize;
}

// --- Panel crop gestures ------------------------------------------------------

function canvasPoint(event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * canvas.width,
    y: ((event.clientY - box.top) / box.height) * canvas.height,
  };
}

let drag = null;
canvas.addEventListener('pointerdown', (event) => {
  const point = canvasPoint(event);
  const hit = panelAt(state, canvas.width, canvas.height, point.x, point.y);
  if (hit < 0) return;
  state.selected = hit;
  drag = { x: point.x, y: point.y, panel: state.panels[hit] };
  canvas.setPointerCapture(event.pointerId);
  redraw();
});

canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const point = canvasPoint(event);
  const panel = state.panels[state.selected];
  const photo = state.photos[panel.photo];
  if (!photo) return;
  const rect = panelRect({ x: 0, y: 0, w: 1, h: 1 }, canvas.width, canvas.height);
  void rect;
  const layoutPanel = (awaitLayoutPanel());
  const r = panelRect(layoutPanel, canvas.width, canvas.height);
  const coverScale = Math.max(r.w / photo.img.naturalWidth, r.h / photo.img.naturalHeight);
  const scale = coverScale * panel.zoom;
  const spareX = Math.max(1, photo.img.naturalWidth * scale - r.w);
  const spareY = Math.max(1, photo.img.naturalHeight * scale - r.h);
  panel.panX = clamp(drag.panel.panX + ((point.x - drag.x) / (spareX / 2)), -1, 1);
  panel.panY = clamp(drag.panel.panY + ((point.y - drag.y) / (spareY / 2)), -1, 1);
  redraw();
});

function awaitLayoutPanel() {
  // Synchronous helper (the name is historical): the selected layout panel.
  return LAYOUTS.find((l) => l.id === state.layoutId).panels[state.selected];
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const point = canvasPoint(event);
  const hit = panelAt(state, canvas.width, canvas.height, point.x, point.y);
  if (hit >= 0) state.selected = hit;
  const panel = state.panels[state.selected];
  if (!panel) return;
  panel.zoom = clamp(panel.zoom * (event.deltaY < 0 ? 1.08 : 0.93), 1, 3);
  redraw();
}, { passive: false });

// --- Controls -----------------------------------------------------------------

document.getElementById('photo-input').addEventListener('change', (event) => {
  addFiles(event.target.files);
  event.target.value = '';
});
document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier'));
document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard'));

const dropZone = document.getElementById('drop-zone');
['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  dropZone.classList.add('dragging');
}));
['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
}));
dropZone.addEventListener('drop', (event) => addFiles(event.dataTransfer.files));

document.getElementById('fill-all').addEventListener('click', () => {
  if (!state.photos.length) { say('Add a photo first.'); return; }
  state.panels.forEach((panel, i) => { panel.photo = i % state.photos.length; });
  redraw();
  say('Every panel filled.');
});

document.getElementById('shuffle').addEventListener('click', () => {
  state.panels.forEach((panel) => {
    panel.zoom = 1 + Math.random() * 1.1;
    panel.panX = Math.random() * 1.4 - 0.7;
    panel.panY = Math.random() * 1.4 - 0.7;
    if (state.photos.length) panel.photo = Math.floor(Math.random() * state.photos.length);
  });
  redraw();
  say('Crops shuffled. Click a panel to fine-tune it.');
});

zoomInput.addEventListener('input', () => {
  const panel = state.panels[state.selected];
  if (panel) { panel.zoom = Number(zoomInput.value); redraw(); }
});
panelPhotoSelect.addEventListener('change', () => {
  const panel = state.panels[state.selected];
  if (panel) { panel.photo = Number(panelPhotoSelect.value); redraw(); }
});

document.getElementById('halftone').addEventListener('change', (e) => { state.halftone = e.target.checked; redraw(); });
document.getElementById('grain').addEventListener('input', (e) => { state.grain = Number(e.target.value); redraw(); });
document.getElementById('vignette').addEventListener('input', (e) => { state.vignette = Number(e.target.value); redraw(); });
document.getElementById('palms').addEventListener('change', (e) => { state.showPalms = e.target.checked; redraw(); });
document.getElementById('sun').addEventListener('change', (e) => { state.showSun = e.target.checked; redraw(); });
document.getElementById('scanlines').addEventListener('change', (e) => { state.scanlines = e.target.checked; redraw(); });

document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
document.getElementById('tilt').addEventListener('input', (e) => { state.tilt = Number(e.target.value); redraw(); });
document.getElementById('arc').addEventListener('change', (e) => { state.arc = e.target.checked; redraw(); });
document.getElementById('export-size').addEventListener('change', (e) => { state.exportSize = e.target.value; redraw(); });

// Renders the cover offscreen at the exact export size and downloads it.
function exportPng() {
  const size = sizeById(state.exportSize);
  const out = document.createElement('canvas');
  out.width = size.w;
  out.height = size.h;
  renderCover(out, state, { highlight: -1 });
  out.toBlob((blob) => {
    if (!blob) { say('Export failed — try again.'); return; }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `solstice-cover-${size.w}x${size.h}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    say(`Saved solstice-cover-${size.w}x${size.h}.png`);
  }, 'image/png');
}
document.getElementById('export').addEventListener('click', exportPng);
document.getElementById('quick-export').addEventListener('click', exportPng);

// --- Boot ---------------------------------------------------------------------

buildPickers();
syncPanels();

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, loadSample, redraw).catch((err) => {
    say(String(err));
    window.__shotReady = true;
  });
} else {
  redraw();
  say('Add your photos, or try a sample to see the cover instantly.');
}
