/* eslint-disable */

import base64ImageUtils from 'base64-image-utils';

const _ = require('lodash');
const { base64ImageToRGBMatrix } = base64ImageUtils;

const COLOR_DIFF_WEIGHT_EXPO = 0.333;

const ROUNDS = 250;
const SIZE = 420;

function visualCenter(base64, callback, opts = {}) {
  base64ImageToRGBMatrix(
    base64,
    (err, rgbMatrix) => {
      const height = rgbMatrix.length;
      const width = rgbMatrix[0].length;
      const bgColor = normalizeColor(rgbMatrix[0][0]);

      const { visualLeft, visualTop } = calculateVisualCenter(rgbMatrix);

      callback(null, {
        visualTop: visualTop,
        visualLeft: visualLeft,

        bgColor: bgColor,
        width: width,
        height: height
      });
    },
    {
      size: SIZE
    }
  );
}

function calculateVisualCenter(rgbMatrix) {
  var visualLeft = 0.5;
  var visualTop = 0.5;

  var { visualLeft } = recursiveGetCoord(rgbMatrix, visualLeft, visualTop, 'X', 1 / ROUNDS);
  var { visualLeft } = recursiveGetCoord(rgbMatrix, visualLeft, visualTop, 'X', -1 / ROUNDS);
  var { visualTop } = recursiveGetCoord(rgbMatrix, visualLeft, visualTop, 'Y', 1 / ROUNDS);
  var { visualTop } = recursiveGetCoord(rgbMatrix, visualLeft, visualTop, 'Y', -1 / ROUNDS);

  return { visualLeft, visualTop };
}

function recursiveGetCoord(rgbMatrix, visualLeft, visualTop, currentAxis, stepSize) {
  const bgColor = normalizeColor(rgbMatrix[0][0]);
  const height = rgbMatrix.length;
  const width = rgbMatrix[0].length;

  var visualLeftToApply = visualLeft;
  var visualTopToApply = visualTop;

  const ops = {
    bgColor,
    height: rgbMatrix.length,
    width: rgbMatrix[0].length,
    maxDiff:
      Math.max(bgColor.r, 255 - bgColor.r) +
      Math.max(bgColor.g, 255 - bgColor.g) +
      Math.max(bgColor.b, 255 - bgColor.b),
    maxDistance: getDistance([0, 0], [width, height])
  };

  var newVisualLeft = visualLeft;
  var newVisualTop = visualTop;

  if (currentAxis === 'X') {
    newVisualLeft += stepSize;
  } else {
    newVisualTop += stepSize;
  }

  var oldCenterIntensity = getCenterIntensity(rgbMatrix, visualLeft, visualTop, ops);
  var newCenterIntensity = getCenterIntensity(rgbMatrix, newVisualLeft, newVisualTop, ops);

  while (newCenterIntensity > oldCenterIntensity) {
    visualLeftToApply = newVisualLeft;
    visualTopToApply = newVisualTop;

    if (currentAxis === 'X') {
      newVisualLeft += stepSize;
    } else {
      newVisualTop += stepSize;
    }
    oldCenterIntensity = newCenterIntensity;
    newCenterIntensity = getCenterIntensity(rgbMatrix, newVisualLeft, newVisualTop, ops);
  }

  return {
    visualLeft: visualLeftToApply,
    visualTop: visualTopToApply
  };
}

function getCenterIntensity(rgbMatrix, visualLeft, visualTop, ops) {
  const { bgColor, height, width, maxDiff, maxDistance } = ops;

  const centerCol = visualTop * height;
  const centerRow = visualLeft * width;
  const centerPoint = [centerCol, centerRow];

  return _.reduce(
    rgbMatrix,
    (resRow, row, rowIdx) => {
      return (
        resRow +
        _.reduce(
          row,
          (resCol, col, colIdx) => {
            const cellColorDiff = rgbDiff(bgColor, col, maxDiff);

            if (!cellColorDiff) return resCol;

            const cellDistance = getDistance(centerPoint, [rowIdx, colIdx]);
            const cellColorWeight =
              cellColorDiff * Math.pow(1 - cellDistance / maxDistance, 0.5) * 1000;

            return resCol + cellColorWeight;
          },
          0
        )
      );
    },
    0
  );
}

function getDistance(pointA, pointB) {
  return Math.pow(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2), 0.5);
}

function normalizeColor(color) {
  return {
    r: Math.floor(color.r * (color.a / 255) + 255 * (1 - color.a / 255)),
    g: Math.floor(color.g * (color.a / 255) + 255 * (1 - color.a / 255)),
    b: Math.floor(color.b * (color.a / 255) + 255 * (1 - color.a / 255)),
    a: 255
  };
}

function rgbDiff(baseColor, testColor, maxDiff) {
  if (testColor.a === 0) return 0;

  const diff =
    Math.abs(baseColor.r - testColor.r) +
    Math.abs(baseColor.g - testColor.g) +
    Math.abs(baseColor.b - testColor.b);
  const result = Math.pow(diff / maxDiff, COLOR_DIFF_WEIGHT_EXPO) * (testColor.a / 255) * 1000;

  return result;
}

// module.exports = visualCenter;
export default visualCenter;
