/** Proof helpers: LinkedIn URL validation, local image compression, size labels. */

export const MAX_UPLOAD_BYTES = 1 * 1024 * 1024; // compress target: 1MB
export const HARD_MAX_BYTES = 5 * 1024 * 1024; // absolute cap after compression attempts

const LINKEDIN_OK = /^https:\/\/(www\.)?linkedin\.com\/(posts|feed\/update|pulse)\//i;
const LINKEDIN_ANY = /^https:\/\/([\w-]+\.)*linkedin\.com\//i;

/** Accept only links that point at a published post/update on linkedin.com. */
export function isValidLinkedInPostUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (LINKEDIN_OK.test(trimmed)) return true;
  try {
    const u = new URL(trimmed);
    if (!LINKEDIN_ANY.test(trimmed)) return false;
    const path = u.pathname;
    return (
      path.startsWith("/posts/") ||
      path.startsWith("/feed/update/") ||
      path.startsWith("/activity/") ||
      path.startsWith("/pulse/")
    );
  } catch {
    return false;
  }
}

export interface CompressResult {
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  finalSize: number;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("read failed"));
    fr.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = src;
  });
}

/**
 * Downscale + re-encode an image locally (canvas) until it fits `targetBytes`.
 * Large files are never uploaded raw — protects slow connections and the mock store.
 */
export async function compressImage(file: File, targetBytes = MAX_UPLOAD_BYTES): Promise<CompressResult> {
  const originalSize = file.size;
  if (!file.type.startsWith("image/")) throw new Error("not-an-image");
  if (originalSize <= targetBytes) {
    const dataUrl = await blobToDataUrl(file);
    return { blob: file, dataUrl, originalSize, finalSize: originalSize };
  }

  const dataUrl = await blobToDataUrl(file);
  const img = await loadImage(dataUrl);
  let scale = 1;
  let quality = 0.85;
  let best: Blob | null = null;

  for (let attempt = 0; attempt < 7; attempt++) {
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/jpeg", quality));
    if (!blob) break;
    best = blob;
    if (blob.size <= targetBytes) break;
    if (scale > 0.35) scale *= 0.72;
    else quality = Math.max(0.4, quality - 0.12);
  }

  if (!best) throw new Error("compress-failed");
  if (best.size > HARD_MAX_BYTES) throw new Error("too-large");
  const outUrl = await blobToDataUrl(best);
  return { blob: best, dataUrl: outUrl, originalSize, finalSize: best.size };
}

export function bytesLabel(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
