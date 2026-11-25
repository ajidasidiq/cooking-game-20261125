// Ember Kitchen Rush — entrypoint. Hands the game in: copies game/ and
// screenshots/ next to this file into the output directory and writes the
// dossier.json the judge reads, using the vendored make.fun library.
// Run: MAKEFUN_OUTPUT_DIR=out node main.ts   (the grader uses /output)

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast, before copying anything, when the hand-in is incomplete:
// the gate refuses an entry with no playable game or no screenshots.
const entryHtml = join(repoRoot, 'game', 'index.html');
if (!existsSync(entryHtml)) throw new Error(`missing playable game: ${entryHtml}`);
const shotDir = join(repoRoot, 'screenshots');
const shots = existsSync(shotDir)
  ? readdirSync(shotDir).filter((f) => /\.(png|jpe?g)$/i.test(f))
  : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(shotDir, join(outputDir, 'screenshots'), { recursive: true });

writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`Ember Kitchen Rush handed in to ${outputDir} (${shots.length} screenshots: ${shots.join(', ')})`);
