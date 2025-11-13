import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import {
  InstancedMesh,
  BufferGeometry,
  BoxGeometry,
  Matrix4,
  Vector3,
} from "three";

import { useAudioData, bufferSize } from "./useAudioData";

const totalNrPoints = bufferSize;

const instanceArgs = [new BoxGeometry(1, 1, 1), undefined, totalNrPoints];
const matrix = new Matrix4();


const Main = () => {
  const meshRef = useRef<InstancedMesh<BufferGeometry> | any>();
  const paused = useRef(false);

  useEffect(() => {
    const ev = ({ key }: KeyboardEvent) =>
      key === " " && (paused.current = !paused.current);
    addEventListener("keydown", ev);
    return () => removeEventListener("keydown", ev);
  }, [paused.current]);

  const { audioVars, frequencyData } = useAudioData("DowntownLA", false);

  const animate = useCallback(
    (i: number) => {
      const x = totalNrPoints / 1.5 - i;
      const y = -frequencyData[i] * 2;
      const z = 1;

      matrix.makeTranslation(x, y / 2, z);
      matrix.scale(new Vector3(1, y, 1));

      meshRef.current.setMatrixAt(i, matrix);
    },
    [frequencyData, meshRef.current, audioVars]
  );

  const updateMesh = useCallback(() => {
    if (meshRef.current) {
      for (let i = 0; i < totalNrPoints; i++) {
        animate(i);
      }

      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [meshRef.current, animate]);

  useFrame(({ camera, clock }) => {
    requestAnimationFrame(updateMesh);
  });

  return (
    <instancedMesh ref={meshRef} args={instanceArgs as any}>
      <meshStandardMaterial />
    </instancedMesh>
  );
};

export default Main;
