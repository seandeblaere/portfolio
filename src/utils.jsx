import * as THREE from "three";
import { lerp } from "three/src/math/MathUtils.js";

const getFullscreenTriangle = () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([-1, -1, 3, -1, -1, 3], 2)
  );
  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2)
  );

  return geometry;
};

const preventPullToRefresh = () => {
  const preventPullToRefreshEvent = (e) => {
    e.preventDefault();
  };

  document.body.addEventListener("touchstart", preventPullToRefreshEvent, {
    passive: false,
  });
  document.body.addEventListener("touchmove", preventPullToRefreshEvent, {
    passive: false,
  });

  return () => {
    document.body.removeEventListener("touchstart", preventPullToRefreshEvent);
    document.body.removeEventListener("touchmove", preventPullToRefreshEvent);
  };
};

const updateShaderUniforms = (
  material,
  {
    elapsedTime,
    resolution,
    blueNoiseTexture,
    noiseTexture,
    cameraPosition,
    currentScroll,
  }
) => {
  if (!material) return;

  material.uniforms.uTime.value = elapsedTime;
  material.uniforms.uResolution.value = resolution;
  material.uniforms.uBlueNoise.value = blueNoiseTexture;
  material.uniforms.uNoise.value = noiseTexture;
  material.uniforms.uFrame.value += 1;
  material.uniforms.uCameraPosition.value = cameraPosition;
  material.uniforms.uCurrentScroll.value = currentScroll;
};

const calculateCameraPosition = (currentScroll, isMobile) => {
  const startY = -6;
  const endY = isMobile ? 0 : -0.2;
  const startZ = isMobile ? 6.2 : 5.3;
  const endZ = -2.5;

  let yPosition = startY;
  let zPosition = startZ;
  let opacity = 1;

  if (currentScroll < 0.5) {
    const t = currentScroll * 2;
    yPosition = THREE.MathUtils.lerp(startY, endY, t);
    opacity = THREE.MathUtils.lerp(1, 0, t);
  } else {
    yPosition = endY;
    opacity = 0;
    zPosition = THREE.MathUtils.lerp(startZ, endZ, (currentScroll - 0.5) * 2);
  }

  return { yPosition, zPosition, opacity };
};

const animatePlanet = (
  planetRef,
  delta,
  hovered,
  hoveredScale,
  defaultScale
) => {
  if (!planetRef.current) return;

  planetRef.current.rotation.x -= delta * 0.01;
  planetRef.current.rotation.y -= delta * 0.1;

  planetRef.current.scale.lerp(
    new THREE.Vector3(
      hovered ? hoveredScale : defaultScale,
      hovered ? hoveredScale : defaultScale,
      hovered ? hoveredScale : defaultScale
    ),
    0.1
  );
};

const animatePointer = (meshRef, scaleRef, visible) => {
  if (!meshRef.current) return;

  const scaleLerpFactor = visible ? 0.01 : 0.05;

  scaleRef.current = lerp(scaleRef.current, visible ? 0.2 : 0, scaleLerpFactor);

  meshRef.current.scale.set(
    scaleRef.current,
    scaleRef.current,
    scaleRef.current
  );
};

const setPosition = (meshRef, COUNT, XY_BOUNDS, Z_BOUNDS) => {
  if (!meshRef.current) return;

  const t = new THREE.Object3D();
  let j = 0;
  for (let i = 0; i < COUNT * 3; i += 3) {
    t.position.x = generatePos(XY_BOUNDS);
    t.position.y = generatePos(XY_BOUNDS);
    t.position.z = (Math.random() - 0.5) * Z_BOUNDS;
    t.updateMatrix();
    meshRef.current.setMatrixAt(j++, t.matrix);
  }
};

function generatePos(XY_BOUNDS) {
  return (Math.random() - 0.5) * XY_BOUNDS;
}

export {
  getFullscreenTriangle,
  preventPullToRefresh,
  updateShaderUniforms,
  calculateCameraPosition,
  animatePlanet,
  animatePointer,
  setPosition,
};
