export const prepareProfileImage = (file, size = 320) => new Promise((resolve, reject) => {
  if (!file?.type?.startsWith('image/')) {
    reject(new Error('יש לבחור קובץ תמונה תקין.'));
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    reject(new Error('גודל התמונה המרבי הוא 8MB.'));
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => reject(new Error('לא ניתן לקרוא את קובץ התמונה.'));
  reader.onload = () => {
    const image = new window.Image();
    image.onerror = () => reject(new Error('לא ניתן לעבד את התמונה שנבחרה.'));
    image.onload = () => {
      const sourceSize = Math.min(image.width, image.height);
      const sourceX = (image.width - sourceSize) / 2;
      const sourceY = (image.height - sourceSize) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext('2d');
      context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});
