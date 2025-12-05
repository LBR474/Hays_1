import React, { Suspense, useEffect, useRef, 
  // useState
 } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, OrthographicCamera } from "@react-three/drei";
import {
  MeshStandardMaterial,
  Mesh,
  Color,
  DirectionalLight,
  AmbientLight,
  Group,
} from "three";

interface HaysLogoModelProps {
  onMaterialsReady: (meshes: Mesh[]) => void;
  modelRef: React.RefObject<Group | null>;
}

const HaysLogoModel: React.FC<HaysLogoModelProps> = ({
  onMaterialsReady,
  modelRef,
}) => {
  const { scene } = useGLTF("models/HAYS_logo_2.glb");

  useEffect(() => {
    const meshes: Mesh[] = [];

    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;

        // --- 🎨 BLUE TRIANGLE ALWAYS LIGHT BLUE ---
        if (mesh.name === "Blue_triangle") {
          mesh.material = new MeshStandardMaterial({
            color: new Color(0xaeede1),
            metalness: 0.3,
            roughness: 0.4,
          });
        }

        // --- All other meshes use metallic white ---
        else {
          mesh.material = new MeshStandardMaterial({
            color: new Color("#000000"),
            metalness: 1,
            roughness: 0.3,
          });
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        meshes.push(mesh);
      }
    });

    onMaterialsReady(meshes);
  }, [scene, onMaterialsReady]);

  return (
    <primitive ref={modelRef} object={scene} scale={1} position={[0, 0, 0]} />
  );
};

useGLTF.preload("models/HAYS_logo_2.glb");

const HaysLogo3D: React.FC = () => {
  const meshesRef = useRef<Mesh[]>([]);
  const ambientLightRef = useRef<AmbientLight | null>(null);
  const directionalLightRef = useRef<DirectionalLight | null>(null);
  const modelRef = useRef<Group | null>(null);

  return (
    <Canvas shadows style={{ background: "white" }}>
      {/* Orthographic camera: clean, stable */}
      <OrthographicCamera
        makeDefault
        position={[0, 1, 12]}
        zoom={30}
        near={-100}
        far={100}
      />

      {/* Static lighting */}
      <ambientLight ref={ambientLightRef} intensity={0.5} />
      <directionalLight
        ref={directionalLightRef}
        position={[-0.5, 1, 5]}
        intensity={3}
        castShadow
        shadow-mapSize-width={2048 * 3}
        shadow-mapSize-height={2048 * 3}
      />

      {/* Model */}
      <Suspense fallback={null}>
        <HaysLogoModel
          onMaterialsReady={(meshes) => (meshesRef.current = meshes)}
          modelRef={modelRef}
        />
      </Suspense>

      <OrbitControls enableZoom={false} autoRotateSpeed={1} />
    </Canvas>
  );
};

export default HaysLogo3D;
