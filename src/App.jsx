import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { Raymarching } from "./components/raymarching/Raymarching";
import { Socials } from "./components/overlays/Socials";
import { SceneProvider, useSceneContext } from "./context/SceneContext";
import { Performance } from "./components/performance/Performance";
import { preventPullToRefresh } from "./utils.jsx";
import { Swipe } from "./components/overlays/Swipe";

const SceneContent = () => {
  const [DPR, setDPR] = useState(1);
  const [factor, setFactor] = useState(1);
  const { remountKey } = useSceneContext();

  useEffect(() => {
    preventPullToRefresh();
  }, []);

  return (
    <>
      <Canvas
        key={remountKey}
        camera={{ position: [0, 0, 6], near: 0.1, far: 100 }}
        dpr={DPR}
        gl={{ antialias: true }}
      >
        <Performance
          DPR={DPR}
          setDPR={setDPR}
          factor={factor}
          setFactor={setFactor}
        />
        <Suspense fallback={null}>
          <Raymarching DPR={DPR} setDPR={setDPR} />
        </Suspense>
      </Canvas>
      <Loader />
      <Socials />
      <Swipe />
    </>
  );
};

const Scene = () => {
  return (
    <SceneProvider>
      <SceneContent />
    </SceneProvider>
  );
};

export default Scene;
