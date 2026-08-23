'use client';

import { Fragment, useEffect, useRef, useState } from 'react';

import { compact, map } from 'lodash';

import visualCenter from '../visualCenter.js';
import demoImage from '../assets/demo.js';
import { downloadCenteredImage } from '../lib/imglib';

import {
  Text,
  Space,
  Dropzone,
  Checkbox,
  Inline,
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

const DEMO_SOURCE = {
  src: demoImage,
  name: 'visual-center-demo.png',
  mimeType: 'image/png',
  svgText: null,
};

function getSelectedFile(evt) {
  return evt.target.files?.[0] || evt.dataTransfer?.files?.[0] || null;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(reader.result), {
      once: true,
    });
    reader.addEventListener(
      'error',
      () => reject(new Error('The selected file could not be read.')),
      { once: true }
    );
    reader.readAsDataURL(file);
  });
}

function isSvgFile(file) {
  return (
    file.type.toLowerCase().split(';')[0] === 'image/svg+xml' ||
    file.name.toLowerCase().endsWith('.svg')
  );
}

function getDownloadFilename(source) {
  const stem = source.name.replace(/\.[^.]*$/, '') || 'image';
  const extension =
    source.mimeType.toLowerCase().split(';')[0] === 'image/svg+xml' ||
    source.name.toLowerCase().endsWith('.svg')
      ? 'svg'
      : 'png';

  return `${stem}-centered.${extension}`;
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

export default function VisualCenterApp() {
  const [source, sourceSet] = useState(DEMO_SOURCE);

  const [showGuides, showGuidesSet] = useState(true);
  const [useCircleCanvas, useCircleCanvasSet] = useState(true);
  const [isShadowRotation, isShadowRotationSet] = useState(false);

  const [resultTop, resultTopSet] = useState(null);
  const [resultLeft, resultLeftSet] = useState(null);

  const [detectedBgcolor, detectedBgcolorSet] = useState('#fff');
  const [isReading, isReadingSet] = useState(false);
  const [isAnalyzing, isAnalyzingSet] = useState(true);
  const [isExporting, isExportingSet] = useState(false);
  const [analysisError, analysisErrorSet] = useState(null);
  const [downloadError, downloadErrorSet] = useState(null);
  const selectionIdRef = useRef(0);
  const analysisIdRef = useRef(0);

  const displayTop = resultTop ?? 0.5;
  const displayLeft = resultLeft ?? 0.5;
  const downloadDisabled =
    isReading ||
    isAnalyzing ||
    isExporting ||
    Boolean(analysisError) ||
    resultTop === null ||
    resultLeft === null;

  useEffect(() => {
    const analysisId = ++analysisIdRef.current;
    console.info('Calculating.');
    isAnalyzingSet(true);
    analysisErrorSet(null);
    downloadErrorSet(null);
    resultTopSet(null);
    resultLeftSet(null);

    try {
      visualCenter(source.src, (err, result) => {
        if (analysisId !== analysisIdRef.current) return;

        if (err || !result) {
          analysisErrorSet('This image could not be analyzed.');
          isAnalyzingSet(false);
          return;
        }

        const { visualTop, visualLeft, bgColor } = result;

        resultTopSet(visualTop);
        resultLeftSet(visualLeft);
        detectedBgcolorSet(`rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);
        isAnalyzingSet(false);

        console.info(`Calculated`, { ...result });
      });
    } catch (error) {
      if (analysisId === analysisIdRef.current) {
        console.error(error);
        analysisErrorSet('This image could not be analyzed.');
        isAnalyzingSet(false);
      }
    }

    return () => {
      if (analysisId === analysisIdRef.current) {
        analysisIdRef.current += 1;
      }
    };
  }, [source]);

  async function onFileSelected(evt) {
    evt.preventDefault();
    const file = getSelectedFile(evt);
    if (!file) return;

    const selectionId = ++selectionIdRef.current;
    analysisIdRef.current += 1;
    isReadingSet(true);
    isAnalyzingSet(false);
    analysisErrorSet(null);
    downloadErrorSet(null);
    resultTopSet(null);
    resultLeftSet(null);

    try {
      const svgInput = isSvgFile(file);
      const [src, svgText] = await Promise.all([
        readFileAsDataUrl(file),
        svgInput ? file.text() : Promise.resolve(null),
      ]);

      if (selectionId !== selectionIdRef.current) return;

      isAnalyzingSet(true);
      sourceSet({
        src,
        name: file.name || 'image',
        mimeType: svgInput ? 'image/svg+xml' : file.type,
        svgText,
      });
    } catch (error) {
      if (selectionId === selectionIdRef.current) {
        console.error(error);
        analysisErrorSet('This image could not be read.');
        isAnalyzingSet(false);
      }
    } finally {
      if (selectionId === selectionIdRef.current) {
        isReadingSet(false);
      }
    }
  }

  async function onDownload() {
    if (downloadDisabled) return;

    isExportingSet(true);
    downloadErrorSet(null);

    try {
      await downloadCenteredImage(
        source.src,
        { x: resultLeft, y: resultTop },
        {
          filename: getDownloadFilename(source),
          mimeType: source.mimeType,
          svgText: source.svgText,
        }
      );
    } catch (error) {
      console.error(error);
      downloadErrorSet('The corrected image could not be created.');
    } finally {
      isExportingSet(false);
    }
  }

  return (
    <Fragment>
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
              src={source.src}
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
                  src={source.src}
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
              src={source.src}
              className="demo-image"
              style={{
                transform: `translatey(${-displayTop * 100}%) translatex(${
                  -displayLeft * 100
                }%)`,
              }}
            />

            {new Array(ROTATION_BLADES + 2).fill('').map((el, elIdx, arr) => {
              const tot = arr.length * TOTAL_BLADES_MULTIPLIER;

              const opacity = 0.05 + 0.3 * ((arr.length - elIdx) / arr.length);

              const shadowStyle = {
                outline: 'none',
                transform: `translatey(-${displayTop * 100}%) translatex(${
                  -displayLeft * 100
                }%) rotate(-${(360 / tot) * elIdx}deg)`,
                opacity: opacity,
                transformOrigin: `${displayLeft * 100}% ${displayTop * 100}%`,
              };

              const normalStyle = {
                transform: `translatey(-${displayTop * 100}%) translatex(${
                  -displayLeft * 100
                }%) rotate(0deg)`,
                opacity: 0,
                transformOrigin: `${displayLeft * 100}% ${displayTop * 100}%`,
              };

              return (
                <img
                  alt=""
                  src={source.src}
                  key={elIdx}
                  className={`demo-image -shadow-${elIdx}`}
                  style={isShadowRotation ? shadowStyle : normalStyle}
                />
              );
            })}
          </div>
        </div>
      </div>

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
          onDragOver={(evt) => evt.preventDefault()}
          onDrop={onFileSelected}
        >
          <Text>Click or drop your own image here</Text>
          <input
            type="file"
            onChange={onFileSelected}
            accept="image/*"
            aria-label="Drop an image here, or click to select"
          />
        </Dropzone>
        <Space h={1} />
        {isReading || isAnalyzing ? (
          <Text>Calculating visual center...</Text>
        ) : analysisError ? (
          <Text role="alert" style={{ color: '#c0392b' }}>
            {analysisError}
          </Text>
        ) : (
          <GetRecommendation resultLeft={resultLeft} resultTop={resultTop} />
        )}
        {downloadError && (
          <Fragment>
            <Space h={0.5} />
            <Text role="alert" style={{ color: '#c0392b' }}>
              {downloadError}
            </Text>
          </Fragment>
        )}
        <Space h={1} />
        <Button type="button" disabled={downloadDisabled} onClick={onDownload}>
          {isExporting ? 'Preparing download...' : 'Download'}
        </Button>
      </Card>
    </Fragment>
  );
}

function toPercent(number) {
  return Math.round(number * 10000) / 100;
}
