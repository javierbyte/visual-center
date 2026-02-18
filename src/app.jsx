import { Fragment, useState, useEffect } from 'react';

import { compact, map } from 'lodash';

import visualCenter from './visualCenter.js';
import demoImage from './assets/demo.js';
import { downloadCenteredImage } from './lib/imglib.js';

import {
  MainHeader,
  Text,
  Space,
  Container,
  Dropzone,
  Checkbox,
  Inline,
  A,
  Ul,
  Li,
  HeaderH3,
  HeaderH4,
  Button,
  Box,
} from 'jbx';

const ROTATION_BLADES = 24 * 1;
const TOTAL_BLADES_MULTIPLIER = 3;

function Card({ children }) {
  return (
    <div className="jbx-card">
      <Box padding={1}>{children}</Box>
    </div>
  );
}

function onFileSelected(callback, evt) {
  if (evt.target.files && evt.target.files[0]) {
    const FR = new FileReader();
    FR.addEventListener(
      'load',
      function (e) {
        callback(e.target.result);
      },
      false
    );
    FR.readAsDataURL(evt.target.files[0]);
  }
}

function GetRecommendation({ resultLeft, resultTop }) {
  const recommendations = compact([
    resultLeft > 0.5 && (
      <span>
        move it left <strong>{toPercent(resultLeft - 0.5)}%</strong>
      </span>
    ),
    resultLeft < 0.5 && (
      <span>
        move it right <strong>{toPercent(1 - resultLeft - 0.5)}%</strong>
      </span>
    ),
    resultLeft !== 0.5 && resultTop !== 0.5 && <span> and </span>,
    resultTop > 0.5 && (
      <span>
        move it up <strong>{toPercent(resultTop - 0.5)}%</strong>
      </span>
    ),
    resultTop < 0.5 && (
      <span>
        move it down <strong>{toPercent(1 - resultTop - 0.5)}%</strong>
      </span>
    ),
  ]);

  return (
    <Fragment>
      <Text>
        {'The center is at '}
        <strong>{`${toPercent(resultLeft)}%, ${toPercent(resultTop)}%`}</strong>
      </Text>
      <Space h={0.25} />
      {recommendations.length ? (
        <Text>
          {'You can visual center your image if you '}
          {map(recommendations, (rec, recIdx) => {
            return <span key={recIdx}>{rec}</span>;
          })}
        </Text>
      ) : (
        <Text style={{ color: '#27AE60' }}>
          Your image is perfectly centered! Congrats!
        </Text>
      )}
    </Fragment>
  );
}

function App() {
  const [imgSrc, imgSrcSet] = useState(null);

  const [showGuides, showGuidesSet] = useState(true);
  const [useCircleCanvas, useCircleCanvasSet] = useState(true);
  const [isShadowRotation, isShadowRotationSet] = useState(false);

  const [resultTop, resultTopSet] = useState(0.6666);
  const [resultLeft, resultLeftSet] = useState(0.5);

  const [detectedBgcolor, detectedBgcolorSet] = useState('#fff');

  useEffect(() => {
    console.info('Calculating.');

    visualCenter(imgSrc, (err, result) => {
      const { visualTop, visualLeft, bgColor } = result;

      resultTopSet(visualTop);
      resultLeftSet(visualLeft);
      detectedBgcolorSet(`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);

      console.info(`Calculated`, { ...result });
    });
  }, [imgSrc]);

  return (
    <Container>
      <MainHeader>Visual Center</MainHeader>
      <Space h={1} />
      <Text>Find the visual center of your images.</Text>

      <div
        className={`demo-image-comparison ${showGuides ? '-show-guides' : ''} ${
          useCircleCanvas ? '-use-circle' : ''
        } ${isShadowRotation ? '-use-spin' : ''}`}
      >
        <div className="column">
          <div className="txt-center">
            <HeaderH4>Original</HeaderH4>
          </div>
          <Space h={1} />
          <div
            className="demo-image-container"
            style={{ backgroundColor: detectedBgcolor }}
          >
            <img
              alt=""
              src={imgSrc || demoImage}
              style={{
                transform: `translatey(-50%) translatex(-50%)`,
              }}
              className="demo-image"
            />

            {new Array(ROTATION_BLADES).fill('').map((el, elIdx, arr) => {
              const tot = arr.length * TOTAL_BLADES_MULTIPLIER;

              const opacity = 0.1 + 0.3 * ((arr.length - elIdx) / arr.length);

              const shadowStyle = {
                outline: 'none',
                transform: `translatey(-${0.5 * 100}%) translatex(${
                  -0.5 * 100
                }%) rotate(-${(360 / tot) * elIdx}deg)`,
                opacity: opacity,
                transformOrigin: `${0.5 * 100}% ${0.5 * 100}%`,
              };

              const normalStyle = {
                transform: `translatey(-${0.5 * 100}%) translatex(${
                  -0.5 * 100
                }%) rotate(0deg)`,
                opacity: 0,
                transformOrigin: `${0.5 * 100}% ${0.5 * 100}%`,
              };

              return (
                <img
                  alt=""
                  src={imgSrc || demoImage}
                  key={elIdx}
                  className={`demo-image -shadow-${elIdx}`}
                  style={isShadowRotation ? shadowStyle : normalStyle}
                />
              );
            })}
          </div>
        </div>

        <div className="column">
          <div className="txt-center">
            <HeaderH4>Visual Center</HeaderH4>
          </div>
          <Space h={1} />
          <div
            className="demo-image-container"
            style={{ backgroundColor: detectedBgcolor }}
          >
            <img
              alt=""
              src={imgSrc || demoImage}
              className="demo-image"
              style={{
                transform: `translatey(${-resultTop * 100}%) translatex(${
                  -resultLeft * 100
                }%)`,
              }}
            />

            {new Array(ROTATION_BLADES + 2).fill('').map((el, elIdx, arr) => {
              const tot = arr.length * TOTAL_BLADES_MULTIPLIER;

              const opacity = 0.05 + 0.3 * ((arr.length - elIdx) / arr.length);

              const shadowStyle = {
                outline: 'none',
                transform: `translatey(-${resultTop * 100}%) translatex(${
                  -resultLeft * 100
                }%) rotate(-${(360 / tot) * elIdx}deg)`,
                opacity: opacity,
                transformOrigin: `${resultLeft * 100}% ${resultTop * 100}%`,
              };

              const normalStyle = {
                transform: `translatey(-${resultTop * 100}%) translatex(${
                  -resultLeft * 100
                }%) rotate(0deg)`,
                opacity: 0,
                transformOrigin: `${resultLeft * 100}% ${resultTop * 100}%`,
              };

              return (
                <img
                  alt=""
                  src={imgSrc || demoImage}
                  key={elIdx}
                  className={`demo-image -shadow-${elIdx}`}
                  style={isShadowRotation ? shadowStyle : normalStyle}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="txt-center">
        <Button
          onClick={() =>
            downloadCenteredImage(imgSrc || demoImage, {
              x: resultLeft,
              y: resultTop,
            })
          }
        >
          Download
        </Button>
      </div>

      <Space h={1} />

      <Inline style={{ gap: 16 }}>
        <Checkbox
          checked={showGuides}
          onChange={showGuidesSet}
          label="Show guides"
        />
        <Checkbox
          checked={useCircleCanvas}
          onChange={useCircleCanvasSet}
          label="Use circle canvas"
        />
        <Checkbox
          checked={isShadowRotation}
          onChange={isShadowRotationSet}
          label="Rotation shadows"
        />
      </Inline>

      <Space h={2} />

      <Card>
        <Dropzone
          style={{ height: 64 }}
          onDrop={onFileSelected.bind(this, imgSrcSet)}
        >
          <Text>Click or drop your own image here</Text>
          <input
            type="file"
            onChange={onFileSelected.bind(this, imgSrcSet)}
            accept="image/*"
            aria-label="Drop an image here, or click to select"
          />
        </Dropzone>
        <Space h={1} />
        <GetRecommendation resultLeft={resultLeft} resultTop={resultTop} />
      </Card>

      <Space h={1} />

      <HeaderH3>Explanation</HeaderH3>
      <Space h={0.5} />
      <Text>
        The <strong>original</strong> image has its bounding box centered in the
        container. This works for most images but when there is a heavy balance
        on one side the image can feel unbalanced. The{' '}
        <strong>visual center</strong> image has added padding so the{' '}
        <i>weight</i> of the pixels is distributed equally in both axis. This
        makes some images look more centered and rotate better.
      </Text>

      <Space h={2} />

      <HeaderH3>How does it work?</HeaderH3>
      <Space h={0.5} />
      <Text>
        This algorithm works by first assigning a <i>color difference value</i>{' '}
        to each pixel as the difference between its color and the detected
        background color. 0 is the same color, 1 is the most different color.
        The weight of each pixel is calculated as the square of the distance of
        this pixel to a given coordinate multiplied by its color difference
        value. The visual center is the coordinate where the total weight on
        each side of both axis is equal.
      </Text>

      <Space h={2} />

      <Text>More experiments</Text>
      <Space h={0.5} />
      <Text>
        <Ul>
          <Li>
            <A href="https://javier.xyz/img2css/">img2css</A>, tool that can
            convert any image into a pure css image.
          </Li>
          <Li>
            <A href="https://javier.xyz/droste-creator/">Droste Creator</A>,
            Create recursive images with the droste effect.
          </Li>
          <Li>
            <A href="https://javier.xyz/pintr/">PINTR</A>, tool that turns your
            images into plotter-like line drawings.
          </Li>
          <Li>
            <A href="https://clashjs.com/">clashjs</A>, JS AI Battle Game.
          </Li>
        </Ul>
      </Text>

      <Space h={2} />
      <Text>
        Made by <A href="https://javier.xyz">javierbyte</A>.
      </Text>
    </Container>
  );
}

function toPercent(number) {
  return Math.round(number * 10000) / 100;
}

export default App;
