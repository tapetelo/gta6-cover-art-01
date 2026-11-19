// Screenshot scenes, take two: every shot now runs on the built-in poster
// scenes (painted in code — car, boat, skyline, gator and friends), never on
// the real-people sample photos. `?shot=cover` shows the exported artwork
// alone; `?shot=editor` keeps the studio chrome around it. Query params:
// layout, grade, size, title, subtitle, quote, seal (0/1), stars, tilt, arc,
// halftone, grain, vignette, palms, sun. window.__shotReady flags the paint.

import { state, syncPanels } from './state.js';

// Scene order per panel for the poster layouts, so each shot tells the same
// little story: skyline and supercar up top, boat and flamingo mid-frame,
// beach, gator and big sun along the bottom.
const COLLAGE_ORDER = [2, 0, 6, 1, 3, 5, 3, 4, 7];
const SLASH_ORDER = [0, 7, 1, 2];

export async function runShot(shot, query, loadScenes, loadSample, redraw) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');

  loadScenes();

  const set = (key, apply) => {
    const value = query.get(key);
    if (value !== null) apply(value);
  };
  set('title', (v) => { state.title = v; });
  set('subtitle', (v) => { state.subtitle = v; });
  set('quote', (v) => { state.quote = v; });
  set('layout', (v) => { state.layoutId = v; });
  set('grade', (v) => { state.gradeId = v; });
  set('size', (v) => { state.exportSize = v; });
  set('seal', (v) => { state.seal = v !== '0'; });
  set('stars', (v) => { state.stars = Number(v); });
  set('halftone', (v) => { state.halftone = v === '1'; });
  set('grain', (v) => { state.grain = Number(v); });
  set('vignette', (v) => { state.vignette = Number(v); });
  set('tilt', (v) => { state.tilt = Number(v); });
  set('arc', (v) => { state.arc = v === '1'; });
  set('palms', (v) => { state.showPalms = v !== '0'; });
  set('sun', (v) => { state.showSun = v !== '0'; });

  syncPanels();
  const order = state.layoutId === 'slash' ? SLASH_ORDER : COLLAGE_ORDER;
  state.panels.forEach((panel, i) => {
    panel.photo = Math.min(order[i] ?? i, state.photos.length - 1);
    panel.zoom = 1;
    panel.panX = 0;
    panel.panY = 0;
  });
  if (state.layoutId === 'keyart') {
    state.panels[0].photo = 7; // big-sun sail scene, full bleed
  }
  state.selected = 0;

  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
