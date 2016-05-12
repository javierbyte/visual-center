const React = require('react')
const Dropzone = require('react-dropzone');
const _ = require('lodash')

const base64ImageUtils = require('base64-image-utils')
const {base64ImageToRGBMatrix} = base64ImageUtils

const COLOR_DIFF_WEIGHT_EXPO = 0.333;

const App = React.createClass({

  getInitialState() {
    return {
      image64: null
    }
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
    var bgColor = {
      r: 255,
      g: 255,
      b: 255
    }

    base64ImageToRGBMatrix(base64, (err, rgbMatrix) => {
      let height = rgbMatrix.length
      let width = rgbMatrix[0].length

      var rowWeight = []
      var colWeight = []

      let totalDiff = _.reduce(rgbMatrix, (resRow, rgbRow, rgbRowIdx) => {
        var rowDiff = _.reduce(rgbRow, (resCol, rgbCol, rgbColIdx) => {
          let colDiff = rgbDiff(bgColor, rgbCol)
          colWeight[rgbColIdx] = colWeight[rgbColIdx] ? colWeight[rgbColIdx] + colDiff : colDiff
          return resCol + colDiff
        }, 0)

        rowWeight[rgbRowIdx] = rowDiff
        return resRow + rowDiff
      }, 0)

      let mediumRow = (() => {
        let accumulated = 0
        return _.findKey(rowWeight, (rowVal) => {
          accumulated = accumulated + rowVal
          return accumulated * 2 > totalDiff
        })
      })()

      let mediumCol = (() => {
        let accumulated = 0
        return _.findKey(colWeight, (colVal) => {
          accumulated = accumulated + colVal
          return accumulated * 2 > totalDiff
        })
      })()

      console.warn({totalDiff, mediumCol, mediumRow}, mediumCol / width, mediumRow / height)

      this.setState({
        base64: base64,
        visualTop: mediumRow / height,
        visualLeft: mediumCol / width
      })
    });
  },

  render() {
    const {base64, visualTop, visualLeft} = this.state

    return <div>
      <div className='padding-2'>
        <Dropzone onDrop={this.onDrop} className='dropzone'>
          <div>Try drop or click to upload.</div>
        </Dropzone>
      </div>

      <div className='demo-image-comparison'>
        <div className='demo-image-container'>
          <div className='demo-image-container-circle' />
          <div className='demo-image-container-title'>
            Element Center
          </div>
          <img src={base64} className='demo-image' style={{transform: 'translatey(-50%) translatex(-50%)'}}/>
        </div>

        <div className='demo-image-container'>
          <div className='demo-image-container-circle' />
          <div className='demo-image-container-title'>
            Visual Center
          </div>
          <img src={base64} className='demo-image' style={{transform: `translatey(-${visualTop * 50 + 25}%) translatex(-${visualLeft * 50 + 25}%)`}}/>
        </div>
      </div>

      <center className='padding-2'>
        {base64 && `Visual center is at ${toPercent(visualLeft)}% - ${toPercent(visualTop)}%`}
      </center>

    </div>
  }
})

function rgbDiff(baseColor, testColor) {
  var diff = Math.abs(baseColor.r - testColor.r) + Math.abs(baseColor.g - testColor.g) + Math.abs(baseColor.b - testColor.b);
  var maxDiff = 255 * 3;
  return Math.round(diff * Math.pow(diff / maxDiff, COLOR_DIFF_WEIGHT_EXPO)  * testColor.a * 100)
}

function toPercent(number) {
  return Math.round(number * 100000) / 1000
}

module.exports = App
