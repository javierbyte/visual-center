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

      visualLeft: 0.5,
      visualTop: 0.5,

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
      this.processBase64(data.currentTarget.result)
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  },

  processBase64(base64) {
    visualCenter(base64, (err, result) => {
      var {visualTop, visualLeft, bgColor, centerIntensity} = result;

      this.setState({
        visualTop: visualTop,
        visualLeft: visualLeft,

        base64: base64,
        backgroundColor: bgColor,
      })
    })
  },

  render() {
    const {base64, visualTop, visualLeft, showGuides, useCircle, backgroundColor} = this.state
    const resultLeft = visualLeft
    const resultTop = visualTop

    const nColor = normalizeColor(backgroundColor)

    const bgColorCode = `rgb(${nColor.r}, ${nColor.g}, ${nColor.b})`
    const bgColorCodeDark = `rgb(${Math.floor(nColor.r * 0.9)}, ${Math.floor(nColor.g * 0.9)}, ${Math.floor(nColor.b * 0.9)})`
    const isDark = nColor.r + nColor.g + nColor.b < 255 * 3 / 1.7

    const recommendations = _.compact([
      resultLeft > .5 && <span>move it left by <b>{toPercent(resultLeft - 0.5)}%</b></span>,
      resultLeft < .5 && <span>move it right by <b>{toPercent((1 - resultLeft) - 0.5)}%</b></span>,
      resultLeft !== .5 && resultTop !== .5 && <span> and </span>,
      resultTop > .5 && <span>move it up by <b>{toPercent(resultTop - 0.5)}%</b></span>,
      resultTop < .5 && <span>move it down by <b>{toPercent((1 - resultTop) - 0.5)}%</b></span>,
    ])

    return <div className='app' style={{backgroundColor: bgColorCodeDark, color: isDark ? '#fff' : '#333'}}>
      <div className='app-header'>
        <h1 className='app-title'>Visual Center</h1>
        <div>
          Find the visual center of your images.
        </div>

        <Dropzone onDrop={this.onDrop} className='dropzone'>
          <div>Start by selecting your image. Click or drop here.</div>
        </Dropzone>
      </div>

      <div className={`demo-image-comparison ${showGuides ? '-show-guides' : ''} ${useCircle ? '-use-circle' : ''}`}>
        <div className='column'>
          <div className='demo-image-container-title'>
            Container Center
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
      </div>

      {base64 && (<div className='padding-2 results'>
        <div>
          {base64 && `The center is at ${toPercent(resultLeft)}% - ${toPercent(resultTop)}%`}
        </div>
        {recommendations.length ? (<div>
          {'You can visual center your image if you '}
          {_.map(recommendations, (rec, recIdx) => {
            return <span key={recIdx}>{rec}</span>
          })}
        </div>) : <div>Your image is perfectly centered! Congrats!</div>}
        <div>
          <br />
          Interested in <strong>Sketch</strong> and <strong>Illustrator</strong> plugins? <a href='http://eepurl.com/b5_E-j' target='_blank'><strong>Join the newsletter!</strong></a>
        </div>
      </div>)}

      <div className='credits padding-2'>
        <div>More experiments: <a href="http://javier.xyz/img2css"><b>img2css</b> (convert images to pure css)</a>, <a href="http://javier.xyz/cohesive-colors"><b>cohesive-colors</b> (creates cohesive color palletes)</a>, <a href="http://javier.xyz/morphin"><b>morphin</b> (css image morphing)</a>, <a href="http://javier.xyz/clashjs/"><b>clashjs</b> (js ai battle game)</a>.</div>
        <br />
        <div>Created by <a href="http://javier.xyz/"><b>javierbyte</b></a>. (Thanks <a href="http://skycatch.com">Skycatch</a> for letting me use our logo).</div>
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

function toPercent(number) {
  return Math.round(number * 10000) / 100
}

module.exports = App
