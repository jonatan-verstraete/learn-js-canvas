import { useCallback, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import {
  bufferSize,
  FREQUENCY_DIVISIONS,
  MAX_HEIGHT,
  TIME_SEGMENTS,
} from "../consts";

import {
  InstancedMesh,
  BufferGeometry,
  BoxGeometry,
  Matrix4,
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

let og = 0;

const { sin, tan, cos, cosh, tanh } = Math;

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

  useFrame(({ camera, clock }) => {
    if (clock.elapsedTime === 0) {
      camera.position.set(
        0.11623156003062385,
        283.83947846348923,
        239.98456319912282
      );
      camera.matrix.set(
        0.9999998827125761,
        2.710505431213761e-20,
        -0.0004843292620520871,
        0,
        -0.0003698506182358321,
        0.6456485765100815,
        -0.7636345846417812,
        0,
        0.0003127064986061083,
        0.7636346742065251,
        0.6456485007836232,
        0,
        0.11623156003062385,
        283.83947846348923,
        239.98456319912282,
        1
      );
    }
    if (paused.current) {
      console.log(camera.position.toArray(), camera.matrix.toArray());
    }
    if (analyzer && dataArray && !paused.current) {
      analyzer.getFloatFrequencyData(dataArray as any);

      // const { x, y, z } = camera.position;
      // camera.position.set(x, y, z);

      // camera.rotateZ(clock.elapsedTime / 10);

      requestAnimationFrame(updateMesh);

      og += 0.000001;
    }
  });

  const updateMesh = useCallback(() => {
    const audioData = Array.from(dataArray);
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
        let x = _x;
        let y = mapHeight(amplitude);
        let z = _z;
        const orgY = y;

        // x *= 1 + Math.tanh(x);
        // y *= 1 + Math.tanh(y);
        // z *= 1 + Math.tanh(z);

        // const s = [x, y, z];
        // z /= s[1] * Math.sin(x);
        // y /= s[0] * Math.cos(x);
        // x /= s[2] * Math.cos(x);

        // z *= 2;
        // x *= 2;
        // y *= 2;

        // z /= y;
        // y /= x * z;
        // x /= z;

        x *= Math.atan(sin(id / slice.length) / y);

        // Position each instance's base at y=0 and extend it upward by instanceHeight
        matrix.makeTranslation(x, y, z); // Center the geometry on y-axis
        // matrix.scale(new Vector3(1, z, 1));

        matrix.makeTranslation(x, orgY / 2, z); // Center the geometry on y-axis
        // matrix.scale(new Vector3(1, orgY, 1));

        meshRef.current.setMatrixAt(id, matrix);

        meshRef.current.setColorAt(
          id,
          new Color(`hsl(${(360 / MAX_HEIGHT) * Math.abs(y)}, 30%, 50%)`)
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
    audioElm.src = "./waves.mp3";

    audioElm.autoplay = true;
    audioElm.preload = "auto";
    const audioSourceNode = audioCtx.createMediaElementSource(audioElm);

    analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = FREQUENCY_DIVISIONS;
    dataArray = new Float32Array(analyzer.frequencyBinCount);

    audioSourceNode.connect(analyzer);
    analyzer.connect(audioCtx.destination);
    analyzer.smoothingTimeConstant = 0.99;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={instanceArgs as any}>
      <meshStandardMaterial />
    </instancedMesh>
  );
};

export default Main;
