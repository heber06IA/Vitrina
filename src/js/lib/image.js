/* Product photo rules for the local demo, where images are stored as data URLs in localStorage. */

export const MAX_IMAGE_BYTES = 1024 * 1024;

export const isValidImage = (file) => file.type.startsWith('image/') && file.size <= MAX_IMAGE_BYTES;

export const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
