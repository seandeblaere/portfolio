import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function Arrow({ onClick, position, rotation, scale }) {
  const { nodes, materials } = useGLTF('./assets/arrow.glb')
  return (
    <group onClick={() => onClick()} position={position} rotation={rotation} scale={scale} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={0.064}>
        <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube001_Material001_0.geometry}
            material={new THREE.MeshBasicMaterial({ color: 'white' })}
            rotation={[-Math.PI / 2, 0, -Math.PI / 4]}
            scale={[100.232, 400.929, 99.913]}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('./assets/arrow.glb')