// Builds the site portrait from the original camera headshot:
// black and white, gentle contrast, and film grain. Run with `npm run photo`.
import sharp from 'sharp';

const SRC = 'src/assets/paul-headshot.jpg';
const SIZE = 800;

// Deterministic noise so the output is identical on every run.
let seed = 1977;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const gauss = () => {
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
};

const grain = Buffer.alloc(SIZE * SIZE * 3);
for (let i = 0; i < SIZE * SIZE; i++) {
  const v = Math.max(0, Math.min(255, 128 + gauss() * 30));
  grain[i * 3] = grain[i * 3 + 1] = grain[i * 3 + 2] = v;
}
const grainPng = await sharp(grain, { raw: { width: SIZE, height: SIZE, channels: 3 } })
  .blur(0.6)
  .png()
  .toBuffer();

const base = await sharp(SRC)
  .resize(SIZE, SIZE, { kernel: 'lanczos3' })
  .grayscale()
  .linear(1.08, -8)
  .toColourspace('srgb')
  .composite([{ input: grainPng, blend: 'soft-light' }])
  .png()
  .toBuffer();

await sharp(base).webp({ quality: 82 }).toFile('public/images/paul-salzman-800.webp');
await sharp(base).resize(400).webp({ quality: 82 }).toFile('public/images/paul-salzman-400.webp');
console.log('Portrait written to public/images/');
