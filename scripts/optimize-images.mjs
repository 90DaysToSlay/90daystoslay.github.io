// Convert source raster images to webp (resizing to displayed dimensions
// where the source is oversized) and remove the original png/jpeg.
//
// Run manually after dropping new source images into src/assets/images/.
// Background textures are kept as PNG because webp loses on them.

import sharp from "sharp";
import { readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";

const dir = "src/assets/images";

// Per-prefix output config. `format: "png"` keeps the source format (used
// for backgrounds where webp doesn't help). Everything else becomes webp.
//
// We deliberately don't resize raster sources here. Layout for several
// images (.intro-media img, .slay-box-promo img) currently relies on the
// intrinsic dimensions of the source, so changing them would require
// matching CSS work. webp conversion alone yields ~70% size reduction.
const config = {
  "client-logo": { quality: 80, format: "webp" },
  "slay-in-a-box": { quality: 80, format: "webp" },
  "worksheet-preview": { quality: 80, format: "webp" },
  "jessica-": { quality: 80, format: "webp" },
  "speaker-photo": { quality: 80, format: "webp" },
  "speaker-badge": { quality: 80, format: "webp" },
  "testimonial-": { quality: 80, format: "webp" },
  "bg-": { quality: 75, format: "png" },
  "logo-hero": { quality: 85, format: "webp" },
};

function getConfig(filename) {
  for (const [prefix, cfg] of Object.entries(config)) {
    if (filename.startsWith(prefix)) return cfg;
  }
  return { maxWidth: 800, quality: 80, format: "webp" };
}

const files = readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f));

for (const file of files) {
  const filepath = join(dir, file);
  const sizeBefore = statSync(filepath).size;
  const cfg = getConfig(file);

  let pipeline = sharp(filepath);

  const ext = cfg.format === "webp" ? ".webp" : ".png";
  const outPath = filepath.replace(/\.(png|jpe?g)$/i, ext);

  if (cfg.format === "webp") {
    const buf = await pipeline.webp({ quality: cfg.quality }).toBuffer();
    writeFileSync(outPath, buf);
  } else {
    const buf = await pipeline
      .png({ quality: cfg.quality, compressionLevel: 9 })
      .toBuffer();
    writeFileSync(outPath, buf);
  }

  // Remove the source if its extension differs from the output (webp
  // conversion deletes the original png/jpeg).
  if (outPath !== filepath) unlinkSync(filepath);

  const sizeAfter = statSync(outPath).size;
  const pct = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
  console.log(
    `${file} → ${outPath.split("/").pop()}: ${(sizeBefore / 1024).toFixed(0)}KB → ${(sizeAfter / 1024).toFixed(0)}KB (${pct}% reduction)`,
  );
}
