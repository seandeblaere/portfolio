import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { animatePlanet } from "../../utils.jsx";

export function Planet1(props) {
  const { nodes, materials } = useGLTF("./assets/lava_planet.glb");
  const planet = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    animatePlanet(planet, delta, hovered, 2, 1.4);
  });

  return (
    <group
      {...props}
      dispose={null}
      ref={planet}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.defaultMaterial.geometry}
          material={materials.DefaultMaterial}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("./assets/lava_planet.glb");

export function Planet2(props) {
  const { nodes, materials } = useGLTF("./assets/planet_of_phoenix.glb");
  const planet = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    animatePlanet(planet, delta, hovered, 1.2, 0.9);
  });

  return (
    <group
      {...props}
      dispose={null}
      ref={planet}
      scale={0.6}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group rotation={[-Math.PI / 2, 0, 0]} scale={0.078}>
        <group rotation={[-Math.PI, 0, 0]} scale={0.001}>
          <group scale={1000}>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Phoenix_LOD0__0.geometry}
              material={materials["Scene_-_Root"]}
              position={[0, 0, -22.361]}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("./assets/planet_of_phoenix.glb");

export function Planet3(props) {
  const { nodes, materials } = useGLTF(
    "./assets/mercury_planet_brass_stylised.glb"
  );

  const planet = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    animatePlanet(planet, delta, hovered, 5, 3.5);
  });

  return (
    <group
      {...props}
      dispose={null}
      ref={planet}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group rotation={[-Math.PI / 2, 0, 0]} scale={0.004}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Mercury_ZB_LP_Material_#2_0"].geometry}
            material={materials.Material_2}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("./assets/mercury_planet_brass_stylised.glb");

export function Planet4(props) {
  const { nodes, materials } = useGLTF("./assets/blue_planet.glb");
  const planet = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    animatePlanet(planet, delta, hovered, 2, 1.4);
  });

  return (
    <group
      {...props}
      dispose={null}
      ref={planet}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.MakeMake_LP_Standard_0.geometry}
        material={materials.Standard}
        rotation={[Math.PI / 2, -1.561, -Math.PI]}
      />
    </group>
  );
}

useGLTF.preload("./assets/blue_planet.glb");
