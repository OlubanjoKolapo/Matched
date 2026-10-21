/**
 * Image helpers for the Add flow. Browser-only: they use createImageBitmap and canvas.
 */

/** Decodes a photo, honouring EXIF orientation so phone photos aren't sideways. */
export async function loadBitmap(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob, { imageOrientation: 'from-image' });
}

function canvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return c;
}

async function toBlob(c: OffscreenCanvas | HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  if ('convertToBlob' in c) return c.convertToBlob({ type, quality });
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))), type, quality),
  );
}

function context(c: OffscreenCanvas | HTMLCanvasElement) {
  const ctx = c.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) throw new Error('2D canvas unavailable');
  return ctx;
}

/**
 * Scales an image so its longest side is at most `maxSide`. JPEG output is
 * flattened onto white, since JPEG has no transparency.
 */
export async function resizeImage(
  blob: Blob,
  { maxSide = 1000, type = 'image/jpeg', quality = 0.8 }: { maxSide?: number; type?: 'image/jpeg' | 'image/png' | 'image/webp'; quality?: number } = {},
): Promise<Blob> {
  const bitmap = await loadBitmap(blob);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const c = canvas(w, h);
  const ctx = context(c);
  if (type === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return toBlob(c, type, quality);
}

/** Alpha below LOW becomes transparent, above HIGH opaque; the band between stays a soft edge. */
const ALPHA = { low: 90, high: 220 } as const;

/** Regions smaller than this fraction of the largest are specks of leftover background. */
const SPECK_FRACTION = 0.05;

/**
 * Removes isolated specks from a cutout's mask: labels 4-connected opaque
 * regions and clears any much smaller than the largest. Two shoes in one photo
 * are both large regions, so a pair survives.
 */
export function despeckle(data: Uint8ClampedArray, width: number, height: number): void {
  const total = width * height;
  const labels = new Int32Array(total);
  const stack = new Int32Array(total);
  const sizes = [0];
  for (let start = 0; start < total; start++) {
    if (labels[start] || data[start * 4 + 3] === 0) continue;
    const label = sizes.length;
    let size = 0;
    let top = 0;
    stack[top++] = start;
    labels[start] = label;
    while (top) {
      const i = stack[--top]!;
      size++;
      const x = i % width;
      const neighbours = [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i - width, i + width];
      for (const n of neighbours) {
        if (n < 0 || n >= total || labels[n] || data[n * 4 + 3] === 0) continue;
        labels[n] = label;
        stack[top++] = n;
      }
    }
    sizes.push(size);
  }
  let largest = 0;
  for (const s of sizes) if (s > largest) largest = s;
  const minimum = largest * SPECK_FRACTION;
  for (let i = 0; i < total; i++) {
    const label = labels[i]!;
    if (label && sizes[label]! < minimum) data[i * 4 + 3] = 0;
  }
}

/**
 * Cleans a cutout's alpha (removing the faint haze of leftover background the
 * model can leave), then crops transparent margins with a little breathing room.
 */
export async function trimTransparent(blob: Blob, padding = 0.04): Promise<Blob> {
  const bitmap = await loadBitmap(blob);
  const { width, height } = bitmap;
  const c = canvas(width, height);
  const ctx = context(c);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const image = ctx.getImageData(0, 0, width, height);
  const { data } = image;
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i]!;
    data[i] = a <= ALPHA.low ? 0 : a >= ALPHA.high ? 255 : Math.round(((a - ALPHA.low) / (ALPHA.high - ALPHA.low)) * 255);
  }
  despeckle(data, width, height);
  ctx.putImageData(image, 0, 0);

  let top = height;
  let left = width;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3]! > 24) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return blob; // nothing opaque: keep as is

  const pad = Math.round(Math.max(right - left, bottom - top) * padding);
  const sx = Math.max(0, left - pad);
  const sy = Math.max(0, top - pad);
  const sw = Math.min(width, right + pad + 1) - sx;
  const sh = Math.min(height, bottom + pad + 1) - sy;
  const out = canvas(sw, sh);
  context(out).drawImage(c as CanvasImageSource, sx, sy, sw, sh, 0, 0, sw, sh);
  return toBlob(out, 'image/png');
}

/** RGB samples from an image, for color detection. Cutouts: opaque pixels only. Photos: the central area. */
export async function samplePixels(blob: Blob, size = 72): Promise<[number, number, number][]> {
  const bitmap = await loadBitmap(blob);
  const scale = size / Math.max(bitmap.width, bitmap.height);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const c = canvas(w, h);
  const ctx = context(c);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const { data } = ctx.getImageData(0, 0, w, h);

  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i]! < 200) transparent++;
  const isCutout = transparent > (w * h) / 20;

  const pixels: [number, number, number][] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (isCutout ? data[i + 3]! < 200 : x < w * 0.2 || x > w * 0.8 || y < h * 0.15 || y > h * 0.85) continue;
      pixels.push([data[i]!, data[i + 1]!, data[i + 2]!]);
    }
  }
  return pixels;
}

/** Base64 (no data: prefix) for API upload. */
export async function toBase64(blob: Blob): Promise<string> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i = 0; i < buffer.length; i += 0x8000) binary += String.fromCharCode(...buffer.subarray(i, i + 0x8000));
  return btoa(binary);
}
