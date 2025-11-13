import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// import dataPreset from "./data/data256Sketch";
import dataPreset from "./data/data512Sketch";

import {
  FREQUENCY_DIVISIONS,
  TIME_SEGMENTS,
  MAX_HEIGHT,
  bufferSize,
} from "./consts";

const REPLAY = (dataArray: RawAudioData) => {
  let lowest = Infinity;
  let highest = -Infinity;
  for (const i of dataArray.flat()) {
    if (i < lowest) lowest = i;
    if (i > highest) highest = i;
  }

  const mapHeight = (z: number) =>
    THREE.MathUtils.mapLinear(z, lowest, highest, -1, 1);

  // Create a new AudioContext for playback
  const audioCtx = new AudioContext();
  const sampleRate = audioCtx.sampleRate;

  // Calculate total duration based on number off segments and sample rate
  const durationInSeconds = dataArray.length / sampleRate;
  const buffer = audioCtx.createBuffer(
    1, // Mono output
    // sampleRate * durationInSeconds,
    190000,
    sampleRate
  );

  const outputData = buffer.getChannelData(0); // Access left channel only

  // Flatten the frequency data into the buffer, segment by segment
  let id = 0;
  dataArray.forEach((segment, segmentIndex) => {
    const startIndex = segmentIndex * segment.length;
    segment.forEach((sample, sampleIndex) => {
      // Set audio data in buffer, with each segment offset by startIndex
      outputData[id++] = mapHeight(sample);
    });
  });

  // Create a buffer source to play the audio
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);

  // Start playback
  source.start();

  // let duration = 0.1;
  // let startFrequency = 420;
  // let endFrequency = 620;

  // const audioCtx = new AudioContext();
  // const sampleRate = audioCtx.sampleRate;
  // const numSamples = sampleRate * duration;

  // // Create a buffer with one channel
  // const buffer = audioCtx.createBuffer(1, numSamples, sampleRate);
  // const channelData = buffer.getChannelData(0);

  // // Calculate the frequency change per sample (linear frequency modulation)
  // const frequencyDifference = endFrequency - startFrequency;
  // const frequencyIncrement = frequencyDifference / numSamples; // Linearly increasing frequency

  // // Fill the buffer with sine wave data, modulating the frequency
  // for (let i = 0; i < numSamples; i++) {
  //   // Calculate the frequency at this specific time/sample
  //   const time = i / sampleRate; // Time in seconds
  //   const currentFrequency = startFrequency + frequencyIncrement * i; // Modulate frequency

  //   // Generate the sine wave with the modulated frequency
  //   channelData[i] = Math.sin(2 * Math.PI * currentFrequency * time);
  // }

  // console.log(channelData);

  // // Play the buffer
  // const source = audioCtx.createBufferSource();
  // source.buffer = buffer;
  // source.connect(audioCtx.destination);
  // source.start();
};

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

    REPLAY(frequencyData);

    return;

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
