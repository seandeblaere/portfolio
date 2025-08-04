import {
  Bvh,
  Loader,
  AdaptiveEvents,
  AdaptiveDpr,
  PerformanceMonitor,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Raymarching } from "./components/raymarching/Raymarching";
import { MobileProvider } from "./context/MobileContext";
import { MobileControls } from "./components/controls/MobileControls";

const Scene = () => {
  const [DPR, setDPR] = useState(1);
  const [factor, setFactor] = useState(1);

  return (
    <MobileProvider>
      <Canvas
        camera={{ position: [0, 0, 6], near: 0.1, far: 100 }}
        dpr={DPR}
        gl={{ antialias: true }}
      >
        <AdaptiveEvents />
        <AdaptiveDpr pixelated />
        <PerformanceMonitor
          factor={factor}
          bounds={(refreshrate) => (refreshrate > 90 ? [45, 80] : [45, 55])}
          onIncline={() => {
            setDPR(Math.min(DPR + 0.3, 2));
          }}
          onDecline={() => {
            setDPR(Math.max(DPR - 0.3, 0.5));
          }}
          onChange={({ factor }) => {
            setFactor(factor);
            setDPR(Math.floor(0.5 + 1.5 * factor));
          }}
          flipflops={2}
          onFallback={() => setDPR(0.5)}
        />
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
      <MobileControls />
    </MobileProvider>
  );
};

export default Scene;
