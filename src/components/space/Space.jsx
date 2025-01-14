import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useRef, useState } from "react";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import { Planet1, Planet2, Planet3, Planet4 } from "../planets/Planets";
import aboutMeData from "/info/about-me.json";
import interestsData from "/info/interests.json";
import contactData from "/info/contact.json";
import skillsData from "/info/skills.json";
import { Pointer } from "./Pointer";
import { Planet } from "./Planet";

const scalingFactor = Math.min(Math.max(window.innerWidth / 1600, 0.55), 1.2);
const isMobile = window.innerWidth < 768;
const COUNT = 1000 * scalingFactor;
const XY_BOUNDS = 40 * scalingFactor;
const Z_BOUNDS = 20 * scalingFactor;
const MAX_SPEED_FACTOR = 1.3;
const MAX_SCALE_FACTOR = 35;
const CHROMATIC_ABBERATION_OFFSET = 0.006;

export const SpaceScene = ({ enableEffects, position }) => {
  const meshRef = useRef();
  const effectsRef = useRef();

  const velocityRef = useRef(0.12);
  const hasVelocityReachedMax = useRef(false);

  const isVisibleRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!meshRef.current || !position) return;

    const t = new THREE.Object3D();
    let j = 0;
    for (let i = 0; i < COUNT * 3; i += 3) {
      t.position.x = generatePos();
      t.position.y = generatePos();
      t.position.z = (Math.random() - 0.5) * Z_BOUNDS;
      t.updateMatrix();
      meshRef.current.setMatrixAt(j++, t.matrix);
    }
  }, [position]);

  const temp = new THREE.Matrix4();
  const tempPos = new THREE.Vector3();
  const tempObject = new THREE.Object3D();
  const tempColor = new THREE.Color();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    delta = Math.min(0.1, delta);

    if (enableEffects) {
      if (!hasVelocityReachedMax.current) {
        velocityRef.current = Math.min(2, velocityRef.current + delta * 0.6);

        if (velocityRef.current >= 1.6) {
          hasVelocityReachedMax.current = true;
        }
      }

      if (velocityRef.current <= 0.1 && hasVelocityReachedMax.current) {
        isVisibleRef.current = true;
      } else {
        isVisibleRef.current = false;
      }

      if (hasVelocityReachedMax.current && velocityRef.current > 0.01) {
        velocityRef.current -= 5 * delta;
      }
    } else {
      velocityRef.current = 0.12;
      hasVelocityReachedMax.current = false;
      isVisibleRef.current = false;
    }

    const velocity = velocityRef.current;

    for (let i = 0; i < COUNT; i++) {
      meshRef.current.getMatrixAt(i, temp);

      tempObject.scale.set(
        1,
        1,
        Math.max(1, velocity * MAX_SCALE_FACTOR * enableEffects)
      );

      tempPos.setFromMatrixPosition(temp);
      if (tempPos.z > Z_BOUNDS / 2) {
        tempPos.z = -Z_BOUNDS / 2;
      } else {
        tempPos.z += Math.max(delta, velocity * MAX_SPEED_FACTOR);
      }
      tempObject.position.set(tempPos.x, tempPos.y, tempPos.z);

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      if (tempPos.z > 0) {
        tempColor.r = tempColor.g = tempColor.b = 1;
      } else {
        tempColor.r =
          tempColor.g =
          tempColor.b =
            1 - tempPos.z / (-Z_BOUNDS / 2);
      }
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;

    const normalizedVelocity = (velocity - 0.1) / (2 - 0.1);
    const chromaticOffset = normalizedVelocity * CHROMATIC_ABBERATION_OFFSET;

    if (effectsRef.current) {
      effectsRef.current.offset.x = chromaticOffset;
      effectsRef.current.offset.y = chromaticOffset;
    }

    if (isVisibleRef.current !== isVisible) {
      setIsVisible(isVisibleRef.current);
    }
  });

  return (
    <>
      <color args={["#000000"]} attach="background" />
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, COUNT]}
        matrixAutoUpdate
        scale={scalingFactor}
      >
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color={[1.5, 1.5, 1.5]} toneMapped={false} />
      </instancedMesh>
      {enableEffects && (
        <EffectComposer>
          <Bloom luminanceThreshold={0} intensity={4} mipmapBlur />
          <ChromaticAberration
            ref={effectsRef}
            blendFunction={BlendFunction.NORMAL}
            offset={
              new THREE.Vector2(
                CHROMATIC_ABBERATION_OFFSET,
                CHROMATIC_ABBERATION_OFFSET
              )
            }
          />
        </EffectComposer>
      )}
      <ambientLight intensity={2.5} color="#8b8abd" />

      <directionalLight
        intensity={9}
        color="#b3c3f2"
        position={[5, 5, 5]}
        castShadow
      />

      <Physics gravity={[0, 0, 0]}>
        <Pointer visible={isVisible} />
        {isVisible && (
          <>
            <Planet
              startingPosition={[-20, 20, 20]}
              targetPosition={[
                5.5 * scalingFactor,
                2.3 * scalingFactor,
                -0.6 * scalingFactor,
              ]}
              data={{
                title: aboutMeData.name,
                content: aboutMeData.description,
              }}
            >
              <Planet1 />
            </Planet>
            <Planet
              startingPosition={[20, -20, -10]}
              targetPosition={[
                -5 * scalingFactor,
                1.2 * scalingFactor,
                -0.7 * scalingFactor,
              ]}
              data={{
                title: interestsData.name,
                content: interestsData.description,
              }}
            >
              <Planet2 />
            </Planet>
            <Planet
              startingPosition={[20, 20, 20]}
              targetPosition={[
                1 * scalingFactor,
                0 * scalingFactor,
                -0.6 * scalingFactor,
              ]}
              data={{
                title: skillsData.name,
                content: skillsData.description,
                list: skillsData.skills,
              }}
            >
              <Planet3 />
            </Planet>
            <Planet
              startingPosition={[-20, -20, -5]}
              targetPosition={[-2, -3.2 * scalingFactor, -1.1 * scalingFactor]}
              data={{
                title: contactData.name,
                content: contactData.description,
              }}
            >
              <Planet4 />
            </Planet>
          </>
        )}
      </Physics>
    </>
  );
};

function generatePos() {
  return (Math.random() - 0.5) * XY_BOUNDS;
}
