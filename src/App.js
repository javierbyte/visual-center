const React = require('react')
const Dropzone = require('react-dropzone');
const _ = require('lodash')

const base64ImageUtils = require('base64-image-utils')
const {base64ImageToRGBMatrix} = base64ImageUtils

const demoImage = require('./assets/demo.js')

const COLOR_DIFF_WEIGHT_EXPO = 0.333;

const App = React.createClass({

  getInitialState() {
    return {
      image64: null,

      showGuides: true,
      useCircle: false,
      useExpo: true,

      visualLeft: null,
      visualTop: null,

      backgroundColor: {
        r: 255,
        g: 255,
        b: 255,
        a: 255
      }
    }
  },

  componentDidMount() {
    this.processBase64(demoImage)
  },

  onDrop(fileArray) {
    var file = fileArray[0]
    var reader  = new FileReader();

    reader.addEventListener('load', data => {
      this.processBase64(data.currentTarget.result);
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  },

  processBase64(base64) {
    console.warn(base64)

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
          if (accumulated * 2 > totalDiff) console.log({accumulated})
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

      const leRowSum = _.reduce(rowWeight, (res, el) => {
        return res + el
      }, 0)

      /*
      const leHalfRowSum = _.reduce(rowWeight.slice(0, mediumRow), (res, el) => {
        return res + el
      }, 0)

      const leOtherHalfRowSum = _.reduce(rowWeight.slice(mediumRow - rowWeight.length), (res, el) => {
        return res + el
      }, 0)
      */

      console.warn({mediumRow, height, percent: mediumRow / height, rowWeight})
      // console.warn({totalDiff, leRowSum, leHalfRowSum, leOtherHalfRowSum})

      this.setState({
        base64: base64,
        visualTop: mediumRow / height,
        visualLeft: mediumCol / width,
        backgroundColor: bgColor
      })
    });
  },

  render() {
    const {base64, visualTop, visualLeft, showGuides, useCircle, useExpo, backgroundColor} = this.state
    const resultLeft = expoValue(visualLeft, useExpo)
    const resultTop = expoValue(visualTop, useExpo)

    console.warn({resultLeft, visualLeft})
    console.warn({resultTop, visualTop})

    const nColor = normalizeColor(backgroundColor)

    const bgColorCode = `rgb(${nColor.r}, ${nColor.g}, ${nColor.b})`
    const bgColorCodeDark = `rgb(${Math.floor(nColor.r * 0.9)}, ${Math.floor(nColor.g * 0.9)}, ${Math.floor(nColor.b * 0.9)})`
    const isDark = nColor.r + nColor.g + nColor.b < 255 * 3 / 1.7

    const recommendations = <span>
      {resultLeft > .5 && <span>move it left by <b>{toPercent(resultLeft * .50 - .25)}%</b></span>}
      {resultLeft < .5 && <span>move it right by <b>{toPercent((1 - resultLeft) * .50 - .25)}%</b></span>}
      {resultLeft !== .5 && resultTop !== .5 && <span> and </span>}
      {resultTop > .5 && <span>move it up by <b>{toPercent(resultTop * .50 - .25)}%</b></span>}
      {resultTop < .5 && <span>move it down by <b>{toPercent((1 - resultTop) * .50 - .25)}%</b></span>}
    </span>

    return <div className='app' style={{backgroundColor: bgColorCodeDark, color: isDark ? '#fff' : '#333'}}>
      <div className='app-header'>
        <h1>Visual Center</h1>
        <div>
          This is a tool that will find the visual center of your images.
        </div>

        <Dropzone onDrop={this.onDrop} className='dropzone'>
          <div>Start by selecting your image. Click or drop here.</div>
        </Dropzone>
      </div>

      <div className='controls'>
        <label className='app-control'>
          <input
            type='checkbox'
            checked={showGuides}
            onChange={() => {this.setState({showGuides: !showGuides})}} />
          <div>
            Show guides
          </div>
        </label>

        <label className='app-control'>
          <input
            type='checkbox'
            checked={useCircle}
            onChange={() => {this.setState({useCircle: !useCircle})}} />
          <div>
            Make the canvas a circle
          </div>
        </label>

        <label className='app-control'>
          <input
            type='checkbox'
            checked={useExpo}
            onChange={() => {this.setState({useExpo: !useExpo})}} />
          <div>
            Use logaritmic visual weight
          </div>
        </label>
      </div>

      <div className={`demo-image-comparison ${showGuides ? '-show-guides' : ''} ${useCircle ? '-use-circle' : ''}`}>
        <div className='column'>
          <div className='demo-image-container-title'>
            Element Center
          </div>
          <div className='demo-image-container' style={{backgroundColor: bgColorCode}}>
            <img
              src={base64}
              className='demo-image' />
          </div>
        </div>

        <div className='column'>
          <div className='demo-image-container-title'>
            Visual Center
          </div>
          <div className='demo-image-container' style={{backgroundColor: bgColorCode}}>
            <img
              src={base64}
              className='demo-image'
              style={{
                transform: `translatey(${(0.5 - resultTop) * 100}%) translatex(${(0.5 - resultLeft) * 100}%)`
              }}/>
          </div>
        </div>
      </div>

      {base64 && (<div className='padding-2 results'>
        <div>
          {base64 && `The center is at ${toPercent(resultLeft)}% - ${toPercent(resultTop)}%`}
        </div>
        {recommendations && (<div>
          You can visual center this image if you {recommendations}
        </div>)}
      </div>)}

      <div className='padding-2'>
        Created by <a href="http://javier.xyz/">javierbyte</a>.
      </div>
    </div>
  }
})

function normalizeColor(color) {
  return {
    r: Math.floor(color.r * (color.a / 255) + 255 * (1 - (color.a / 255))),
    g: Math.floor(color.g * (color.a / 255) + 255 * (1 - (color.a / 255))),
    b: Math.floor(color.b * (color.a / 255) + 255 * (1 - (color.a / 255))),
    a: 255
  }
}

function expoValue(val, useExpo) {
  if (useExpo) {
    return Math.pow(val + 0.5, 0.6) - 0.5
  } else {
    return val
  }
}

function rgbDiff(baseColor, testColor, maxDiff) {
  if (testColor.a === 0) return 0

  const diff = Math.abs(baseColor.r - testColor.r) + Math.abs(baseColor.g - testColor.g) + Math.abs(baseColor.b - testColor.b)
  const result = Math.round(Math.pow(diff / maxDiff, COLOR_DIFF_WEIGHT_EXPO)  * (testColor.a / 255) * 1000)

  return result
}

function toPercent(number) {
  return Math.round(number * 10000) / 100
}

module.exports = App
