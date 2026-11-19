// Shared data for SOLSTICE Cover Lab: the panel layouts, the colour grades,
// the export sizes, and the editor state every module reads and writes.
// Everything here is plain data — the drawing lives in render.js.

// Panel layouts. Each panel is { x, y, w, h } in fractions of the cover, with
// an optional `poly` (array of [x, y] fraction pairs) for clipped shapes like
// the diagonal bands. `gap` is the gutter between panels, as a fraction of
// the cover's short side. The last fraction band is left for the lettering.
export const LAYOUTS = [
  {
    id: 'hero5',
    name: 'Hero 5',
    blurb: 'Big centre panel, four corners',
    panels: [
      { x: 0.295, y: 0.035, w: 0.41, h: 0.665 },
      { x: 0.03, y: 0.035, w: 0.24, h: 0.32 },
      { x: 0.73, y: 0.035, w: 0.24, h: 0.32 },
      { x: 0.03, y: 0.38, w: 0.24, h: 0.32 },
      { x: 0.73, y: 0.38, w: 0.24, h: 0.32 },
    ],
  },
  {
    id: 'triptych',
    name: 'Triptych',
    blurb: 'Three tall columns',
    panels: [
      { x: 0.03, y: 0.035, w: 0.305, h: 0.665 },
      { x: 0.348, y: 0.035, w: 0.305, h: 0.665 },
      { x: 0.665, y: 0.035, w: 0.305, h: 0.665 },
    ],
  },
  {
    id: 'grid6',
    name: 'Grid 6',
    blurb: 'Six panels, 3 across by 2 down',
    panels: [
      { x: 0.03, y: 0.035, w: 0.305, h: 0.32 },
      { x: 0.348, y: 0.035, w: 0.305, h: 0.32 },
      { x: 0.665, y: 0.035, w: 0.305, h: 0.32 },
      { x: 0.03, y: 0.38, w: 0.305, h: 0.32 },
      { x: 0.348, y: 0.38, w: 0.305, h: 0.32 },
      { x: 0.665, y: 0.38, w: 0.305, h: 0.32 },
    ],
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    blurb: 'Three slanted bands',
    panels: [
      { x: 0.02, y: 0.035, w: 0.38, h: 0.665, poly: [[0.02, 0.035], [0.34, 0.035], [0.22, 0.70], [0.02, 0.70]] },
      { x: 0.31, y: 0.035, w: 0.38, h: 0.665, poly: [[0.36, 0.035], [0.68, 0.035], [0.56, 0.70], [0.24, 0.70]] },
      { x: 0.60, y: 0.035, w: 0.38, h: 0.665, poly: [[0.70, 0.035], [0.98, 0.035], [0.98, 0.70], [0.58, 0.70]] },
    ],
  },
  {
    id: 'quad',
    name: 'Quad',
    blurb: 'Four squares, 2 by 2',
    panels: [
      { x: 0.03, y: 0.035, w: 0.465, h: 0.32 },
      { x: 0.505, y: 0.035, w: 0.465, h: 0.32 },
      { x: 0.03, y: 0.38, w: 0.465, h: 0.32 },
      { x: 0.505, y: 0.38, w: 0.465, h: 0.32 },
    ],
  },
];

// Colour grades. `filter` is a CSS filter string applied while drawing each
// photo; `wash` is a list of [offset, colour] stops for a vertical gradient
// blended over the photo; `blend` is the composite mode for that wash.
export const GRADES = [
  {
    id: 'vice',
    name: 'Vice Sunset',
    blurb: 'Magenta, orange, teal',
    filter: 'saturate(1.45) contrast(1.12) brightness(1.02) hue-rotate(-12deg)',
    wash: [[0, 'rgba(255, 46, 136, 0.28)'], [0.55, 'rgba(255, 122, 26, 0.18)'], [1, 'rgba(0, 199, 199, 0.26)']],
    blend: 'overlay',
    bg: ['#2a0a3e', '#ff2e88', '#ffb347'],
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    blurb: 'Purple, cyan, pink',
    filter: 'saturate(1.65) contrast(1.18) brightness(0.98) hue-rotate(24deg)',
    wash: [[0, 'rgba(124, 58, 237, 0.34)'], [0.5, 'rgba(34, 211, 238, 0.20)'], [1, 'rgba(244, 114, 182, 0.30)']],
    blend: 'overlay',
    bg: ['#0b0620', '#7c3aed', '#22d3ee'],
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    blurb: 'Warm amber glow',
    filter: 'sepia(0.38) saturate(1.35) contrast(1.06) brightness(1.06)',
    wash: [[0, 'rgba(255, 190, 60, 0.22)'], [0.6, 'rgba(255, 130, 40, 0.16)'], [1, 'rgba(140, 60, 10, 0.22)']],
    blend: 'soft-light',
    bg: ['#2a1404', '#ffbe3c', '#ff7a1a'],
  },
  {
    id: 'ultra',
    name: 'Ultraviolet',
    blurb: 'Violet into deep blue',
    filter: 'saturate(1.55) contrast(1.14) hue-rotate(46deg) brightness(1.0)',
    wash: [[0, 'rgba(167, 139, 250, 0.32)'], [0.55, 'rgba(59, 130, 246, 0.22)'], [1, 'rgba(30, 27, 75, 0.30)']],
    blend: 'overlay',
    bg: ['#0a0620', '#a78bfa', '#3b82f6'],
  },
];

// Export sizes offered in the UI. The preview uses the chosen size's aspect.
export const EXPORT_SIZES = [
  { id: 'square', name: 'Square 1080×1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait 1080×1350', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide 1920×1080', w: 1920, h: 1080 },
  { id: 'poster', name: 'Poster 1200×1600', w: 1200, h: 1600 },
];

export const MAX_PHOTOS = 5;

// One panel's crop: which photo fills it, how far zoomed in (1 = cover fit),
// and the pan offset as fractions of the spare room (-1..1, 0 = centred).
export function freshPanel(photoIndex) {
  return { photo: photoIndex, zoom: 1, panX: 0, panY: 0 };
}

// The whole editor state. `photos` holds loaded images ({ img, name });
// `panels` is rebuilt whenever the layout changes.
export const state = {
  photos: [],
  layoutId: 'hero5',
  gradeId: 'vice',
  panels: [],
  selected: 0,
  title: 'SOLSTICE',
  subtitle: 'COASTLINE RUN',
  tilt: -3,
  arc: false,
  halftone: false,
  grain: 0.35,
  vignette: 0.55,
  showPalms: true,
  showSun: true,
  scanlines: false,
  exportSize: 'portrait',
};

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

export function sizeById(id) {
  return EXPORT_SIZES.find((s) => s.id === id) ?? EXPORT_SIZES[1];
}

// Rebuilds the panel list for the current layout, keeping the crops that
// still fit and cycling through the loaded photos for the new panels.
export function syncPanels() {
  const count = layoutById(state.layoutId).panels.length;
  const old = state.panels;
  state.panels = [];
  for (let i = 0; i < count; i++) {
    const kept = old[i];
    if (kept && state.photos[kept.photo]) {
      state.panels.push(kept);
    } else {
      state.panels.push(freshPanel(state.photos.length ? i % state.photos.length : 0));
    }
  }
  if (state.selected >= count) state.selected = 0;
}
