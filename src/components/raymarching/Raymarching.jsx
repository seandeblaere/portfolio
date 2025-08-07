import {
  useTexture,
  useFBO,
  OrthographicCamera,
  MeshPortalMaterial,
  Text,
} from "@react-three/drei";
import { useFrame, useThree, createPortal, extend } from "@react-three/fiber";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { easing } from "maath";
import { SpaceScene } from "../space/Space.jsx";
import { useSceneContext } from "../../context/SceneContext.jsx";
import BicubicUpscaleMaterial from "../clouds/BicubicUpscaleMaterial";
import {
  getFullscreenTriangle,
  updateShaderUniforms,
  calculateCameraPosition,
} from "../../utils.jsx";
import vertexShader from "../clouds/vertexShader.glsl";
import fragmentShader from "../clouds/fragmentShader.glsl";
import { useScrollControl } from "../../hooks/useScrollControl";

extend({ BicubicUpscaleMaterial });

const BLUE_NOISE_TEXTURE_URL = "../assets/blue-noise.png";
const NOISE_TEXTURE_URL = "../assets/noise2.png";

export function Raymarching({ DPR, setDPR }) {
  const { isMobile } = useSceneContext();
  const [enableEffects, setEnableEffects] = useState(false);
  const [position, setPosition] = useState(false);
  const { viewport } = useThree();

  const { virtualScroll, currentScroll } = useScrollControl();

  const refs = {
    mesh: useRef(),
    text: useRef(),
    screen: {
      mesh: useRef(),
      camera: useRef(),
    },
    portal: {
      material: useRef(),
      mesh: useRef(),
    },
    upscaler: useRef(),
    lastDpr: useRef(DPR),
    opacity: useRef(1),
    isVisible: useRef(true),
  };

  const magicScene = useMemo(() => new THREE.Scene(), []);
  const resolution = isMobile ? 3 : 5;
  const renderTargetA = useFBO(
    window.innerWidth / resolution,
    window.innerHeight / resolution
  );

  const scalingFactor = Math.min(Math.max(window.innerWidth / 1600, 0.55), 1.2);
  const textContent = isMobile
    ? "Scroll down\nto enter my universe"
    : "Scroll down to enter my universe";
  const fontProps = useMemo(
    () => ({
      font: "./Orbitron-Regular.ttf",
      fontSize: isMobile ? 0.6 * scalingFactor : 0.45 * scalingFactor,
      "material-toneMapped": false,
    }),
    [isMobile, scalingFactor]
  );

  const blueNoiseTexture = useTexture(BLUE_NOISE_TEXTURE_URL);
  const noisetexture = useTexture(NOISE_TEXTURE_URL);

  useMemo(() => {
    const configureTexture = (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = texture.magFilter = THREE.NearestMipmapLinearFilter;
    };

    configureTexture(blueNoiseTexture);
    configureTexture(noisetexture);
  }, [blueNoiseTexture, noisetexture]);

  const uniforms = useMemo(
    () => ({
      uTime: new THREE.Uniform(0.0),
      uResolution: new THREE.Uniform(new THREE.Vector2()),
      uNoise: new THREE.Uniform(null),
      uBlueNoise: new THREE.Uniform(null),
      uFrame: new THREE.Uniform(0),
      uCameraPosition: new THREE.Uniform(new THREE.Vector3(0.0, 0.5, 5.5)),
      uCurrentScroll: new THREE.Uniform(0),
    }),
    []
  );

  useFrame((state, delta) => {
    const { gl, clock } = state;
    const { opacity, isVisible } = refs;

    currentScroll.current = THREE.MathUtils.damp(
      currentScroll.current,
      virtualScroll.current,
      1.2,
      delta
    );

    const {
      yPosition,
      zPosition,
      opacity: newOpacity,
    } = calculateCameraPosition(currentScroll.current, isMobile);

    opacity.current = newOpacity;

    setEnableEffects(currentScroll.current > 0.94);

    if (currentScroll.current > 0.75) {
      setPosition(true);
      setDPR(0.8);
    } else {
      setPosition(false);
      setDPR(1);
    }

    isVisible.current = currentScroll.current <= 0.85;

    if (refs.text.current?.material) {
      refs.text.current.material.opacity = opacity.current;
      refs.text.current.material.needsUpdate = true;
    }

    const shaderMaterial = refs.mesh.current?.material;
    if (shaderMaterial) {
      updateShaderUniforms(shaderMaterial, {
        elapsedTime: clock.getElapsedTime(),
        resolution: new THREE.Vector2(
          renderTargetA.width,
          renderTargetA.height
        ),
        blueNoiseTexture,
        noiseTexture: noisetexture,
        cameraPosition: new THREE.Vector3(0, yPosition, zPosition),
        currentScroll: currentScroll.current,
      });
    }

    gl.setRenderTarget(renderTargetA);
    gl.render(magicScene, state.camera);

    if (refs.upscaler.current) {
      refs.upscaler.current.uniforms.uTexture.value = renderTargetA.texture;

      if (refs.screen.mesh.current) {
        refs.screen.mesh.current.material = refs.upscaler.current;
      }
    }

    gl.setRenderTarget(null);

    const blendFactor = THREE.MathUtils.clamp(
      (currentScroll.current - 0.75) / 0.2,
      0,
      1
    );

    if (refs.portal.material.current) {
      easing.damp(
        refs.portal.material.current,
        "blend",
        blendFactor,
        0.01,
        delta
      );
    }

    if (DPR !== refs.lastDpr.current && refs.upscaler.current) {
      refs.upscaler.current.updateDPR(DPR);
      refs.lastDpr.current = DPR;
    }
  });

  return (
    <>
      {createPortal(
        <mesh
          ref={refs.mesh}
          scale={[viewport.width, viewport.height, 1]}
          visible={refs.isVisible.current}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            key={uuidv4()}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
          />
        </mesh>,
        magicScene
      )}

      <OrthographicCamera
        ref={refs.screen.camera}
        args={[-1, 1, 1, -1, 0, 1]}
        visible={refs.isVisible.current}
      />

      <bicubicUpscaleMaterial
        ref={refs.upscaler}
        key={uuidv4()}
        visible={refs.isVisible.current}
        args={[DPR]}
      />

      <mesh
        ref={refs.screen.mesh}
        geometry={getFullscreenTriangle()}
        frustumCulled={false}
        visible={refs.isVisible.current}
      >
        <meshBasicMaterial />
      </mesh>

      <mesh ref={refs.portal.mesh}>
        <planeGeometry args={[1, 1]} />
        <MeshPortalMaterial ref={refs.portal.material} visible={false}>
          <SpaceScene enableEffects={enableEffects} position={position} />
        </MeshPortalMaterial>
      </mesh>

      <Text
        ref={refs.text}
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
