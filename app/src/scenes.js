// Built-in poster scenes for SOLSTICE Cover Lab: eight little "3D game
// poster" pictures painted entirely with canvas paths at runtime. No image
// files, no people, no copied artwork — every car, boat, bird and building
// below is an original silhouette drawn from gradients and polygons, lit by
// the same pink-orange Vice City sunset so a fresh cover already looks like
// box art before the maker adds a single photo of their own.
//
// Each painter fills a 960×720 offscreen canvas; the renderer treats that
// canvas exactly like a loaded photo, so scenes and uploads mix freely.

import { drawPalm } from './decor.js';

export const SCENE_W = 960;
export const SCENE_H = 720;

// --- shared sky / sea helpers -------------------------------------------------

function skyGradient(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  stops.forEach(([at, colour]) => g.addColorStop(at, colour));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_W, SCENE_H);
}

function stripedSun(ctx, cx, cy, r, top, mid, low) {
  const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, low);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  let y = cy + r * 0.1;
  let band = r * 0.035;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, band);
    y += band + r * 0.085;
    band *= 1.5;
  }
  ctx.restore();
}

function sunGlow(ctx, cx, cy, r, colour) {
  const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.6);
  g.addColorStop(0, colour);
  g.addColorStop(1, 'rgba(255, 120, 60, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - r * 2.6, cy - r * 2.6, r * 5.2, r * 5.2);
}

function cloudBand(ctx, y, h, colour, seed) {
  ctx.fillStyle = colour;
  let x = -40;
  let i = 0;
  while (x < SCENE_W + 40) {
    const w = 90 + ((seed * (i + 3) * 37) % 130);
    const lift = ((seed * (i + 5) * 13) % 17) - 8;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + lift, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    x += w * 0.72;
    i += 1;
  }
}

function seaWithReflection(ctx, horizon, deep, glint, sunX) {
  const g = ctx.createLinearGradient(0, horizon, 0, SCENE_H);
  g.addColorStop(0, glint);
  g.addColorStop(0.25, deep);
  g.addColorStop(1, '#12082e');
  ctx.fillStyle = g;
  ctx.fillRect(0, horizon, SCENE_W, SCENE_H - horizon);
  // Broken sun path: short bright dashes widening toward the viewer.
  ctx.fillStyle = 'rgba(255, 210, 110, 0.55)';
  for (let row = 0; row < 16; row++) {
    const t = row / 16;
    const y = horizon + 6 + t * (SCENE_H - horizon - 14);
    const spread = 26 + t * 150;
    const wobble = Math.sin(row * 2.7) * 14;
    ctx.fillRect(sunX - spread / 2 + wobble, y, spread, 3 + t * 4);
  }
  // Gentle wave lines.
  ctx.strokeStyle = 'rgba(160, 240, 255, 0.16)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 7; row++) {
    const y = horizon + 18 + row * 26;
    ctx.beginPath();
    for (let x = 0; x <= SCENE_W; x += 32) {
      const yy = y + Math.sin(x / 60 + row * 1.7) * 3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}

function birds(ctx, points, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  points.forEach(([x, y, s]) => {
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.55, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.55, x + s, y);
    ctx.stroke();
  });
}

// --- the eight scenes ----------------------------------------------------------

function paintCar(ctx) {
  skyGradient(ctx, [[0, '#3b1054'], [0.45, '#a4136b'], [0.72, '#ff5e3a'], [1, '#ffb347']]);
  sunGlow(ctx, 480, 330, 150, 'rgba(255, 170, 60, 0.5)');
  stripedSun(ctx, 480, 330, 150, '#ffe95e', '#ff8a3c', '#ff2e88');
  cloudBand(ctx, 120, 34, 'rgba(90, 20, 90, 0.55)', 7);
  cloudBand(ctx, 205, 26, 'rgba(255, 110, 90, 0.35)', 11);
  // Wet boulevard.
  const road = ctx.createLinearGradient(0, 430, 0, SCENE_H);
  road.addColorStop(0, '#5b1a5e');
  road.addColorStop(0.3, '#2a0a3e');
  road.addColorStop(1, '#0d0618');
  ctx.fillStyle = road;
  ctx.fillRect(0, 430, SCENE_W, SCENE_H - 430);
  ctx.fillStyle = 'rgba(255, 233, 94, 0.8)';
  for (let i = 0; i < 5; i++) ctx.fillRect(120 + i * 170, 640, 90, 10);
  drawPalm(ctx, 70, 445, 230, 0.45, '#160a2e');
  drawPalm(ctx, 905, 450, 260, -0.45, '#160a2e');
  // Neon underglow pool.
  const glow = ctx.createRadialGradient(480, 585, 40, 480, 585, 330);
  glow.addColorStop(0, 'rgba(34, 211, 238, 0.55)');
  glow.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(150, 480, 660, 210);
  // Low wedge supercar, side profile, original shape.
  ctx.fillStyle = '#ffd21a';
  ctx.beginPath();
  ctx.moveTo(150, 560);
  ctx.lineTo(230, 520);
  ctx.lineTo(360, 500);
  ctx.lineTo(470, 445);
  ctx.lineTo(620, 440);
  ctx.lineTo(720, 495);
  ctx.lineTo(815, 515);
  ctx.lineTo(825, 560);
  ctx.lineTo(760, 572);
  ctx.arc(700, 572, 52, 0, Math.PI, true);
  ctx.lineTo(380, 572);
  ctx.arc(315, 572, 52, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  // Glasshouse + side intake shading.
  ctx.fillStyle = '#1b2a4a';
  ctx.beginPath();
  ctx.moveTo(485, 452);
  ctx.lineTo(600, 450);
  ctx.lineTo(680, 492);
  ctx.lineTo(540, 495);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(500, 456, 60, 8);
  ctx.fillStyle = '#e8a90c';
  ctx.beginPath();
  ctx.moveTo(430, 515);
  ctx.lineTo(560, 510);
  ctx.lineTo(540, 545);
  ctx.lineTo(450, 548);
  ctx.closePath();
  ctx.fill();
  // Wheels.
  [315, 700].forEach((cx) => {
    ctx.fillStyle = '#0b0b14';
    ctx.beginPath();
    ctx.arc(cx, 572, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cfd6e4';
    ctx.beginPath();
    ctx.arc(cx, 572, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#39415a';
    ctx.beginPath();
    ctx.arc(cx, 572, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  // Headlight + rear light streaks.
  ctx.fillStyle = '#bff6ff';
  ctx.fillRect(795, 522, 26, 9);
  ctx.fillStyle = '#ff3355';
  ctx.fillRect(152, 524, 22, 8);
  birds(ctx, [[200, 90, 16], [760, 70, 13]], 'rgba(22, 10, 46, 0.8)');
}

function paintBoat(ctx) {
  skyGradient(ctx, [[0, '#2a0a3e'], [0.5, '#7c1d6e'], [0.78, '#ff6a3d'], [1, '#ffc46b']]);
  sunGlow(ctx, 300, 360, 120, 'rgba(255, 170, 60, 0.45)');
  stripedSun(ctx, 300, 360, 120, '#ffe95e', '#ff8a3c', '#ff2e88');
  cloudBand(ctx, 110, 30, 'rgba(80, 16, 80, 0.5)', 5);
  seaWithReflection(ctx, 400, '#0e4a6e', '#ff9a5c', 300);
  // Wake: widening white V behind the hull.
  ctx.fillStyle = 'rgba(240, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.moveTo(330, 545);
  ctx.lineTo(40, 660);
  ctx.lineTo(90, 690);
  ctx.lineTo(360, 575);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(220, 250, 255, 0.5)';
  ctx.beginPath();
  ctx.moveTo(350, 560);
  ctx.lineTo(120, 700);
  ctx.lineTo(210, 712);
  ctx.lineTo(400, 585);
  ctx.closePath();
  ctx.fill();
  // Speedboat hull, original wedge with a stepped deck.
  ctx.fillStyle = '#f4f7ff';
  ctx.beginPath();
  ctx.moveTo(300, 520);
  ctx.lineTo(560, 500);
  ctx.lineTo(700, 470);
  ctx.lineTo(860, 495);
  ctx.lineTo(800, 545);
  ctx.lineTo(380, 560);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ff2e88';
  ctx.beginPath();
  ctx.moveTo(300, 520);
  ctx.lineTo(860, 495);
  ctx.lineTo(835, 522);
  ctx.lineTo(340, 545);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#16264a';
  ctx.beginPath();
  ctx.moveTo(585, 498);
  ctx.lineTo(690, 472);
  ctx.lineTo(760, 492);
  ctx.lineTo(640, 505);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.ellipse(330, 555, 60, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  birds(ctx, [[700, 120, 15], [790, 160, 11]], 'rgba(22, 10, 46, 0.8)');
}

function paintSkyline(ctx) {
  skyGradient(ctx, [[0, '#1c0b38'], [0.45, '#6d1b7a'], [0.72, '#e8447c'], [1, '#ff9a3d']]);
  sunGlow(ctx, 480, 400, 170, 'rgba(255, 160, 60, 0.5)');
  stripedSun(ctx, 480, 400, 170, '#ffe95e', '#ff8a3c', '#ff2e88');
  // Far towers, then near towers, both as flat original silhouettes.
  const far = [[0, 300, 90], [95, 250, 70], [170, 320, 110], [640, 280, 90], [740, 240, 80], [830, 310, 130]];
  ctx.fillStyle = 'rgba(58, 20, 84, 0.85)';
  far.forEach(([x, top, w]) => ctx.fillRect(x, top, w, 430 - top));
  const near = [[30, 350, 120], [160, 300, 90], [700, 320, 110], [820, 360, 110]];
  ctx.fillStyle = '#160a2e';
  near.forEach(([x, top, w]) => ctx.fillRect(x, top, w, 430 - top));
  ctx.fillRect(196, 268, 18, 40); // antenna
  // Lit windows.
  ctx.fillStyle = 'rgba(255, 233, 120, 0.9)';
  near.forEach(([x, top, w], bi) => {
    for (let wy = top + 18; wy < 415; wy += 26) {
      for (let wx = x + 12; wx < x + w - 12; wx += 22) {
        if ((wx * 7 + wy * 13 + bi * 31) % 5 < 2) ctx.fillRect(wx, wy, 9, 12);
      }
    }
  });
  seaWithReflection(ctx, 430, '#123a6e', '#ff8a5c', 480);
  drawPalm(ctx, 40, 470, 190, 0.5, '#0d0618');
  drawPalm(ctx, 930, 475, 210, -0.5, '#0d0618');
}

function paintBeach(ctx) {
  skyGradient(ctx, [[0, '#7c3aed'], [0.4, '#e8447c'], [0.7, '#ff8a3c'], [1, '#ffe95e']]);
  sunGlow(ctx, 480, 380, 190, 'rgba(255, 190, 70, 0.55)');
  stripedSun(ctx, 480, 380, 190, '#fff3a0', '#ffb347', '#ff5e7a');
  cloudBand(ctx, 130, 36, 'rgba(255, 200, 150, 0.4)', 9);
  seaWithReflection(ctx, 420, '#0e6e8e', '#ffc46b', 480);
  // Sand spit sweeping in from the lower left.
  ctx.fillStyle = '#f7c873';
  ctx.beginPath();
  ctx.moveTo(0, 720);
  ctx.lineTo(0, 600);
  ctx.quadraticCurveTo(300, 540, 520, 640);
  ctx.quadraticCurveTo(640, 695, 700, 720);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.ellipse(250, 618, 190, 16, -0.12, 0, Math.PI * 2);
  ctx.fill();
  drawPalm(ctx, 120, 640, 300, 0.55, '#160a2e');
  drawPalm(ctx, 850, 660, 250, -0.5, '#160a2e');
  // Beach umbrella, plain stripes.
  ctx.strokeStyle = '#160a2e';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(330, 660);
  ctx.lineTo(360, 575);
  ctx.stroke();
  ctx.fillStyle = '#ff2e88';
  ctx.beginPath();
  ctx.moveTo(270, 580);
  ctx.quadraticCurveTo(360, 520, 450, 580);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe95e';
  ctx.beginPath();
  ctx.moveTo(315, 562);
  ctx.quadraticCurveTo(360, 535, 405, 562);
  ctx.lineTo(385, 578);
  ctx.lineTo(335, 578);
  ctx.closePath();
  ctx.fill();
  birds(ctx, [[180, 100, 15], [250, 140, 11], [720, 90, 13]], 'rgba(22, 10, 46, 0.75)');
}

function paintGator(ctx) {
  skyGradient(ctx, [[0, '#241040'], [0.5, '#8a2a72'], [0.8, '#e85d4d'], [1, '#ffb347']]);
  sunGlow(ctx, 720, 300, 110, 'rgba(255, 170, 60, 0.4)');
  stripedSun(ctx, 720, 300, 110, '#ffe95e', '#ff8a3c', '#ff2e88');
  // Mangrove silhouettes at the waterline.
  ctx.fillStyle = '#160a2e';
  ctx.fillRect(0, 330, 300, 90);
  ctx.fillRect(660, 340, 300, 80);
  drawPalm(ctx, 90, 420, 200, 0.4, '#0d0618');
  drawPalm(ctx, 880, 425, 180, -0.4, '#0d0618');
  seaWithReflection(ctx, 400, '#0c3a4e', '#ff9a5c', 720);
  // Alligator: ridged back, snout and two eyes breaking the surface.
  ctx.fillStyle = '#1e4d2e';
  ctx.beginPath();
  ctx.ellipse(430, 585, 330, 46, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#2a6b3e';
  for (let i = 0; i < 9; i++) {
    const x = 160 + i * 58;
    ctx.beginPath();
    ctx.moveTo(x, 560);
    ctx.lineTo(x + 16, 528);
    ctx.lineTo(x + 32, 560);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#1e4d2e';
  ctx.beginPath();
  ctx.ellipse(790, 600, 130, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye bumps with amber eyes.
  [600, 660].forEach((x) => {
    ctx.fillStyle = '#2a6b3e';
    ctx.beginPath();
    ctx.arc(x, 552, 26, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffb020';
    ctx.beginPath();
    ctx.arc(x, 548, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0d0618';
    ctx.fillRect(x - 2.5, 538, 5, 20);
  });
  // Ripples around the body.
  ctx.strokeStyle = 'rgba(200, 245, 255, 0.5)';
  ctx.lineWidth = 3;
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.ellipse(480, 610 + i * 16, 360 + i * 55, 26 + i * 8, 0, 0.15, Math.PI - 0.15);
    ctx.stroke();
  });
}

function paintFlamingo(ctx) {
  skyGradient(ctx, [[0, '#4a1460'], [0.45, '#c22a7a'], [0.75, '#ff7a4d'], [1, '#ffd166']]);
  sunGlow(ctx, 480, 340, 150, 'rgba(255, 180, 80, 0.5)');
  stripedSun(ctx, 480, 340, 150, '#ffe95e', '#ff8a3c', '#ff2e88');
  seaWithReflection(ctx, 430, '#0e5e7e', '#ffc46b', 480);
  // Shallow sandbar.
  ctx.fillStyle = '#f2b56b';
  ctx.beginPath();
  ctx.ellipse(480, 640, 420, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  // Flamingo: S-neck bird standing on one leg, drawn from smooth curves.
  ctx.strokeStyle = '#ff5e8a';
  ctx.lineCap = 'round';
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(470, 600);
  ctx.lineTo(470, 690);
  ctx.stroke();
  ctx.fillStyle = '#ff5e8a';
  ctx.beginPath();
  ctx.ellipse(470, 565, 105, 52, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8437a';
  ctx.beginPath();
  ctx.ellipse(455, 560, 78, 36, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ff5e8a';
  ctx.lineWidth = 26;
  ctx.beginPath();
  ctx.moveTo(555, 545);
  ctx.quadraticCurveTo(630, 500, 615, 420);
  ctx.quadraticCurveTo(608, 375, 650, 360);
  ctx.stroke();
  ctx.fillStyle = '#ff5e8a';
  ctx.beginPath();
  ctx.ellipse(660, 360, 30, 19, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd9e2';
  ctx.beginPath();
  ctx.moveTo(684, 352);
  ctx.lineTo(730, 378);
  ctx.lineTo(682, 382);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#160a2e';
  ctx.beginPath();
  ctx.moveTo(712, 366);
  ctx.lineTo(730, 378);
  ctx.lineTo(710, 382);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(656, 354, 4.5, 0, Math.PI * 2);
  ctx.fill();
  // Reflection smear.
  ctx.fillStyle = 'rgba(255, 94, 138, 0.35)';
  ctx.beginPath();
  ctx.ellipse(480, 700, 130, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  drawPalm(ctx, 60, 500, 210, 0.5, '#160a2e');
  drawPalm(ctx, 915, 505, 190, -0.5, '#160a2e');
}

function paintHeli(ctx) {
  skyGradient(ctx, [[0, '#160a38'], [0.5, '#5b1a7a'], [0.78, '#d63d7e'], [1, '#ff9a3d']]);
  sunGlow(ctx, 250, 430, 130, 'rgba(255, 170, 60, 0.45)');
  stripedSun(ctx, 250, 430, 130, '#ffe95e', '#ff8a3c', '#ff2e88');
  cloudBand(ctx, 480, 40, 'rgba(255, 150, 110, 0.3)', 13);
  cloudBand(ctx, 560, 52, 'rgba(120, 40, 110, 0.45)', 17);
  // Searchlight cone down to the sea.
  ctx.fillStyle = 'rgba(255, 246, 180, 0.22)';
  ctx.beginPath();
  ctx.moveTo(540, 320);
  ctx.lineTo(430, 720);
  ctx.lineTo(760, 720);
  ctx.closePath();
  ctx.fill();
  seaWithReflection(ctx, 600, '#123a6e', '#ff8a5c', 250);
  // Helicopter silhouette, original rounded body + tail boom.
  ctx.fillStyle = '#120826';
  ctx.beginPath();
  ctx.ellipse(520, 300, 120, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(620, 285);
  ctx.lineTo(830, 250);
  ctx.lineTo(838, 272);
  ctx.lineTo(630, 315);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(824, 205, 14, 95);
  ctx.fillRect(455, 360, 130, 10);
  ctx.fillRect(470, 335, 12, 30);
  ctx.fillRect(565, 335, 12, 30);
  // Rotor blades.
  ctx.fillRect(505, 222, 30, 18);
  ctx.fillRect(300, 210, 440, 9);
  ctx.fillRect(828, 238, 9, 62);
  // Cockpit glass catching the sunset.
  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.ellipse(452, 295, 34, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  // Beacon.
  ctx.fillStyle = '#ff3355';
  ctx.beginPath();
  ctx.arc(520, 240, 7, 0, Math.PI * 2);
  ctx.fill();
  birds(ctx, [[150, 120, 14], [820, 100, 12]], 'rgba(13, 6, 24, 0.85)');
}

function paintSunset(ctx) {
  skyGradient(ctx, [[0, '#2a0a4e'], [0.38, '#8a1e7a'], [0.66, '#ff5e5e'], [1, '#ffcf5e']]);
  sunGlow(ctx, 480, 420, 230, 'rgba(255, 190, 70, 0.6)');
  stripedSun(ctx, 480, 420, 230, '#fff3a0', '#ffb347', '#ff2e88');
  cloudBand(ctx, 150, 40, 'rgba(255, 170, 130, 0.35)', 21);
  cloudBand(ctx, 250, 30, 'rgba(110, 30, 100, 0.5)', 25);
  seaWithReflection(ctx, 470, '#0e4a7e', '#ffc46b', 480);
  // Distant sailboat silhouette on the sun path.
  ctx.fillStyle = '#160a2e';
  ctx.beginPath();
  ctx.moveTo(660, 520);
  ctx.lineTo(740, 520);
  ctx.lineTo(722, 540);
  ctx.lineTo(676, 540);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(700, 518);
  ctx.lineTo(700, 452);
  ctx.lineTo(738, 518);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(694, 518);
  ctx.lineTo(694, 466);
  ctx.lineTo(664, 518);
  ctx.closePath();
  ctx.fill();
  drawPalm(ctx, 45, 520, 240, 0.5, '#0d0618');
  drawPalm(ctx, 925, 525, 260, -0.5, '#0d0618');
  birds(ctx, [[300, 110, 16], [380, 150, 12], [640, 95, 13]], 'rgba(22, 10, 46, 0.8)');
}

const PAINTERS = {
  car: paintCar,
  boat: paintBoat,
  skyline: paintSkyline,
  beach: paintBeach,
  gator: paintGator,
  flamingo: paintFlamingo,
  heli: paintHeli,
  sunset: paintSunset,
};

export const SCENES = [
  { id: 'car', name: 'Supercar boulevard (scene)' },
  { id: 'boat', name: 'Speedboat run (scene)' },
  { id: 'skyline', name: 'Skyline over water (scene)' },
  { id: 'beach', name: 'Palm beach (scene)' },
  { id: 'gator', name: 'Gator eyes (scene)' },
  { id: 'flamingo', name: 'Flamingo shallows (scene)' },
  { id: 'heli', name: 'Heli at dusk (scene)' },
  { id: 'sunset', name: 'Big sun sail (scene)' },
];

// Paints one scene onto a fresh canvas and returns it. The canvas carries
// width/height like an image, so the renderer can crop it per panel.
export function paintScene(id) {
  const canvas = document.createElement('canvas');
  canvas.width = SCENE_W;
  canvas.height = SCENE_H;
  const painter = PAINTERS[id] ?? paintSunset;
  painter(canvas.getContext('2d'));
  return canvas;
}

// Paints every scene once, in SCENES order, as { img, name } photo entries.
export function paintAllScenes() {
  return SCENES.map((scene) => ({ img: paintScene(scene.id), name: scene.name, kind: 'scene' }));
}
