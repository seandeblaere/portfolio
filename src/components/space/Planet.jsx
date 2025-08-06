import { useRef, useState, useMemo, useEffect } from "react";
import { BallCollider, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const scalingFactor = Math.min(Math.max(window.innerWidth / 1600, 0.55), 1.2);
const isMobile = window.innerWidth < 768;

export function Planet({
  startingPosition,
  targetPosition = [0, 0, 0],
  vec = new THREE.Vector3(),
  r = THREE.MathUtils.randFloatSpread,
  children,
  data,
  activated,
}) {
  const api = useRef();
  const [initialized, setInitialized] = useState(false);
  const pos = useMemo(() => startingPosition || [r(40), r(40), r(40)], []);
  const targetVec = useMemo(
    () => new THREE.Vector3(...targetPosition),
    [targetPosition]
  );

  const [hovered, setHovered] = useState(false);
  const resetPosition = useRef(false);

  useEffect(() => {
    if (activated && !initialized) {
      setInitialized(true);
    } else if (!activated && initialized) {
      resetPosition.current = true;
      setInitialized(false);
    }
  }, [activated, initialized]);

  useFrame((state, delta) => {
    if (!api.current) return;
    delta = Math.min(0.1, delta);
    const planetPosition = api.current.translation();

    if (planetPosition) {
      if (activated && initialized) {
        vec.set(
          targetVec.x - planetPosition.x,
          targetVec.y - planetPosition.y,
          targetVec.z - planetPosition.z
        );
        api.current.applyImpulse(
          vec.multiplyScalar((isMobile ? 0.2 : 0.5) * scalingFactor)
        );
      } else if (resetPosition.current) {
        const startVec = new THREE.Vector3(
          startingPosition[0],
          startingPosition[1],
          startingPosition[2]
        );

        vec.set(
          startVec.x - planetPosition.x,
          startVec.y - planetPosition.y,
          startVec.z - planetPosition.z
        );

        api.current.applyImpulse(
          vec.multiplyScalar((isMobile ? 0.15 : 0.6) * scalingFactor)
        );

        if (vec.length() < 1) {
          resetPosition.current = false;
        }
      }
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
        scale={scalingFactor}
        canSleep={false}
      >
        <BallCollider args={[1.4]} />
        {children}
        <mesh
          scale={1.45 * scalingFactor}
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
