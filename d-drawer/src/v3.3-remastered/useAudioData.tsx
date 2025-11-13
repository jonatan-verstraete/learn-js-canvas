import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const FREQUENCY_DIVISIONS = 512 * 4;
export const bufferSize = FREQUENCY_DIVISIONS / 2;

let analyzer: AnalyserNode | null,
  dataArray: Float32Array,
  audioCtx: AudioContext | null;

export const useAudioData = (fileName: string) => {
  const [frequencyData, setFrequencyData] = useState<number[]>([]);

  useFrame(() => {
    if (analyzer && dataArray) {
      analyzer.getFloatFrequencyData(dataArray as any);
      const audioData = Array.from(dataArray);
      if (audioData[0] !== -Infinity) {
        setFrequencyData(audioData);
      }
    }
  });

  useEffect(() => {
    audioCtx = new AudioContext();
    const audioElm = new Audio();
    audioElm.src = `./${fileName}.mp3`;
    audioElm.autoplay = true;
    audioElm.preload = "auto";
    const audioSourceNode = audioCtx.createMediaElementSource(audioElm);

    analyzer = audioCtx.createAnalyser();

    analyzer.smoothingTimeConstant = 0.9;
    analyzer.channelCountMode = "max";

    analyzer.fftSize = FREQUENCY_DIVISIONS;
    dataArray = new Float32Array(analyzer.frequencyBinCount);

    audioSourceNode.connect(analyzer);
    analyzer.connect(audioCtx.destination);
  }, []);

  const audioVars = useMemo(() => {
    const getRange = (a: number, b: number) =>
      Math.round(
        frequencyData.slice(a, b).reduce((i, t) => t + i, 0) / (a + b)
      );

    return {
      low: getRange(0, FREQUENCY_DIVISIONS * 0.1),
    };
  }, [frequencyData]);

  return { audioCtx, frequencyData, analyzer, audioVars };
};
