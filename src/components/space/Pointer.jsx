import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { BallCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useMobileContext } from "../../context/MobileContext.jsx";
import { lerp } from "three/src/math/MathUtils.js";

export function Pointer({ vec = new THREE.Vector3(), visible }) {
  const { isMobile } = useMobileContext();
  const ballRef = useRef();
  const intensityRef = useRef(0);
  const scaleRef = useRef(0);
  const { pointer, viewport } = useThree();
  const lightRef = useRef();
  const meshRef = useRef();

  useFrame(() => {
    if (!ballRef.current || isMobile) return;

    ballRef.current.setNextKinematicTranslation(
      vec.set(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      )
    );

    const intensityLerpFactor = visible ? 0.001 : 0.05;
    const scaleLerpFactor = visible ? 0.01 : 0.05;

    intensityRef.current = lerp(
      intensityRef.current,
      visible ? 100 : 0,
      intensityLerpFactor
    );

    scaleRef.current = lerp(
      scaleRef.current,
      visible ? 0.2 : 0,
      scaleLerpFactor
    );

    if (lightRef.current) {
      lightRef.current.intensity = intensityRef.current;
    }

    if (meshRef.current) {
      meshRef.current.scale.set(
        scaleRef.current,
        scaleRef.current,
        scaleRef.current
      );
    }
  });

  return (
    <RigidBody
      position={[0, 0, 0]}
      type="kinematicPosition"
      colliders={false}
      ref={ballRef}
    >
      <BallCollider args={[0.2]} />
      <mesh ref={meshRef} visible={!isMobile && visible}>
        <sphereGeometry />
        <meshBasicMaterial color="#fffdbf" toneMapped={false} />
        <pointLight
          ref={lightRef}
          intensity={0}
          decay={3}
          distance={40}
          color={"#fffeaa"}
        />
        <mesh scale={1}>
          <sphereGeometry />
          <meshBasicMaterial color="#fffeaa" transparent opacity={0.003} />
        </mesh>
      </mesh>
    </RigidBody>
  );
}
