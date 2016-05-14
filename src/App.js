const React = require('react')
const Dropzone = require('react-dropzone');
const _ = require('lodash')

const base64ImageUtils = require('base64-image-utils')
const {base64ImageToRGBMatrix} = base64ImageUtils

const demoImage = require('./assets/demo.js')

const COLOR_DIFF_WEIGHT_EXPO = 0.5;

const App = React.createClass({

  getInitialState() {
    return {
      image64: null,

      showGuides: true,
      useCircle: false,

      visualLeft: null,
      visualRight: null,

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

      let rowWeight = []
      let colWeight = []

      const totalDiff = _.reduce(rgbMatrix, (resRow, rgbRow, rgbRowIdx) => {
        const rowDiff = _.reduce(rgbRow, (resCol, rgbCol, rgbColIdx) => {
          const colDiff = rgbDiff(bgColor, rgbCol)
          colWeight[rgbColIdx] = colWeight[rgbColIdx] ? colWeight[rgbColIdx] + colDiff : colDiff
          return resCol + colDiff
        }, 0)

        rowWeight[rgbRowIdx] = rowDiff
        return resRow + rowDiff
      }, 0)

      const mediumRow = (() => {
        let accumulated = 0
        return _.findKey(rowWeight, (rowVal) => {
          accumulated = accumulated + rowVal
          return accumulated * 2 > totalDiff
        })
      })()

      const mediumCol = (() => {
        let accumulated = 0
        return _.findKey(colWeight, (colVal) => {
          accumulated = accumulated + colVal
          return accumulated * 2 > totalDiff
        })
      })()

      this.setState({
        base64: base64,
        visualTop: mediumRow / height,
        visualLeft: mediumCol / width,
        backgroundColor: bgColor
      })
    });
  },

  render() {
    const {base64, visualTop, visualLeft, showGuides, useCircle, backgroundColor} = this.state

    const nColor = normalizeColor(backgroundColor)

    const bgColorCode = `rgb(${nColor.r}, ${nColor.g}, ${nColor.b})`
    const bgColorCodeDark = `rgb(${Math.floor(nColor.r * 0.9)}, ${Math.floor(nColor.g * 0.9)}, ${Math.floor(nColor.b * 0.9)})`
    const isDark = nColor.r + nColor.g + nColor.b < 255 * 3 / 1.7

    const recommendations = _.compact([
      visualLeft > .5 && ` move it left by ${toPercent(visualLeft * .50 - .25)}%`,
      visualLeft < .5 && ` move it right by ${toPercent((1 - visualLeft) * .50 - .25)}%`,
      visualTop > .5 && ` move it up by ${toPercent(visualTop * .50 - .25)}%`,
      visualTop < .5 && ` move it down by ${toPercent((1 - visualTop) * .50 - .25)}%`,
    ]).join(' and ')

    return <div className='app' style={{backgroundColor: bgColorCodeDark, color: isDark ? '#fff' : '#333'}}>
      <div className='padding-2'>
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
            Use a circle
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
              className='demo-image'
              style={{
                transform: 'translatey(-50%) translatex(-50%)'
              }}/>
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
                transform: `translatey(-${visualTop * 50 + 25}%) translatex(-${visualLeft * 50 + 25}%)`
              }}/>
          </div>
        </div>
      </div>

      {base64 && (<div className='padding-2'>
        <div>
          {base64 && `The center is at ${toPercent(visualLeft)}% - ${toPercent(visualTop)}%.`}
        </div>
        {recommendations && (' You can visual center this image if you ' + recommendations) + '.'}
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

function rgbDiff(baseColor, testColor) {
  if (testColor.a === 0) return 0
  var diff = Math.abs(baseColor.r - testColor.r) + Math.abs(baseColor.g - testColor.g) + Math.abs(baseColor.b - testColor.b);
  var maxDiff = 255 * 3;
  const result = Math.round(Math.pow(diff / maxDiff, COLOR_DIFF_WEIGHT_EXPO)  * (testColor.a / 255))
  return result
}

function toPercent(number) {
  return Math.round(number * 10000) / 100
}

module.exports = App
