export function downloadCenteredImage(src, center) {
  const { x, y } = center;

  const img = new Image();
  img.src = src;
  img.onload = () => {
    const canvas = document.createElement('canvas');

    canvas.width = img.width + Math.abs(0.5 - x) * img.width * 2;
    canvas.height = img.height + Math.abs(0.5 - y) * img.height * 2;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.drawImage(
      img,
      x > 0.5 ? 0 : canvas.width - img.width,
      y > 0.5 ? 0 : canvas.height - img.height
    );

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'image-centered.png';
    a.click();
  };
}
