import React, { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import dataPreset from "./data256Sketch7";

const FREQUENCY_DIVISIONS = 512;
const TIME_DIVISIONS = 200;

const MAX_HEIGHT = 20;

const bufferSize = FREQUENCY_DIVISIONS / 2;
let analyzer, dataArray, audioCtx;

function WaveformVisualizer() {
  const [frequencyData, setFrequencyData] = useState([]);

  //hamster the audio data
  useFrame(({ clock }) => {
    if (
      // skip first part n seconds of song
      clock.elapsedTime > 5 &&
      // make suer audio is setup
      analyzer &&
      dataArray &&
      // check to not overload
      frequencyData.length <= TIME_DIVISIONS
    ) {
      if (frequencyData.length === TIME_DIVISIONS) {
        audioCtx.suspend();
        analyzer = null;
        console.log({ frequencyData });
        return;
      }
      analyzer.getFloatFrequencyData(dataArray);
      const audioData = Array.from(dataArray);
      if (audioData[0] !== -Infinity) {
        setFrequencyData((prev) => [...prev, audioData]);
      }
    }
  });

  useEffect(() => {
    // setup audio

    audioCtx = new AudioContext();
    const audioElm = new Audio();
    audioElm.src = "./DowntownLA.mp3";
    audioElm.autoplay = true;
    audioElm.preload = "auto";
    const audioSourceNode = audioCtx.createMediaElementSource(audioElm);

    analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = FREQUENCY_DIVISIONS;
    dataArray = new Float32Array(analyzer.frequencyBinCount);

    audioSourceNode.connect(analyzer);
    analyzer.connect(audioCtx.destination);
  }, []);

  // normalize audio data for visualization
  const normalizedValues = useMemo(() => {
    if (frequencyData.length < TIME_DIVISIONS) {
      return;
    }

    /* cut of n% of the total frequency range */
    // ends wth shallow unused frequencies which shallow the average
    const sliceEndIndex = bufferSize - Math.floor(bufferSize * 0.14);
    // remove high values in the beginning
    const sliceStartIndex = Math.floor(bufferSize * 0.05);

    const slicedData = frequencyData
      .slice(TIME_DIVISIONS * 0.1, TIME_DIVISIONS)
      .map((range) => range.slice(sliceStartIndex, sliceEndIndex));

    /* get highest and lowest amp for normalization */
    const allValues = slicedData.flat(2);
    let lowest = Infinity;
    let highest = -Infinity;
    for (const i of allValues) {
      if (i < lowest) lowest = i;
      if (i > highest) highest = i;
    }
    const mapNum = THREE.MathUtils.mapLinear;

    /* normalize values */
    const normalizedData = [];
    const m2 = FREQUENCY_DIVISIONS / 4;
    slicedData.forEach((slice, z) => {
      const newSlice = [];
      slice.forEach((amplitude, x) => {
        newSlice.push([
          x - m2, //
          mapNum(amplitude, lowest, highest, 0, MAX_HEIGHT), //
          z - m2 / 2, //
        ]);
      });
      normalizedData.push(newSlice);
    });

    // TODO: export this data?
    return normalizedData;
  }, [frequencyData]);

  return (
    <>
      {normalizedValues?.map((slice) =>
        slice.map(([x, y, z]) => (
          <mesh key={`${x}-${z}`} position={[x, y, z]}>
            <boxGeometry args={[1, y, 1]} />
            <meshStandardMaterial
              color={`hsl(${(
                (360 / MAX_HEIGHT) *
                y
              ).toFixed()}, 100%, ${Math.floor(10 + (40 / MAX_HEIGHT) * y)}%)`}

              // color="red"
              // transparent
              // opacity={0.1}
            />
          </mesh>
        ))
      )}
    </>
  );
}

export default WaveformVisualizer;
