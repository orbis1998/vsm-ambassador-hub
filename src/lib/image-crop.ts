export type CropArea = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Rogne une image selon une zone (coords source) et retourne un File. */
export async function cropImageFile(
  file: File,
  crop: CropArea,
  outputName?: string,
): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("Crop failed"))), file.type || "image/jpeg", 0.92),
    );
    return new File([blob], outputName ?? file.name, { type: blob.type });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Calcule une zone de rognage centrée pour un ratio donné. */
export function centerCropArea(imgW: number, imgH: number, aspect: number): CropArea {
  let width = imgW;
  let height = imgW / aspect;
  if (height > imgH) {
    height = imgH;
    width = imgH * aspect;
  }
  return { x: (imgW - width) / 2, y: (imgH - height) / 2, width, height };
}
