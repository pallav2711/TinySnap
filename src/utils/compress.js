// Core browser-side compression using Canvas. No external libs.

export async function readImage(file) {
  const blobUrl = URL.createObjectURL(file);
  const img = await loadImage(blobUrl);
  URL.revokeObjectURL(blobUrl);
  return img;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawToCanvas(img, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), mime, quality));
}

function pickMime(format, originalType) {
  if (format === "jpeg") return "image/jpeg";
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  // auto: keep original if supported
  return ["image/jpeg", "image/png", "image/webp"].includes(originalType)
    ? originalType
    : "image/jpeg";
}

function computeTargetSize(srcW, srcH, targetW, targetH, keepAspect) {
  if (!targetW && !targetH) return { w: srcW, h: srcH };
  if (keepAspect) {
    if (targetW && targetH) {
      const scale = Math.min(targetW / srcW, targetH / srcH);
      return { w: Math.max(1, Math.round(srcW * scale)), h: Math.max(1, Math.round(srcH * scale)) };
    }
    if (targetW) return { w: targetW, h: Math.max(1, Math.round((targetW / srcW) * srcH)) };
    if (targetH) return { w: Math.max(1, Math.round((targetH / srcH) * srcW)), h: targetH };
  } else {
    return { w: targetW || srcW, h: targetH || srcH };
  }
}

// One-pass compress (used in quality mode)
export async function compressOnce({
  file,
  quality = 0.8,
  format = "auto",
  targetWidth = null,
  targetHeight = null,
  keepAspect = true,
}) {
  const img = await readImage(file);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const { w, h } = computeTargetSize(srcW, srcH, targetWidth, targetHeight, keepAspect);
  const canvas = drawToCanvas(img, w, h);
  const mime = pickMime(format, file.type);
  const q = mime === "image/png" ? undefined : quality;
  const blob = await canvasToBlob(canvas, mime, q);
  return { blob, width: w, height: h, mime };
}

// Target-size compress: try decreasing quality, then scale if still large
export async function compressToTarget({
  file,
  targetKB,             // target size in KB
  startQuality = 0.9,    // initial quality
  minQuality = 0.2,      // won't go below this
  downscaleStep = 0.9,   // each step reduce width/height by 10% if needed
  format = "auto",
  targetWidth = null,
  targetHeight = null,
  keepAspect = true,
  onProgress = () => {}, // optional callback (0..100)
}) {
  const img = await readImage(file);
  let srcW = img.naturalWidth || img.width;
  let srcH = img.naturalHeight || img.height;

  // Start from user target dimensions if provided; else original
  const startSize = computeTargetSize(srcW, srcH, targetWidth, targetHeight, keepAspect);
  let curW = startSize.w;
  let curH = startSize.h;
  const mime = pickMime(format, file.type);

  let quality = startQuality;
  const targetBytes = targetKB * 1024;

  // Two-phase loop: quality down, then size down if needed
  for (let scaleAttempt = 0; scaleAttempt < 8; scaleAttempt++) {
    // Reset quality for each scaleAttempt
    quality = startQuality;

    for (let qAttempt = 0; qAttempt < 12; qAttempt++) {
      const canvas = drawToCanvas(img, curW, curH);
      const q = mime === "image/png" ? undefined : quality;
      const blob = await canvasToBlob(canvas, mime, q);
      onProgress(Math.min(95, Math.round((scaleAttempt * 12 + qAttempt + 1) / (8 * 12) * 100)));

      if (blob.size <= targetBytes || quality <= minQuality || mime === "image/png") {
        // stop if reached, or PNG (quality ignored), or hit min
        return { blob, width: curW, height: curH, mime };
      }
      quality -= (startQuality - minQuality) / 6; // reduce in ~6 steps
      if (quality < minQuality) quality = minQuality;
    }

    // Not small enough: reduce dimensions and try again
    curW = Math.max(1, Math.round(curW * downscaleStep));
    curH = Math.max(1, Math.round(curH * downscaleStep));
  }

  // Fallback: final render with min quality
  const canvas = drawToCanvas(img, curW, curH);
  const q = mime === "image/png" ? undefined : minQuality;
  const blob = await canvasToBlob(canvas, mime, q);
  onProgress(100);
  return { blob, width: curW, height: curH, mime };
}
