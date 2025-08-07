import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import { Planet1, Planet2, Planet3, Planet4 } from "../planets/Planets";
import aboutMeData from "/info/about-me.json";
import interestsData from "/info/interests.json";
import contactData from "/info/contact.json";
import skillsData from "/info/skills.json";
import { Pointer } from "./Pointer";
import { Planet } from "./Planet";
import { useSceneContext } from "../../context/SceneContext.jsx";
import { setPosition } from "../../utils.jsx";

export const SpaceScene = ({ enableEffects }) => {
  const { isMobile, isSpaceScene, setIsSpaceScene } = useSceneContext();

  const planetMobileTargetPositions = useMemo(
    () => [
      [0, -0.5, 3],
      [2, 1.5, -1.5],
      [1, 4, -2],
      [-1.5, 2, 0.5],
    ],
    []
  );

  const meshRef = useRef();
  const effectsRef = useRef();

  const velocityRef = useRef(0.12);
  const hasVelocityReachedMax = useRef(false);

  const activatedRef = useRef(false);
  const [activePlanetIndex, setActivePlanetIndex] = useState(0);

  const nextPlanet = useCallback(() => {
    setActivePlanetIndex((prev) => (prev + 1) % 4);
    console.log("planet index", activePlanetIndex);
  }, []);

  const previousPlanet = useCallback(() => {
    setActivePlanetIndex((prev) => (prev - 1 + 4) % 4);
    console.log("planet index", activePlanetIndex);
  }, []);

  const getTargetPosition = useCallback(
    (planetIndex) => {
      return planetMobileTargetPositions[
        (planetIndex + activePlanetIndex) % planetMobileTargetPositions.length
      ];
    },
    [activePlanetIndex, planetMobileTargetPositions]
  );

  const constants = useMemo(() => {
    const scalingFactor = Math.min(
      Math.max(window.innerWidth / 1600, 0.55),
      1.2
    );
    return {
      scalingFactor,
      count: (isMobile ? 700 : 1000) * scalingFactor,
      xyBounds: 40 * scalingFactor,
      zBounds: 20 * scalingFactor,
      maxSpeedFactor: isMobile ? 0.95 : 1.3,
      maxScaleFactor: isMobile ? 32 : 35,
      chromaticAberrationOffset: isMobile ? 0.02 : 0.007,
    };
  }, [isMobile]);

  useEffect(() => {
    setPosition(
      meshRef,
      constants.count,
      constants.xyBounds,
      constants.zBounds
    );
  }, []);

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
        activatedRef.current = true;
      } else {
        activatedRef.current = false;
      }

      if (hasVelocityReachedMax.current && velocityRef.current > 0.01) {
        velocityRef.current -= 5 * delta;
      }
    } else {
      velocityRef.current = 0.12;
      hasVelocityReachedMax.current = false;
      activatedRef.current = false;
    }

    const velocity = velocityRef.current;

    for (let i = 0; i < constants.count; i++) {
      meshRef.current.getMatrixAt(i, temp);

      tempObject.scale.set(
        1,
        1,
        Math.max(1, velocity * constants.maxScaleFactor * enableEffects)
      );

      tempPos.setFromMatrixPosition(temp);
      if (tempPos.z > constants.zBounds / 2) {
        tempPos.z = -constants.zBounds / 2;
      } else {
        tempPos.z += Math.max(delta, velocity * constants.maxSpeedFactor);
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
            1 - tempPos.z / (-constants.zBounds / 2);
      }
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;

    const normalizedVelocity = (velocity - 0.1) / (2 - 0.1);
    const chromaticOffset =
      normalizedVelocity * constants.chromaticAberrationOffset;

    if (effectsRef.current) {
      effectsRef.current.offset.x = chromaticOffset;
      effectsRef.current.offset.y = chromaticOffset;
    }

    if (activatedRef.current !== isSpaceScene) {
      setIsSpaceScene(activatedRef.current);
    }
  });

  useEffect(() => {
    if (!isMobile || !isSpaceScene) return;

    setTimeout(() => {
      let touchStartX = 0;
      const handleTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
      };

      const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;

        if (diff > 50) previousPlanet();
        else if (diff < -50) nextPlanet();
      };

      document.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      document.addEventListener("touchend", handleTouchEnd, { passive: true });

      return () => {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }, 1000);
  }, [isMobile]);

  const planetData = useMemo(
    () => [
      {
        startingPosition: [-20, 20, 20],
        desktopPosition: [
          5.5 * constants.scalingFactor,
          2.3 * constants.scalingFactor,
          -0.6 * constants.scalingFactor,
        ],
        data: { title: aboutMeData.name, content: aboutMeData.description },
        component: Planet1,
      },
      {
        startingPosition: [20, -20, -10],
        desktopPosition: [
          -5 * constants.scalingFactor,
          1.2 * constants.scalingFactor,
          -0.7 * constants.scalingFactor,
        ],
        data: { title: interestsData.name, content: interestsData.description },
        component: Planet2,
      },
      {
        startingPosition: [20, 20, 20],
        desktopPosition: [
          1 * constants.scalingFactor,
          0,
          -0.6 * constants.scalingFactor,
        ],
        data: {
          title: skillsData.name,
          content: skillsData.description,
          list: skillsData.skills,
        },
        component: Planet3,
      },
      {
        startingPosition: [-20, -20, -5],
        desktopPosition: [
          -2,
          -3.2 * constants.scalingFactor,
          -1.1 * constants.scalingFactor,
        ],
        data: { title: contactData.name, content: contactData.description },
        component: Planet4,
      },
    ],
    [constants.scalingFactor]
  );

  return (
    <>
      <color args={["#000000"]} attach="background" />
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, constants.count]}
        matrixAutoUpdate
        scale={constants.scalingFactor}
      >
        <sphereGeometry args={[0.03, 4, 4]} />
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
                constants.chromaticAberrationOffset,
                constants.chromaticAberrationOffset
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
        <Pointer visible={isSpaceScene} />

        {planetData.map((planet, index) => {
          const PlanetComponent = planet.component;
          return (
            <Planet
              key={`planet-${index}`}
              startingPosition={planet.startingPosition}
              targetPosition={
                isMobile ? getTargetPosition(index) : planet.desktopPosition
              }
              data={planet.data}
              activated={isSpaceScene}
            >
              <PlanetComponent />
            </Planet>
          );
        })}
      </Physics>
    </>
  );
};
