// Browser-only helpers for preparing uploads. Drawing an image onto a canvas keeps
// only its first frame, so animated GIFs come out as still images.

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image couldn't be read. Try a different file."));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality = 0.85) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't process that image."))),
      type,
      quality
    );
  });
}

// WEBP where supported; Safari can't encode it and silently returns PNG, so use JPEG there
async function canvasToCompactImage(canvas) {
  const webp = await canvasToBlob(canvas, "image/webp");
  return webp.type === "image/webp" ? webp : canvasToBlob(canvas, "image/jpeg");
}

function newCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  // JPEG has no transparency, so give see-through images a neutral background
  context.fillStyle = "#1c1917";
  context.fillRect(0, 0, width, height);
  return { canvas, context };
}

export function extensionFor(blob) {
  return blob.type === "image/webp" ? "webp" : "jpg";
}

// centre-cropped square, e.g. for profile pictures
export async function toStaticSquare(file, size = 400) {
  const { img, url } = await loadImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const { canvas, context } = newCanvas(size, size);
  context.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
  URL.revokeObjectURL(url);
  return canvasToCompactImage(canvas);
}

// first frame as a JPEG, scaled down to at most maxWidth, keeping the aspect ratio
export async function toStillFrame(file, maxWidth = 1600) {
  const { img, url } = await loadImage(file);
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const { canvas, context } = newCanvas(Math.round(img.naturalWidth * scale), Math.round(img.naturalHeight * scale));
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  return canvasToBlob(canvas, "image/jpeg");
}

// banners are stored as banner.<ext> with a still copy beside them
export function bannerStillUrl(bannerUrl) {
  return bannerUrl?.replace(/\/banner\.[a-z]+(\?.*)?$/, "/banner-still.jpg$1") ?? null;
}
