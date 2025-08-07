import {
  AdaptiveEvents,
  AdaptiveDpr,
  PerformanceMonitor,
  Bvh,
} from "@react-three/drei";

export const Performance = ({ DPR, setDPR, factor, setFactor }) => {
  return (
    <>
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
    </>
  );
};
