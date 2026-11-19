// Fixed scenes for screenshots. `?shot=cover` shows only the exported cover,
// full-bleed; `?shot=editor` shows the editor with a sample photo loaded.
// Query params: photo (pier|boulevard), title, subtitle, layout, grade, size,
// halftone (1), grain, vignette. window.__shotReady is set once painted.

import { state, syncPanels } from './state.js';

// Applies the shot's query params to the shared state, loads the sample photo
// through `loadSample(name)`, repaints through `redraw()`, then flags ready.
export async function runShot(shot, query, loadSample, redraw) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');

  const photo = query.get('photo') ?? 'pier';
  await loadSample(photo);

  const set = (key, apply) => {
    const value = query.get(key);
    if (value !== null) apply(value);
  };
  set('title', (v) => { state.title = v; });
  set('subtitle', (v) => { state.subtitle = v; });
  set('layout', (v) => { state.layoutId = v; });
  set('grade', (v) => { state.gradeId = v; });
  set('size', (v) => { state.exportSize = v; });
  set('halftone', (v) => { state.halftone = v === '1'; });
  set('grain', (v) => { state.grain = Number(v); });
  set('vignette', (v) => { state.vignette = Number(v); });
  set('tilt', (v) => { state.tilt = Number(v); });
  set('arc', (v) => { state.arc = v === '1'; });
  set('palms', (v) => { state.showPalms = v !== '0'; });
  set('sun', (v) => { state.showSun = v !== '0'; });

  // Spread the one sample photo across the panels with varied crops, so the
  // screenshot shows the multi-panel look a single photo can make.
  syncPanels();
  const crops = [
    { zoom: 1.05, panX: 0, panY: -0.1 },
    { zoom: 1.7, panX: -0.6, panY: 0.2 },
    { zoom: 1.7, panX: 0.6, panY: -0.2 },
    { zoom: 1.5, panX: 0.4, panY: 0.5 },
    { zoom: 1.9, panX: -0.4, panY: -0.5 },
    { zoom: 1.4, panX: 0.2, panY: 0.6 },
  ];
  state.panels.forEach((panel, i) => {
    Object.assign(panel, crops[i % crops.length]);
  });
  state.selected = 0;

  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
