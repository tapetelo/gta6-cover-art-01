// SOLSTICE Cover Lab — hand-in program for gta6-cover-art-01 (Node 22,
// standard library only). The cover maker itself lives in app/.
//
// The entry is the app/ folder beside this file: plain static files a desktop
// browser runs offline (index.html plus its ES modules, no library and no
// network request), plus the screenshots in screenshots/. This program copies
// both into the output directory and writes dossier.json there with the
// vendored make.fun library, which is the summary the judge reads. The first
// screenshot by name is the cover, so the names in screenshots/ matter.
//
// Try the app locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's caps: text_max_bytes shapes the dossier text; the rest refuse
// an entry the scorer would refuse (over 4 screenshots or one over 256 KiB,
// over 993 entries in app/ or 48 MiB of app files, or a path over 1000 bytes).
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
