import {
  useTexture,
  useFBO,
  OrthographicCamera,
  MeshPortalMaterial,
  Text,
} from "@react-three/drei";
import { useFrame, useThree, createPortal, extend } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { easing } from "maath";
import { SpaceScene } from "../space/Space.jsx";

import BicubicUpscaleMaterial from "../clouds/BicubicUpscaleMaterial";
import getFullscreenTriangle from "../../utils.jsx";
import vertexShader from "../clouds/vertexShader.glsl";
import fragmentShader from "../clouds/fragmentShader.glsl";

extend({ BicubicUpscaleMaterial });

const BLUE_NOISE_TEXTURE_URL =
  "https://cdn.maximeheckel.com/noises/blue-noise.png";

const NOISE_TEXTURE_URL = "https://cdn.maximeheckel.com/noises/noise2.png";

export function Raymarching({ setDPR }) {
  const [enableEffects, setEnableEffects] = useState(false);
  const [position, setPosition] = useState(false);
  const mesh = useRef();
  const opacity = useRef(1);
  const textRef = useRef();
  const screenMesh = useRef();
  const screenCamera = useRef();
  const upscalerMaterialRef = useRef();
  const { viewport } = useThree();
  const portalMaterial = useRef();
  const portalMesh = useRef();

  const virtualScroll = useRef(0);
  const currentScroll = useRef(0);
  const isVisible = useRef(true);
  const magicScene = new THREE.Scene();

  const resolution = 5;

  const renderTargetA = useFBO(
    window.innerWidth / resolution,
    window.innerHeight / resolution
  );

  const scalingFactor = Math.min(Math.max(window.innerWidth / 1600, 0.55), 1.2);
  const isMobile = window.innerWidth < 768;
  const textContent = isMobile
    ? "Scroll down\nto enter my universe"
    : "Scroll down to enter my universe";

  const fontProps = {
    font: "./Orbitron-Regular.ttf",
    fontSize: isMobile ? 0.6 * scalingFactor : 0.45 * scalingFactor,
    "material-toneMapped": false,
  };

  const blueNoiseTexture = useTexture(BLUE_NOISE_TEXTURE_URL);
  blueNoiseTexture.wrapS = THREE.RepeatWrapping;
  blueNoiseTexture.wrapT = THREE.RepeatWrapping;
  blueNoiseTexture.minFilter = THREE.NearestMipmapLinearFilter;
  blueNoiseTexture.magFilter = THREE.NearestMipmapLinearFilter;

  const noisetexture = useTexture(NOISE_TEXTURE_URL);
  noisetexture.wrapS = THREE.RepeatWrapping;
  noisetexture.wrapT = THREE.RepeatWrapping;
  noisetexture.minFilter = THREE.NearestMipmapLinearFilter;
  noisetexture.magFilter = THREE.NearestMipmapLinearFilter;

  const uniforms = {
    uTime: new THREE.Uniform(0.0),
    uResolution: new THREE.Uniform(new THREE.Vector2()),
    uNoise: new THREE.Uniform(null),
    uBlueNoise: new THREE.Uniform(null),
    uFrame: new THREE.Uniform(0),
    uCameraPosition: new THREE.Uniform(new THREE.Vector3(0.0, 0.5, 5.5)),
  };

  useEffect(() => {
    let touchStartY = 0;

    const onWheel = (event) => {
      virtualScroll.current += event.deltaY * 0.001;
      virtualScroll.current = Math.max(0, Math.min(1, virtualScroll.current));
    };

    const onTouchStart = (event) => {
      touchStartY = event.touches[0].clientY;
    };

    const onTouchMove = (event) => {
      const touchEndY = event.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      virtualScroll.current += deltaY * 0.001;
      virtualScroll.current = Math.max(0, Math.min(1, virtualScroll.current));
      touchStartY = touchEndY;
    };

    const disableScroll = (event) => event.preventDefault();

    window.addEventListener("wheel", onWheel);
    window.addEventListener("wheel", disableScroll, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("wheel", disableScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useFrame((state, delta) => {
    const { gl, clock } = state;

    currentScroll.current = THREE.MathUtils.damp(
      currentScroll.current,
      virtualScroll.current,
      1.2,
      delta
    );

    const startY = -6;
    const endY = isMobile ? 0 : -0.2;
    const startZ = isMobile ? 5.9 : 5;
    const endZ = -2.5;
    const startOpacity = 1;
    const endOpacity = 0;

    let yPosition = startY;
    let zPosition = startZ;

    if (currentScroll.current < 0.5) {
      const t = currentScroll.current * 2;
      yPosition = THREE.MathUtils.lerp(startY, endY, t);
      opacity.current = THREE.MathUtils.lerp(startOpacity, endOpacity, t);
    } else {
      const t = (currentScroll.current - 0.5) * 2;
      yPosition = endY;
      opacity.current = endOpacity;

      zPosition = THREE.MathUtils.lerp(startZ, endZ, t);
    }

    if (currentScroll.current > 0.94) {
      setEnableEffects(true);
    } else {
      setEnableEffects(false);
    }

    if (currentScroll.current > 0.75) {
      setPosition(true);
      setDPR(0.7);
    } else {
      setPosition(false);
      setDPR(1);
    }

    if (currentScroll.current > 0.85) {
      isVisible.current = false;
    } else {
      isVisible.current = true;
    }

    if (textRef.current && textRef.current.material) {
      textRef.current.material.opacity = opacity.current;
      textRef.current.material.needsUpdate = true;
    }

    mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
    mesh.current.material.uniforms.uResolution.value = new THREE.Vector2(
      renderTargetA.width,
      renderTargetA.height
    );
    mesh.current.material.uniforms.uBlueNoise.value = blueNoiseTexture;
    mesh.current.material.uniforms.uNoise.value = noisetexture;
    mesh.current.material.uniforms.uFrame.value += 1;
    mesh.current.material.uniforms.uCameraPosition.value = new THREE.Vector3(
      0.0,
      yPosition,
      zPosition
    );

    gl.setRenderTarget(renderTargetA);
    gl.render(magicScene, state.camera);

    upscalerMaterialRef.current.uniforms.uTexture.value = renderTargetA.texture;
    screenMesh.current.material = upscalerMaterialRef.current;

    gl.setRenderTarget(null);

    const blendStart = 0.75;
    const blendEnd = 0.95;

    const blendFactor = THREE.MathUtils.clamp(
      (currentScroll.current - blendStart) / (blendEnd - blendStart),
      0,
      1
    );

    if (portalMaterial.current) {
      easing.damp(portalMaterial.current, "blend", blendFactor, 0.01, delta);
    }
  });

  return (
    <>
      {createPortal(
        <mesh
          ref={mesh}
          scale={[viewport.width, viewport.height, 1]}
          visible={isVisible.current}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            key={uuidv4()}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            uniforms={uniforms}
            wireframe={false}
          />
        </mesh>,
        magicScene
      )}
      <OrthographicCamera
        ref={screenCamera}
        args={[-1, 1, 1, -1, 0, 1]}
        visible={isVisible.current}
      />
      <bicubicUpscaleMaterial
        ref={upscalerMaterialRef}
        key={uuidv4()}
        visible={isVisible.current}
      />
      <mesh
        ref={screenMesh}
        geometry={getFullscreenTriangle()}
        frustumCulled={false}
        visible={isVisible.current}
        onPointerOver={() => set(true)}
        onPointerOut={() => set(false)}
      >
        <meshBasicMaterial />
      </mesh>

      <mesh ref={portalMesh}>
        <planeGeometry args={[1, 1]} />

        <MeshPortalMaterial ref={portalMaterial} visible={false}>
          <SpaceScene enableEffects={enableEffects} position={position} />
        </MeshPortalMaterial>
      </mesh>

      <Text
        ref={textRef}
        {...fontProps}
        position={[0, 0, 0]}
        color="#434183"
        anchorX="center"
        anchorY="middle"
        transparent
        characters="abcdefghijklmnopqrstuvwxyz"
        textAlign="center"
      >
        {textContent}
      </Text>
    </>
  );
}
