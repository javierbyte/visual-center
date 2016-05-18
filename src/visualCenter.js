const base64ImageUtils = require('base64-image-utils')
const _ = require('lodash')
const {base64ImageToRGBMatrix} = base64ImageUtils

const COLOR_DIFF_WEIGHT_EXPO = 0.333;

function visualCenter(base64, callback) {
  base64ImageToRGBMatrix(base64, (err, rgbMatrix) => {
    const height = rgbMatrix.length
    const width = rgbMatrix[0].length

    const bgColor = normalizeColor(rgbMatrix[0][0])
    const maxDiff = Math.max(bgColor.r, 255 - bgColor.r) + Math.max(bgColor.g, 255 - bgColor.g) + Math.max(bgColor.b, 255 - bgColor.b)

    let rowWeight = []
    let colWeight = []

    const totalDiff = _.reduce(rgbMatrix, (resRow, rgbRow, rgbRowIdx) => {
      const rowDiff = _.reduce(rgbRow, (resCol, rgbCol, rgbColIdx) => {
        const colDiff = rgbDiff(bgColor, rgbCol, maxDiff)
        colWeight[rgbColIdx] = colWeight[rgbColIdx] ? colWeight[rgbColIdx] + colDiff : colDiff
        return resCol + colDiff
      }, 0)

      rowWeight[rgbRowIdx] = rowDiff
      return resRow + rowDiff
    }, 0)

    const mediumRow = (() => {
      let accumulated = 0
      return parseInt(_.findKey(rowWeight, (rowVal) => {
        accumulated = accumulated + rowVal
        return accumulated * 2 > totalDiff
      }), 10)
    })()

    const mediumCol = (() => {
      let accumulated = 0
      return parseInt(_.findKey(colWeight, (colVal) => {
        accumulated = accumulated + colVal
        return accumulated * 2 > totalDiff
      }), 10)
    })()

    callback(null, {
      visualTop: mediumRow / height,
      visualLeft: mediumCol / width,
      bgColor: bgColor,
      width: width,
      height: height
    })
  });
}

function normalizeColor(color) {
  return {
    r: Math.floor(color.r * (color.a / 255) + 255 * (1 - (color.a / 255))),
    g: Math.floor(color.g * (color.a / 255) + 255 * (1 - (color.a / 255))),
    b: Math.floor(color.b * (color.a / 255) + 255 * (1 - (color.a / 255))),
    a: 255
  }
}

function rgbDiff(baseColor, testColor, maxDiff) {
  if (testColor.a === 0) return 0

  const diff = Math.abs(baseColor.r - testColor.r) + Math.abs(baseColor.g - testColor.g) + Math.abs(baseColor.b - testColor.b)
  const result = Math.round(Math.pow(diff / maxDiff, COLOR_DIFF_WEIGHT_EXPO)  * (testColor.a / 255) * 1000)

  return result
}

module.exports = visualCenter
