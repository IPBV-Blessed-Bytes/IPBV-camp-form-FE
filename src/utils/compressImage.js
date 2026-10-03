const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.7;

const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    image.src = url;
  });

const loadSource = async (file) => {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      return loadImageElement(file);
    }
  }
  return loadImageElement(file);
};

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });

export const compressImage = async (
  file,
  { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = {},
) => {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  try {
    const source = await loadSource(file);
    const sourceWidth = source.width;
    const sourceHeight = source.height;
    if (!sourceWidth || !sourceHeight) {
      return file;
    }

    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      return file;
    }
    context.drawImage(source, 0, 0, width, height);
    if (typeof source.close === 'function') {
      source.close();
    }

    const blob = await canvasToBlob(canvas, quality);
    if (!blob || blob.size >= file.size) {
      return file;
    }

    const baseName = file.name ? file.name.replace(/\.[^.]+$/, '') : 'imagem';
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
};
