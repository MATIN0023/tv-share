import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public", "icons");
const sourceLogo = join(iconsDir, "logo.png");
const transparentLogo = join(iconsDir, "logo-transparent.png");

mkdirSync(iconsDir, { recursive: true });

/** Make near-white pixels transparent (keeps gradient logo edges smooth). */
async function removeWhiteBackground(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 242;
  const feather = 40;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const min = Math.min(r, g, b);

    if (min >= threshold) {
      data[i + 3] = 0;
      continue;
    }

    if (min >= threshold - feather) {
      const fade = 1 - (min - (threshold - feather)) / feather;
      data[i + 3] = Math.round(data[i + 3] * fade);
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);

  return { width: info.width, height: info.height };
}

/** PWA / favicon: logo on dark rounded tile (works on home screens). */
async function buildAppIcon(logoPath, size, outputPath, { bg = "#18181b", padding = 0.18 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const logoBuf = await sharp(logoPath)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const radius = Math.round(size * 0.22);
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>
  </svg>`;

  const offset = Math.round((size - inner) / 2);

  await sharp(Buffer.from(bgSvg))
    .composite([{ input: logoBuf, left: offset, top: offset }])
    .png()
    .toFile(outputPath);
}

console.log("Processing logo from", sourceLogo);
const dims = await removeWhiteBackground(sourceLogo, transparentLogo);
console.log("Wrote transparent logo:", transparentLogo, `(${dims.width}x${dims.height})`);

for (const size of [192, 512]) {
  const out = join(iconsDir, `icon-${size}x${size}.png`);
  await buildAppIcon(transparentLogo, size, out);
  console.log("Wrote", out);
}

const favicon = join(iconsDir, "favicon.png");
await buildAppIcon(transparentLogo, 32, favicon, { padding: 0.12 });
console.log("Wrote", favicon);

// Apple touch icon
const apple = join(iconsDir, "apple-touch-icon.png");
await buildAppIcon(transparentLogo, 180, apple);
console.log("Wrote", apple);
