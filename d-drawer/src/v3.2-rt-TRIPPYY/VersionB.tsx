import { useCallback, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import {
  bufferSize,
  centerX,
  centerZ,
  FREQUENCY_DIVISIONS,
  MAX_HEIGHT,
  TIME_SEGMENTS,
} from "./consts";

import {
  InstancedMesh,
  BufferGeometry,
  SphereGeometry,
  Matrix4,
  Vector3,
  Color,
} from "three";

let analyzer: AnalyserNode | null,
  dataArray: Float32Array,
  audioCtx: AudioContext | null;

const mapHeight = (n: number) => ((Math.abs(n) - 40) * MAX_HEIGHT) / (180 - 40);
const sphereGeometry = new SphereGeometry(10, bufferSize, bufferSize);
const instanceArgs = [sphereGeometry, undefined, TIME_SEGMENTS * bufferSize];

const matrix = new Matrix4();

const sphericalPos = new Vector3();
const mapToSphere = (
  amplitude: number,
  x: number,
  z: number,
  radius: number
) => {
  const theta = (x / (bufferSize - 1)) * Math.PI * 2; // 0 to 2π
  const phi = (z / (TIME_SEGMENTS - 1)) * Math.PI; // 0 to π

  // Convert spherical coordinates to Cartesian
  sphericalPos.setFromSphericalCoords(radius, phi, theta);
  sphericalPos.y += mapHeight(amplitude); // Adjust height based on amplitude
  return sphericalPos;
};

const Main = () => {
  const meshRef = useRef<InstancedMesh<BufferGeometry> | any>();
  const paused = useRef(false);

  const frequencyData = useRef<number[][]>(
    Array(TIME_SEGMENTS).fill(Array(bufferSize).fill(-160))
  );

  useFrame(({ camera, clock }) => {
    if (clock.elapsedTime === 0) {
      camera.position.set(
        -0.0000028260714923699246,
        155.41339581894772,
        -0.00015538769874064366
      );
      camera.rotation.set(
        -1.57079732662955,
        -1.8184220717740174e-8,
        -3.1234074305707247
      );
      camera.matrix.set(
        -0.9998332629923983,
        0,
        0.018260509685515264,
        0,
        0.018260509685506132,
        0.000001000044448695725,
        0.9998332629918981,
        0,
        -1.8261321347440296e-8,
        0.9999999999995003,
        -9.99877704854768e-7,
        0,
        -0.0000029874252247643778,
        163.59304823047043,
        -0.00016357304159977958,
        1
      );
    }

    if (analyzer && dataArray && !paused.current) {
      analyzer.getFloatFrequencyData(dataArray as any);
      requestAnimationFrame(updateMesh);
      // (window as any).camera = camera;
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

    // TODO: mapToSphere break PC completely...
    return;

    let id = 0;
    frequencyData.current.forEach((slice, _z) =>
      slice.forEach((amplitude, _x) => {
        const position = mapToSphere(
          amplitude,
          _x,
          _z,
          sphereGeometry.parameters.radius
        );

        matrix.makeTranslation(position.x, position.y, position.z);
        meshRef.current.setMatrixAt(id, matrix);

        meshRef.current.setColorAt(
          id,
          new Color(
            `hsl(${(270 / MAX_HEIGHT) * mapHeight(amplitude)}, 50%, 50%)`
          )
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
  }, []);

  return (
    <instancedMesh ref={meshRef} args={instanceArgs as any}>
      <meshStandardMaterial />
    </instancedMesh>
  );
};

export default Main;
