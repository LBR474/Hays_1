import React, { Suspense, useEffect, useRef } from "react";
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
import gsap from "gsap";

interface HaysLogoModelProps {
  onMaterialsReady: (meshes: Mesh[]) => void;
  modelRef: React.RefObject<Group | null>;
}

const HaysLogoModel: React.FC<HaysLogoModelProps> = ({
  onMaterialsReady,
  modelRef,
}) => {
  const { scene } = useGLTF("models/HAYS_logo_2.glb");
  const blueTriangleRef = useRef<Mesh | null>(null);
  const letterMeshesRef = useRef<Mesh[]>([]);

  useEffect(() => {
    const meshes: Mesh[] = [];

    scene.traverse((child: any) => {
      if (!child.isMesh) return;
      const mesh = child as Mesh;

      // Blue triangle
      if (mesh.name === "Blue_triangle") {
        mesh.material = new MeshStandardMaterial({
          color: new Color(0xaeede1),
          metalness: 0.3,
          roughness: 0.4,
        });
        blueTriangleRef.current = mesh;
      }
      // Letters H, A, Y, S
      else if (["H", "A", "Y", "S"].includes(mesh.name)) {
        mesh.material = new MeshStandardMaterial({
          color: new Color(0xffffff),
          emissive: new Color(0xffffff),
          emissiveIntensity: 6,
          metalness: 0,
          roughness: 1,
        });
        letterMeshesRef.current.push(mesh);
      }
      // Everything else
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
    });

    onMaterialsReady(meshes);

    // Animate Blue Triangle
    if (blueTriangleRef.current) {
      const tri = blueTriangleRef.current;
      const finalPos = tri.position.clone();
      const finalRot = tri.rotation.clone();

      tri.position.set(finalPos.x - 3, finalPos.y, finalPos.z - 3);
      tri.rotation.set(finalRot.x, finalRot.y, finalRot.z + Math.PI / 4);

      gsap.to(tri.position, {
        x: finalPos.x,
        y: finalPos.y,
        z: finalPos.z,
        duration: 3,
        ease: "power3.out",
      });

      gsap.to(tri.rotation, {
        x: finalRot.x,
        y: finalRot.y,
        z: finalRot.z,
        duration: 3,
        ease: "power3.out",
      });
    }

    // Animate letters from white to black as triangle slides in
    letterMeshesRef.current.forEach((mesh) => {
      const mat = mesh.material as MeshStandardMaterial;
      gsap.to(mat.color, {
        r: 0,
        g: 0,
        b: 0,
        duration: 10,
        ease: "power3.out",
        onUpdate: () => { (mat.needsUpdate = true) },
      });
      gsap.to(mat.emissive, {
        r: 0,
        g: 0,
        b: 0,
        duration: 4,
        ease: "power3.out",
        onUpdate: () => { (mat.needsUpdate = true) },
      });
    });
  }, [scene, onMaterialsReady]);

  return <primitive ref={modelRef} object={scene} scale={1} />;
};

useGLTF.preload("models/HAYS_logo_2.glb");

const HaysLogo3D: React.FC = () => {
  const meshesRef = useRef<Mesh[]>([]);
  const ambientLightRef = useRef<AmbientLight | null>(null);
  const directionalLightRef = useRef<DirectionalLight | null>(null);
  const modelRef = useRef<Group | null>(null);

  return (
    <Canvas shadows style={{ background: "white" }}>
      <OrthographicCamera
        makeDefault
        position={[0, 1, 12]}
        zoom={30}
        near={-100}
        far={100}
      />

      <ambientLight ref={ambientLightRef} intensity={0.5} />
      <directionalLight
        ref={directionalLightRef}
        position={[-0.5, 1, 5]}
        intensity={3}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
      />

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
