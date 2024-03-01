export function downloadCenteredImage(
  src: string,
  center: { x: number; y: number }
) {
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

    // ctx.drawImage(img, 0, 0);
    ctx.drawImage(
      img,
      x > 0.5 ? 0 : canvas.width - img.width,
      y > 0.5 ? 0 : canvas.height - img.height
    );

    // // draw in the dom
    // const img2 = new Image();
    // img2.src = canvas.toDataURL('image/png');
    // img2.style.border = '1px solid red';
    // document.body.appendChild(img2);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'image.png';
    a.click();
  };
}
