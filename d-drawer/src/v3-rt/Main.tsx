import { useCallback, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import {
  bufferSize,
  centerX,
  centerZ,
  FREQUENCY_DIVISIONS,
  H2,
  MAX_HEIGHT,
  TIME_SEGMENTS,
} from "./consts";

import {
  InstancedMesh,
  BufferGeometry,
  BoxGeometry,
  Matrix4,
  MathUtils,
  Vector3,
  Color,
} from "three";

let analyzer: AnalyserNode | null,
  dataArray: Float32Array,
  audioCtx: AudioContext | null;

// const mapNum = (n, minInput, maxInput, minOutput, maxOutput) => ((n - minInput) * (maxOutput - minOutput)) / (maxInput - minInput) + minOutput
const mapHeight = (n: number) => ((Math.abs(n) - 40) * MAX_HEIGHT) / (180 - 40);

const instanceArgs = [
  new BoxGeometry(1, 1, 1),
  undefined,
  TIME_SEGMENTS * bufferSize,
];

const matrix = new Matrix4();

const Main = () => {
  const meshRef = useRef<InstancedMesh<BufferGeometry> | any>();
  const paused = useRef(false);

  const frequencyData = useRef<number[][]>(
    Array(TIME_SEGMENTS).fill(Array(bufferSize).fill(-160))
  );

  useEffect(() => {
    const ev = ({ key }: KeyboardEvent) => {
      if (key === " ") {
        paused.current = !paused.current;
        paused.current ? audioCtx?.suspend() : audioCtx?.resume();
      }
    };

    document.addEventListener("keydown", ev);

    return () => document.removeEventListener("keydown", ev);
  }, []);

  useFrame(() => {
    if (analyzer && dataArray && !paused.current) {
      analyzer.getFloatFrequencyData(dataArray as any);
      requestAnimationFrame(updateMesh);
    }
  });

  const updateMesh = useCallback(() => {
    const audioData = Array.from(dataArray);

    // let low = Infinity;
    // let high = -Infinity;
    // for (let amplitude of audioData) {
    //   if (amplitude < low) {
    //     low = amplitude;
    //   }
    //   if (amplitude > high) {
    //     high = amplitude;
    //   }
    // }

    if (!Number.isFinite(audioData[0])) {
      return;
    }

    // move all rows backwards to create the illusion of movement
    const copy = Array(TIME_SEGMENTS);
    frequencyData.current.forEach((i, idx) => {
      if (idx + 1 < TIME_SEGMENTS) {
        copy[idx + 1] = i;
      }
    });
    copy[0] = audioData;
    frequencyData.current = copy;

    let id = 0;
    frequencyData.current.forEach((slice, _z) =>
      slice.forEach((amplitude, _x) => {
        const x = _x - centerX;
        const y = mapHeight(amplitude);
        const z = _z - centerZ;

        // Position each instance's base at y=0 and extend it upward by instanceHeight
        matrix.makeTranslation(x, y / 2, z); // Center the geometry on y-axis
        matrix.scale(new Vector3(1, y, 1)); // Scale on y-axis only

        meshRef.current.setMatrixAt(id, matrix);

        meshRef.current.setColorAt(
          id,
          new Color(`hsl(${(270 / MAX_HEIGHT) * y}, 50%, 50%)`)
        );
        id++;
      })
    );

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor.needsUpdate = true;
  }, [frequencyData.current, meshRef.current, paused.current, dataArray]);

  useEffect(() => {
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

  return (
    <instancedMesh ref={meshRef} args={instanceArgs as any}>
      <meshStandardMaterial />
    </instancedMesh>
  );
};

export default Main;
