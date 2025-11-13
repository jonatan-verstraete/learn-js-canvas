import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Box, OrbitControls, Sphere } from "@react-three/drei";

// import Main from "./AudioOnly";
import Main from "./Main";
// import Main from "./MainTestAudio";

export default () => (
  <>
    <Canvas>
      <directionalLight
        // position={[TIME_SEGMENTS, MAX_HEIGHT * 1.5, 0]}
        position={[10, 0, 0]}
        intensity={2}
        color="white"
      />
      {/* <pointLight intensity={100} color="red" position={[2, 2, 2]} />
      <pointLight intensity={100} color="blue" position={[-2, -2, -2]} /> */}

      <pointLight intensity={100} scale={20} />
      <Box />
      {/* <pointLight intensity={10} position={[-40, 0, 0]} /> */}

      <ambientLight intensity={0.1} />

      <Main />

      <OrbitControls
        dampingFactor={1}
        autoRotate={true}
        autoRotateSpeed={0.1}
      />
    </Canvas>
  </>
);
