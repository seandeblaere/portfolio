import { useRef, useState, useMemo } from "react";
import { BallCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export function Planet({
  startingPosition,
  targetPosition = [0, 0, 0],
  vec = new THREE.Vector3(),
  r = THREE.MathUtils.randFloatSpread,
  children,
  data,
}) {
  const api = useRef();
  const pos = useMemo(() => startingPosition || [r(40), r(40), r(40)], []);
  const targetVec = useMemo(
    () => new THREE.Vector3(...targetPosition),
    [targetPosition]
  );

  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    delta = Math.min(0.1, delta);
    const planetPosition = api.current?.translation();

    if (planetPosition) {
      vec.set(
        targetVec.x - planetPosition.x,
        targetVec.y - planetPosition.y,
        targetVec.z - planetPosition.z
      );
      api.current?.applyImpulse(vec.multiplyScalar(0.5));
    }
  });

  return (
    <>
      <RigidBody
        linearDamping={4}
        angularDamping={1}
        friction={0.1}
        position={pos}
        ref={api}
        colliders={false}
      >
        <BallCollider args={[1.4]} />
        {children}
        <mesh
          scale={1.45}
          visible={false}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry />
        </mesh>
      </RigidBody>
      {hovered && (
        <Html wrapperClass="planet-overlay">
          <div className="background">
            <h3>{data.title}</h3>
            <p>{data.content}</p>
            {data.list && (
              <ul>
                {data.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </Html>
      )}
    </>
  );
}
