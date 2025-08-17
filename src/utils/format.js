export function bytesToKB(bytes) {
  return bytes / 1024;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function sanitizeFileName(name, extFallback = "jpg") {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}`.replace(/[^a-z0-9-_]+/gi, "_") + `.${extFallback}`;
}
