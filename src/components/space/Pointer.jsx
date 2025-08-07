import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { BallCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useSceneContext } from "../../context/SceneContext.jsx";
import { animatePointer } from "../../utils.jsx";

export function Pointer({ vec = new THREE.Vector3(), visible }) {
  const { isMobile } = useSceneContext();
  const ballRef = useRef();
  const { pointer, viewport } = useThree();
  const meshRef = useRef();
  const scaleRef = useRef(0);

  useFrame(() => {
    if (!ballRef.current || isMobile) return;

    ballRef.current.setNextKinematicTranslation(
      vec.set(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      )
    );

    animatePointer(meshRef, scaleRef, visible);
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
        <pointLight intensity={125} decay={3} distance={40} color={"#fffeaa"} />
        <mesh scale={1}>
          <sphereGeometry />
          <meshBasicMaterial color="#fffeaa" transparent opacity={0.003} />
        </mesh>
      </mesh>
    </RigidBody>
  );
}
