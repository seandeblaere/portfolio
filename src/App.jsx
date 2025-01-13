import { AdaptiveEvents, AdaptiveDpr, Bvh, Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";

import { Raymarching } from "./components/raymarching/Raymarching";

const Scene = () => {
  const [DPR, setDPR] = useState(1);
  return (
    <>
      <Canvas camera={{ position: [0, 0, 6], near: 0.1, far: 100 }} dpr={DPR}>
        <AdaptiveEvents />
        <AdaptiveDpr pixelated />
        <Bvh />
        <Suspense fallback={null}>
          <Raymarching setDPR={setDPR} />
        </Suspense>
      </Canvas>
      <Loader />
      <div className="overlay">
        <a href="https://github.com/seandeblaere" target="_blank">
          <img src="/github.svg" alt="GitHub" width={32} height={32} />
        </a>
        <a href="mailto:seandebl@student.arteveldehs.be">
          <img src="/email.svg" alt="Email" width={32} height={32} />
        </a>
      </div>
    </>
  );
};

export default Scene;
