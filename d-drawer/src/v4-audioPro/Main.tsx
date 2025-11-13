import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { InstancedMesh, BufferGeometry, BoxGeometry, Matrix4 } from "three";
import { useControls } from "leva";
import { useAudioData } from "./useAudioData";

const totalNrPoints = 50000;
const radius = 200;

const instanceArgs = [new BoxGeometry(1, 1, 1), undefined, totalNrPoints];
const matrix = new Matrix4();
const { sin, tan, cos, cosh, sinh, tanh, PI, acos, asin } = Math;

const goldenRatio = (1 + Math.sqrt(5)) / 2;
const golderPi2 = 2 * PI * goldenRatio;
let og = 0;

const controls = {
  controlA: {
    value: 5,
    min: -500,
    max: 500,
    step: 0.1,
    editable: true,
  },
  controlB: {
    value: 50,
    min: 0,
    max: 50,
    step: 0.1,
    editable: true,
  },
  controlC: {
    value: 50,
    min: 0,
    max: 50,
    step: 0.1,
    editable: true,
  },
  ogInc: {
    value: 1,
    min: 1,
    max: 1000,
    step: 0.001,
    editable: true,
  },
};

const Main = () => {
  const meshRef = useRef<InstancedMesh<BufferGeometry> | any>();
  const paused = useRef(false);

  useEffect(() => {
    const ev = ({ key }: KeyboardEvent) =>
      key === " " && (paused.current = !paused.current);
    addEventListener("keydown", ev);
    return () => removeEventListener("keydown", ev);
  }, [paused.current]);

  const { controlA, controlB, controlC, ogInc } = useControls(controls);
  const { audioVars } = useAudioData("DowntownLA", false);

  const animate = useCallback(
    (i: number) => {
      const phi = acos(1 - (2 * (i + 0.5)) / totalNrPoints);
      const theta = golderPi2 * i * (og / ogInc);

      let x = radius * sin(phi) * cos(theta);
      let y = radius * cos(phi);
      let z = radius * sin(phi) * sin(theta);

      x += audioVars.low;
      const _x = x;
      const _y = y;
      const _z = z;

      y /=
        sinh(((_y + 1) * controlA) / totalNrPoints) -
        sin((i / totalNrPoints) * controlB) +
        cos((i / totalNrPoints) * controlB);

      x /=
        sinh(((_x + 1) * controlA) / totalNrPoints) -
        sin((i / totalNrPoints) * controlC) +
        cos((i / totalNrPoints) * controlC);

      z /=
        sinh(((_z + 1) * controlA) / totalNrPoints) -
        sin((i / totalNrPoints) * controlC) +
        cos((i / totalNrPoints) * controlC);

      /** V5: x stuf. Not sure if its any good tho */
      // x *= tanh((_y * controlA) / (_z * controlC));
      // y *= tanh((_z * controlA) / (_x * controlC));
      // z *= tanh((_x * controlA) / (_y * controlC));

      matrix.makeTranslation(x, y, z);
      meshRef.current.setMatrixAt(i, matrix);
    },
    [controlA, controlB, controlC, ogInc, meshRef.current, audioVars]
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
    if (paused.current === false) {
      og += 0.0001;
    }

    if (clock.elapsedTime === 0) {
      camera.position.set(
        27.93771499972516,
        296.7564658994582,
        258.0343295270578
      );
      camera.matrix.set(
        0.9986302147500634,
        2.6020852139652106e-18,
        -0.052322979542857216,
        0,
        -0.014529007841019695,
        0.9606738320457113,
        -0.27729892959361374,
        0,
        0.05026531726148601,
        0.27767929059007684,
        0.9593579152005751,
        0,
        54.77996543127063,
        354.9240327460401,
        620.4445858958193,
        1
      );
    }

    // camera.rotateX(og * 100);
    // camera.rotateY(sin(og) * 10);
    // camera.rotateZ(og * 100);

    (window as any).camera = camera;

    requestAnimationFrame(updateMesh);
  });

  return (
    <instancedMesh ref={meshRef} args={instanceArgs as any}>
      <meshStandardMaterial />
    </instancedMesh>
  );
};

export default Main;
