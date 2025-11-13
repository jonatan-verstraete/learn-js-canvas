import { Fragment, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Box, OrbitControls, Sphere } from "@react-three/drei";
import { Vector3 } from "three";

import { MAX_HEIGHT, TIME_SEGMENTS } from "./consts";

// import Main from "./AudioOnly";
// import Main from "./VersionC";
// import Main from "./VersionB";
import Main from "./versions/VersionC copy 3";
// import Main from "./versions/VersionC copy 5";

import "./styles.css";

const limit = (
  (window.performance as any).memory.jsHeapSizeLimit / 100
).toFixed();

const StatsCustom = () => {
  const [c, setC] = useState<number>(0);

  useEffect(() => {
    setInterval(() => {
      setC(
        +((window.performance as any).memory.totalJSHeapSize / 100).toFixed()
      );
    }, 500);
  }, []);

  return (
    <div id="heap-stats">
      <p>max: {limit}</p>
      <p>size: {c ?? "-"}</p>
      <p>voices: {window.voices}</p>
    </div>
  );
};

window.voices = 0;
export default () => (
  <Fragment>
    {/* <StatsCustom /> */}

    <Canvas
    // camera={{ position: [0, 20, 20], fov: 75, rotation: [1, 10, 1] }}
    >
      <directionalLight
        // position={[TIME_SEGMENTS, MAX_HEIGHT * 1.5, 0]}
        position={[10, 0, 0]}
        intensity={2}
        color="white"
      />
      {/* <pointLight intensity={100} color="red" position={[2, 2, 2]} />
      <pointLight intensity={100} color="blue" position={[-2, -2, -2]} /> */}

      <pointLight intensity={100} scale={20} />
      {/* <Box /> */}
      {/* <pointLight intensity={10} position={[-40, 0, 0]} /> */}

      <ambientLight intensity={0.1} />

      <Main />

      <OrbitControls
        dampingFactor={1}
        autoRotate={true}
        autoRotateSpeed={0.1}
      />
    </Canvas>
  </Fragment>
);
