import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { BallCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export function Pointer({ vec = new THREE.Vector3(), visible }) {
  const ref = useRef();
  const { pointer, viewport } = useThree();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current?.setNextKinematicTranslation(
      vec.set(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      )
    );
  });

  return (
    <RigidBody
      position={[0, 0, 0]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[0.2]} />
      <mesh ref={ref} scale={0.2} visible={visible}>
        <sphereGeometry />
        <meshBasicMaterial color="#fffdbf" toneMapped={false} />
        <pointLight intensity={100} decay={3} distance={40} color={"#fffeaa"} />
        <mesh scale={1}>
          <sphereGeometry />
          <meshBasicMaterial color="#fffeaa" transparent opacity={0.003} />
        </mesh>
      </mesh>
    </RigidBody>
  );
}
