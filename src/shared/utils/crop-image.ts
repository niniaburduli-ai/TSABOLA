export type PixelCrop = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function getCroppedImageBlob(
  imageSrc: string,
  crop: PixelCrop,
  mimeType: string = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('CANVAS_CONTEXT_UNAVAILABLE');

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('CANVAS_TO_BLOB_FAILED'))),
      mimeType,
      quality
    );
  });
}

export async function padImageToAspect(
  imageSrc: string,
  aspect: number,
  background: string | null
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const { naturalWidth: width, naturalHeight: height } = image;
  const currentAspect = width / height;

  const canvasWidth = currentAspect > aspect ? width : Math.round(height * aspect);
  const canvasHeight = currentAspect > aspect ? Math.round(width / aspect) : height;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('CANVAS_CONTEXT_UNAVAILABLE');

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  const dx = Math.round((canvasWidth - width) / 2);
  const dy = Math.round((canvasHeight - height) / 2);
  ctx.drawImage(image, dx, dy, width, height);

  const mimeType = background ? 'image/jpeg' : 'image/png';
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('CANVAS_TO_BLOB_FAILED'))),
      mimeType,
      0.92
    );
  });
}
