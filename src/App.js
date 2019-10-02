import React from "react";

import Dropzone from "react-dropzone";
import _ from "lodash";

import visualCenter from "./visualCenter.js";
import demoImage from "./assets/demo.js";

class App extends React.Component {
  constructor(props) {
    super();

    this.state = {
      base64: null,

      showGuides: true,
      useCircle: true,
      useSpin: false,

      visualLeft: 0.5,
      visualTop: 0.66,

      backgroundColor: {
        r: 255,
        g: 255,
        b: 255,
        a: 255
      }
    };
  }

  componentDidMount() {
    this.setState({
      base64: demoImage
    });
    // this.processBase64(demoImage);
  }

  onDrop(fileArray) {
    const file = fileArray[0];
    const reader = new FileReader();

    reader.addEventListener(
      "load",
      data => {
        this.processBase64(data.currentTarget.result);
      },
      false
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  processBase64(base64) {
    visualCenter(base64, (err, result) => {
      const { visualTop, visualLeft, bgColor } = result;

      this.setState({
        visualTop: visualTop,
        visualLeft: visualLeft,

        base64: base64,
        backgroundColor: bgColor
      });
    });
  }

  render() {
    const { base64, visualTop, visualLeft, showGuides, useCircle, useSpin, backgroundColor } = this.state;
    const resultLeft = visualLeft;
    const resultTop = visualTop;

    const nColor = normalizeColor(backgroundColor);

    const bgColorCode = `rgb(${nColor.r}, ${nColor.g}, ${nColor.b})`;
    const bgColorCodeDark = `rgb(${Math.floor(nColor.r * 0.9)}, ${Math.floor(nColor.g * 0.9)}, ${Math.floor(
      nColor.b * 0.9
    )})`;
    const isDark = nColor.r + nColor.g + nColor.b < (255 * 3) / 1.7;

    const recommendations = _.compact([
      resultLeft > 0.5 && (
        <span>
          move it left by <b>{toPercent(resultLeft - 0.5)}%</b>
        </span>
      ),
      resultLeft < 0.5 && (
        <span>
          move it right by <b>{toPercent(1 - resultLeft - 0.5)}%</b>
        </span>
      ),
      resultLeft !== 0.5 && resultTop !== 0.5 && <span> and </span>,
      resultTop > 0.5 && (
        <span>
          move it up by <b>{toPercent(resultTop - 0.5)}%</b>
        </span>
      ),
      resultTop < 0.5 && (
        <span>
          move it down by <b>{toPercent(1 - resultTop - 0.5)}%</b>
        </span>
      )
    ]);

    return (
      <div className="app" style={{ backgroundColor: bgColorCodeDark, color: isDark ? "#fff" : "#333" }}>
        <div className="app-header">
          <Dropzone onDrop={this.onDrop.bind(this)} className="dropzone">
            <div>
              <h1 className="app-title">Visual Center</h1>
              <div>Find the visual center of your images.</div>
              <div style={{marginTop: "0.5rem"}}>Start by selecting your image. Click or drop here.</div>
            </div>
          </Dropzone>
        </div>

        <div
          className={`demo-image-comparison ${showGuides ? "-show-guides" : ""} ${useCircle ? "-use-circle" : ""} ${
            useSpin ? "-use-spin" : ""
          }`}>
          <div className="column">
            <div className="demo-image-container-title">Container Center</div>
            <div className="demo-image-container" style={{ backgroundColor: bgColorCode }}>
              <img
                src={base64}
                style={{
                  transform: `translatey(-50%) translatex(-50%)`
                }}
                className="demo-image"
              />

              {new Array(32).fill("").map((el, elIdx, arr) => {
                const tot = arr.length * 3;

                const opacity = 0.1 + 0.3 * ((arr.length - elIdx) / arr.length);

                console.warn({ bgColorCode });

                const shadowStyle = {
                  outline: "none",
                  transform: `translatey(-${0.5 * 100}%) translatex(${-0.5 * 100}%) rotate(-${(360 / tot) * elIdx}deg)`,
                  opacity: opacity,
                  transformOrigin: `${0.5 * 100}% ${0.5 * 100}%`
                };

                const normalStyle = {
                  transform: `translatey(-${0.5 * 100}%) translatex(${-0.5 * 100}%) rotate(0deg)`,
                  opacity: 0,
                  transformOrigin: `${0.5 * 100}% ${0.5 * 100}%`
                };

                return (
                  <img
                    src={base64}
                    key={elIdx}
                    className={`demo-image -shadow-${elIdx}`}
                    style={useSpin ? shadowStyle : normalStyle}
                  />
                );
              })}
            </div>
          </div>

          <div className="column">
            <div className="demo-image-container-title">Visual Center</div>
            <div className="demo-image-container" style={{ backgroundColor: bgColorCode }}>
              <img
                src={base64}
                className="demo-image"
                style={{
                  transform: `translatey(-${resultTop * 100}%) translatex(${-resultLeft * 100}%)`
                }}
              />

              {new Array(32).fill("").map((el, elIdx, arr) => {
                const tot = arr.length * 3;

                const opacity = 0.05 + 0.3 * ((arr.length - elIdx) / arr.length);

                const shadowStyle = {
                  outline: "none",
                  transform: `translatey(-${resultTop * 100}%) translatex(${-resultLeft * 100}%) rotate(-${(360 / tot) *
                    elIdx}deg)`,
                  opacity: opacity,
                  transformOrigin: `${resultLeft * 100}% ${resultTop * 100}%`
                };

                const normalStyle = {
                  transform: `translatey(-${resultTop * 100}%) translatex(${-resultLeft * 100}%) rotate(0deg)`,
                  opacity: 0,
                  transformOrigin: `${resultLeft * 100}% ${resultTop * 100}%`
                };

                return (
                  <img
                    src={base64}
                    key={elIdx}
                    className={`demo-image -shadow-${elIdx}`}
                    style={useSpin ? shadowStyle : normalStyle}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="app-control-container">
          <label className="app-control">
            <input
              type="checkbox"
              checked={showGuides}
              onChange={() => {
                this.setState({ showGuides: !showGuides });
              }}
            />
            <div>Show guides</div>
          </label>

          <label className="app-control">
            <input
              type="checkbox"
              checked={useCircle}
              onChange={() => {
                this.setState({ useCircle: !useCircle });
              }}
            />
            <div>Make the canvas a circle</div>
          </label>

          <label className="app-control">
            <input
              type="checkbox"
              checked={useSpin}
              onChange={() => {
                this.setState({ useSpin: !useSpin });
              }}
            />
            <div>Rotation Shadows</div>
          </label>
        </div>

        {base64 && (
          <div className="padding-2 results">
            <div>{base64 && `The center is at ${toPercent(resultLeft)}% - ${toPercent(resultTop)}%`}</div>
            {recommendations.length ? (
              <div>
                {"You can visual center your image if you "}
                {_.map(recommendations, (rec, recIdx) => {
                  return <span key={recIdx}>{rec}</span>;
                })}
              </div>
            ) : (
              <div>Your image is perfectly centered! Congrats!</div>
            )}
            <div>
              <br />
              Interested in <strong>Sketch</strong> and <strong>Figma</strong> plugins?{" "}
              <a href="http://eepurl.com/b5_E-j" target="_blank">
                <strong>Join the newsletter!</strong>
              </a>
            </div>
          </div>
        )}

        <div className="credits padding-2">
          <div>
            Other experiments:{" "}
            <a href="http://javier.xyz/img2css">
              <b>img2css</b> (convert images to pure css)
            </a>
            ,{" "}
            <a href="http://javier.xyz/cohesive-colors">
              <b>cohesive-colors</b> (creates cohesive color palletes)
            </a>
            ,{" "}
            <a href="http://javier.xyz/morphin">
              <b>morphin</b> (css image morphing)
            </a>
            ,{" "}
            <a href="http://javier.xyz/clashjs/">
              <b>clashjs</b> (js ai battle game)
            </a>
            .
          </div>
          <br />
          <div>
            Created by{" "}
            <a href="http://javier.xyz/">
              <b>javierbyte</b>
            </a>
            .
          </div>
        </div>
      </div>
    );
  }
}

function normalizeColor(color) {
  return {
    r: Math.floor(color.r * (color.a / 255) + 255 * (1 - color.a / 255)),
    g: Math.floor(color.g * (color.a / 255) + 255 * (1 - color.a / 255)),
    b: Math.floor(color.b * (color.a / 255) + 255 * (1 - color.a / 255)),
    a: 255
  };
}

function toPercent(number) {
  return Math.round(number * 10000) / 100;
}

export default App;
