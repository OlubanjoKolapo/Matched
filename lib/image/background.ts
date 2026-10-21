/**
 * In-browser background removal (@imgly/background-removal, AGPL-3.0). The
 * library and its model load only when first used, on the Add screen, and are
 * cached by the browser after that. Returns null on any failure so the caller
 * can keep the original photo on a neutral tile.
 */
export async function removeBackgroundSafe(image: Blob, onProgress?: (fraction: number) => void): Promise<Blob | null> {
  try {
    const { removeBackground } = await import('@imgly/background-removal');
    return await removeBackground(image, {
      // The quantised model is about half the download of fp16: a much faster first cutout on phones.
      model: 'isnet_quint8',
      output: { format: 'image/png' },
      progress: (_key, current, total) => onProgress?.(total ? current / total : 0),
    });
  } catch (error) {
    console.warn('Background removal failed; keeping the original photo.', error);
    return null;
  }
}
