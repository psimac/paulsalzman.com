// Builds the site portrait from the outdoor photo: a 4:5 crop with
// softer color, a gentler tone curve, and film grain. Run with `npm run photo`.
import sharp from 'sharp';

const SRC = 'src/assets/paul-outdoors.jpg';
const CROP = { left: 330, top: 173, width: 1500, height: 1875 };
const W = 1200;
const H = 1500;

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

const grain = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  const v = Math.max(0, Math.min(255, 128 + gauss() * 26));
  grain[i * 3] = grain[i * 3 + 1] = grain[i * 3 + 2] = v;
}
const grainPng = await sharp(grain, { raw: { width: W, height: H, channels: 3 } })
  .blur(0.7)
  .png()
  .toBuffer();

const base = await sharp(SRC)
  .extract(CROP)
  .resize(W, H, { kernel: 'lanczos3' })
  .modulate({ saturation: 0.72 })
  .linear(0.92, 12) // lift the blacks and ease the contrast
  .composite([{ input: grainPng, blend: 'soft-light' }])
  .png()
  .toBuffer();

await sharp(base).webp({ quality: 80 }).toFile('public/images/paul-salzman-1200.webp');
await sharp(base).resize(600).webp({ quality: 80 }).toFile('public/images/paul-salzman-600.webp');
console.log('Portrait written to public/images/');
