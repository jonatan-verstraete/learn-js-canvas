import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import dataPreset from "./data/data256Sketch";

import {
  FREQUENCY_DIVISIONS,
  TIME_SEGMENTS,
  MAX_HEIGHT,
  bufferSize,
} from "./consts";

let analyzer: AnalyserNode | null,
  dataArray: Float32Array,
  audioCtx: AudioContext | null;

export const useAudioData = (usePreset = true) => {
  const [frequencyData, setFrequencyData] = useState<RawAudioData>([]);

  useFrame(({ clock }) => {
    if (
      clock.elapsedTime > 5 &&
      analyzer &&
      dataArray &&
      frequencyData.length <= TIME_SEGMENTS
    ) {
      if (frequencyData.length === TIME_SEGMENTS) {
        audioCtx?.suspend();
        analyzer = null;
        console.log({ frequencyData });
        return;
      }
      analyzer.getFloatFrequencyData(dataArray as any);
      const audioData = Array.from(dataArray);
      if (audioData[0] !== -Infinity) {
        setFrequencyData((prev) => prev.concat([audioData]));
      }
    }
  });

  useEffect(() => {
    if (usePreset) {
      return setFrequencyData(dataPreset);
    }
    audioCtx = new AudioContext();
    const audioElm = new Audio();
    audioElm.src = "./sketch7.mp3";
    audioElm.autoplay = true;
    audioElm.preload = "auto";
    const audioSourceNode = audioCtx.createMediaElementSource(audioElm);

    analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = FREQUENCY_DIVISIONS;
    dataArray = new Float32Array(analyzer.frequencyBinCount);

    console.log({ audioCtx });

    audioSourceNode.connect(analyzer);
    analyzer.connect(audioCtx.destination);
  }, []);

  const normalizedValues = useMemo(() => {
    if (frequencyData.length < TIME_SEGMENTS) {
      return;
    }

    console.log({ frequencyData });

    // the end and beginning are for some reason very loud or silent so remove the edges
    const sliceEndIndex = bufferSize - Math.floor(bufferSize * 0.14);
    const sliceStartIndex = Math.floor(bufferSize * 0.05);
    const slicedData = frequencyData
      // certain frequencies (like 20hz) are not really used, and fuck up the normalization
      .slice(TIME_SEGMENTS * 0.1, TIME_SEGMENTS)
      .map((range) => range.slice(sliceStartIndex, sliceEndIndex));

    let lowest = Infinity;
    let highest = -Infinity;
    for (const i of slicedData.flat()) {
      if (i < lowest) lowest = i;
      if (i > highest) highest = i;
    }
    const mapHeight = (z: number) =>
      THREE.MathUtils.mapLinear(z, lowest, highest, 0, MAX_HEIGHT);

    const normalizedData = slicedData.map((slice, z) =>
      slice.map((amplitude, x) => [
        // centralize x
        x - FREQUENCY_DIVISIONS / 4,
        // scale y
        mapHeight(amplitude),
        // centralize z
        z - TIME_SEGMENTS / 2,
      ])
    );

    console.log({ normalizedData });

    return normalizedData as FlatAudioDataArray;
  }, [frequencyData]);

  return { normalizedValues, audioCtx, frequencyData, analyzer };
};
