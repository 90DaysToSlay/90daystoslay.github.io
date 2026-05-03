import sharp from "sharp";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const dir = "src/assets/images";

const config = {
  // Client logos: displayed small, resize to 400px wide
  "client-logo": { maxWidth: 400, quality: 80 },
  // Product/content images: 800px max
  "slay-in-a-box": { maxWidth: 800, quality: 80 },
  "worksheet-preview": { maxWidth: 800, quality: 80 },
  // Headshots/speaker photos: 600px max
  "jessica-": { maxWidth: 600, quality: 80 },
  "speaker-photo": { maxWidth: 600, quality: 80 },
  // Testimonial avatars: already small, just compress
  "testimonial-": { maxWidth: 400, quality: 80 },
  // Backgrounds: keep large but compress
  "bg-": { maxWidth: 1600, quality: 75 },
  // Logo: keep as-is, just compress
  "logo-hero": { maxWidth: null, quality: 80 },
};

function getConfig(filename) {
  for (const [prefix, cfg] of Object.entries(config)) {
    if (filename.startsWith(prefix)) return cfg;
  }
  return { maxWidth: 800, quality: 80 };
}

const files = readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f));

for (const file of files) {
  const filepath = join(dir, file);
  const sizeBefore = statSync(filepath).size;
  const cfg = getConfig(file);

  let pipeline = sharp(filepath);
  const meta = await pipeline.metadata();

  if (cfg.maxWidth && meta.width > cfg.maxWidth) {
    pipeline = pipeline.resize(cfg.maxWidth);
  }

  if (file.endsWith(".png")) {
    pipeline = pipeline.png({ quality: cfg.quality, compressionLevel: 9 });
  } else {
    pipeline = pipeline.jpeg({ quality: cfg.quality, mozjpeg: true });
  }

  const buf = await pipeline.toBuffer();
  await sharp(buf).toFile(filepath);

  const sizeAfter = statSync(filepath).size;
  const pct = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
  console.log(
    `${file}: ${(sizeBefore / 1024).toFixed(0)}KB → ${(sizeAfter / 1024).toFixed(0)}KB (${pct}% reduction)`,
  );
}
