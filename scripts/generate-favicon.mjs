import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'fs';

const src = 'src/assets/images/logo-hero.png';
const outDir = 'src/assets';

// logo-hero is 335x289 (not square) — pad to square on white background
async function makeSquarePng(size) {
  return sharp(src)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// Generate PNG sizes
const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-512x512.png': 512,
};

for (const [name, size] of Object.entries(sizes)) {
  const buf = await makeSquarePng(size);
  writeFileSync(`${outDir}/${name}`, buf);
  console.log(`${name}: ${buf.length} bytes`);
}

// Generate multi-size ICO from 16/32/48 PNGs
const icoPngs = await Promise.all([16, 32, 48].map(makeSquarePng));
const icoBuffer = await pngToIco(icoPngs);
writeFileSync(`${outDir}/favicon.ico`, icoBuffer);
console.log(`favicon.ico: ${icoBuffer.length} bytes`);
