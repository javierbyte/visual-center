const React = require('react')
const Dropzone = require('react-dropzone');
const _ = require('lodash')

const visualCenter = require('./visualCenter.js');

const demoImage = require('./assets/demo.js')

const App = React.createClass({

  getInitialState() {
    return {
      image64: null,

      showGuides: true,
      useCircle: true,
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
    visualCenter(base64, (err, result) => {
      var {visualTop, visualLeft, bgColor} = result;

      this.setState({
        base64: base64,
        visualTop: visualTop,
        visualLeft: visualLeft,
        backgroundColor: bgColor
      })
    })
  },

  render() {
    const {base64, visualTop, visualLeft, showGuides, useCircle, useExpo, backgroundColor} = this.state
    const resultLeft = expoValue(visualLeft, useExpo)
    const resultTop = expoValue(visualTop, useExpo)

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
        <h1 className='app-title'>Visual Center</h1>
        <div>
          This is a tool that will find the visual center of your images.
        </div>

        <Dropzone onDrop={this.onDrop} className='dropzone'>
          <div>Start by selecting your image. Click or drop here.</div>
        </Dropzone>
      </div>

      <div className='app-control-container'>
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

      <div className='credits padding-2'>
        Created by <a href="http://javier.xyz/">javierbyte</a>. More experiments: <a href="http://javier.xyz/img2css">img2css</a>, <a href="http://javier.xyz/cohesive-colors">cohesive-colors</a>, <a href="http://javier.xyz/morphin">morphin</a>.
      </div>
    </div>
  }
})

function expoValue(val, useExpo) {
  if (useExpo) {
    return Math.pow(val + 0.5, 0.5) - 0.5
  } else {
    return val
  }
}

function normalizeColor(color) {
  return {
    r: Math.floor(color.r * (color.a / 255) + 255 * (1 - (color.a / 255))),
    g: Math.floor(color.g * (color.a / 255) + 255 * (1 - (color.a / 255))),
    b: Math.floor(color.b * (color.a / 255) + 255 * (1 - (color.a / 255))),
    a: 255
  }
}

function toPercent(number) {
  return Math.round(number * 10000) / 100
}

module.exports = App
