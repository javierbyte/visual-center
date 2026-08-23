type Center = {
  x: number;
  y: number;
};

type Padding = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type DownloadOptions = {
  filename?: string;
  mimeType?: string;
  svgText?: string | null;
};

type SvgViewport = {
  minX: number;
  minY: number;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function calculateCenteredPadding(
  width: number,
  height: number,
  center: Center,
  roundToPixels = true
): Padding {
  const x = clamp(center.x, 0, 1);
  const y = clamp(center.y, 0, 1);
  const normalize = roundToPixels ? Math.round : (value: number) => value;

  return {
    left: normalize(x < 0.5 ? width * (1 - 2 * x) : 0),
    right: normalize(x > 0.5 ? width * (2 * x - 1) : 0),
    top: normalize(y < 0.5 ? height * (1 - 2 * y) : 0),
    bottom: normalize(y > 0.5 ? height * (2 * y - 1) : 0),
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener(
      'error',
      () => reject(new Error('The image could not be decoded.')),
      { once: true }
    );
    image.src = src;
  });
}

function canvasToPng(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('The browser could not create the PNG.'));
      }
    }, 'image/png');
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parseLength(value: string | null) {
  if (!value) return null;

  const match = value.match(
    /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*([a-z%]*)\s*$/i
  );
  if (!match) return null;

  const numericValue = Number(match[1]);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;

  return { value: numericValue, unit: match[2] };
}

function parseViewBox(value: string | null): SvgViewport | null {
  if (!value) return null;

  const values = value
    .trim()
    .split(/[\s,]+/)
    .map(Number);

  if (
    values.length !== 4 ||
    values.some((number) => !Number.isFinite(number)) ||
    values[2] <= 0 ||
    values[3] <= 0
  ) {
    return null;
  }

  return {
    minX: values[0],
    minY: values[1],
    width: values[2],
    height: values[3],
  };
}

function formatNumber(value: number) {
  return String(Number(value.toPrecision(12)));
}

function growSvgDimension(
  svg: Element,
  attribute: 'width' | 'height',
  ratio: number,
  fallbackSize: number
) {
  const parsedLength = parseLength(svg.getAttribute(attribute));

  if (parsedLength) {
    svg.setAttribute(
      attribute,
      `${formatNumber(parsedLength.value * ratio)}${parsedLength.unit}`
    );
    return;
  }

  svg.setAttribute(attribute, `${formatNumber(fallbackSize * ratio)}px`);
}

async function createCenteredSvg(
  src: string,
  svgText: string,
  center: Center
) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(svgText, 'image/svg+xml');

  if (
    documentNode.getElementsByTagName('parsererror').length > 0 ||
    documentNode.documentElement.localName.toLowerCase() !== 'svg'
  ) {
    throw new Error('The SVG markup could not be parsed.');
  }

  const svg = documentNode.documentElement;
  const decodedImage = await loadImage(src);
  const decodedWidth = decodedImage.naturalWidth || decodedImage.width;
  const decodedHeight = decodedImage.naturalHeight || decodedImage.height;

  if (!decodedWidth || !decodedHeight) {
    throw new Error('The SVG does not have usable dimensions.');
  }

  const existingViewBox = parseViewBox(svg.getAttribute('viewBox'));
  const viewport: SvgViewport = existingViewBox || {
    minX: 0,
    minY: 0,
    width: decodedWidth,
    height: decodedHeight,
  };
  const padding = calculateCenteredPadding(
    viewport.width,
    viewport.height,
    center,
    false
  );
  const paddedWidth = viewport.width + padding.left + padding.right;
  const paddedHeight = viewport.height + padding.top + padding.bottom;

  svg.setAttribute(
    'viewBox',
    [
      viewport.minX - padding.left,
      viewport.minY - padding.top,
      paddedWidth,
      paddedHeight,
    ]
      .map(formatNumber)
      .join(' ')
  );

  growSvgDimension(
    svg,
    'width',
    paddedWidth / viewport.width,
    decodedWidth
  );
  growSvgDimension(
    svg,
    'height',
    paddedHeight / viewport.height,
    decodedHeight
  );

  return new Blob([new XMLSerializer().serializeToString(documentNode)], {
    type: 'image/svg+xml;charset=utf-8',
  });
}

async function createCenteredRaster(src: string, center: Center) {
  const image = await loadImage(src);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  if (!width || !height) {
    throw new Error('The image does not have usable dimensions.');
  }

  const padding = calculateCenteredPadding(width, height, center);
  const canvas = document.createElement('canvas');
  const paddedWidth = width + padding.left + padding.right;
  const paddedHeight = height + padding.top + padding.bottom;

  canvas.width = paddedWidth;
  canvas.height = paddedHeight;

  if (canvas.width !== paddedWidth || canvas.height !== paddedHeight) {
    throw new Error('The corrected image is too large for this browser.');
  }

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('The browser could not create an image canvas.');
  }

  context.drawImage(image, padding.left, padding.top);
  return canvasToPng(canvas);
}

function isSvg(options: DownloadOptions) {
  return (
    options.mimeType?.toLowerCase().split(';')[0] === 'image/svg+xml' ||
    Boolean(options.filename?.toLowerCase().endsWith('.svg'))
  );
}

export async function downloadCenteredImage(
  src: string,
  center: Center,
  options: DownloadOptions = {}
) {
  const svgInput = isSvg(options);
  let blob: Blob;

  if (svgInput) {
    if (!options.svgText) {
      throw new Error('The original SVG markup is unavailable.');
    }
    blob = await createCenteredSvg(src, options.svgText, center);
  } else {
    blob = await createCenteredRaster(src, center);
  }

  triggerDownload(
    blob,
    options.filename || `image-centered.${svgInput ? 'svg' : 'png'}`
  );
}
