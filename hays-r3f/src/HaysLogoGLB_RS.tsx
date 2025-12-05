import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
//@ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useRef } from "react";

export default function Scene() {
  return (
    <Canvas
      orthographic
      shadows
      camera={{ position: [0, 0, 2], zoom: 20 }}
      gl={{ alpha: false }}
    >
      <OrbitControls />
      <ambientLight intensity={1.0} />
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 2, 8]} />
      <SceneContents />
    </Canvas>
  );
}

function SceneContents() {
  const gltf = useLoader(GLTFLoader, "/models/HAYS_logo_2.glb");

  const blueLightRef = useRef<THREE.SpotLight>(null!);
  const goldLightRef = useRef<THREE.SpotLight>(null!);
  const logoRef = useRef<THREE.Object3D>(null!);

  const hRef = useRef<THREE.Mesh>(null!);
  const hFinalPos = useRef(new THREE.Vector3());

  // --- Blue triangle refs ---
  const blueTriangleRef = useRef<THREE.Mesh>(null!);
  // const blueTriangleFinalPos = useRef(new THREE.Vector3());
  // const blueTriangleStartPos = new THREE.Vector3(-12, 0, 0); // offstage start

  // --- initial spotlight positions ---
  const initialBluePos = new THREE.Vector3(-2, 2, 2);
  const initialGoldPos = new THREE.Vector3(2, 3, -1);

  // --- GLB slide-in positions ---
  const finalLogoPos = new THREE.Vector3(0, 0, 0);
  const startLogoPos = new THREE.Vector3(-8, 0, 0);

  const revolutionSpeed = (2 * Math.PI) / 3;

useFrame(({ clock }) => {
  const t = clock.getElapsedTime();

  // ---- SPOTLIGHTS (0–3 seconds only) ----
  if (t < 3) {
    const radius = 3;

    if (blueLightRef.current) {
      blueLightRef.current.position.x = Math.cos(t * revolutionSpeed) * radius;
      blueLightRef.current.position.z = Math.sin(t * revolutionSpeed) * radius;
      blueLightRef.current.position.y = 2;
    }

    if (goldLightRef.current) {
      goldLightRef.current.position.x = Math.cos(t * revolutionSpeed) * radius;
      goldLightRef.current.position.y =
        Math.sin(t * revolutionSpeed) * radius + 2;
      goldLightRef.current.position.z = -1;
    }
  } else {
    // Freeze spotlights after t>=3
    blueLightRef.current?.position.copy(initialBluePos);
    goldLightRef.current?.position.copy(initialGoldPos);
  }

  // ---- MAIN LOGO SLIDES IN (3–4s) ----
  if (logoRef.current) {
    if (t < 3) logoRef.current.position.copy(startLogoPos);
    else if (t <= 4) {
      const slideProgress = (t - 3) / 1;
      logoRef.current.position.lerpVectors(
        startLogoPos,
        finalLogoPos,
        slideProgress
      );
    } else {
      logoRef.current.position.copy(finalLogoPos);
    }
  }

  // ---- BLUE_TRIANGLE ARRIVES (4–5s) ----
  if (blueTriangleRef.current && hFinalPos.current) {
    if (t < 4) {
      blueTriangleRef.current.position.set(-4, 0, 0);
    } else if (t <= 5) {
      const triProgress = (t - 4) / 1;
      const targetPos = hFinalPos.current.clone();
      targetPos.z -= 0.5;
      blueTriangleRef.current.position.lerpVectors(
        new THREE.Vector3(-4, 0, 0),
        targetPos,
        triProgress
      );
    } else {
      const targetPos = hFinalPos.current.clone();
      targetPos.z -= 0.5;
      blueTriangleRef.current.position.copy(targetPos);
    }
  }
});



  // ---- APPLY MATERIALS & SETUP BLUE TRIANGLE ----
 gltf.scene.traverse((child: any) => {
   if (!child.isMesh) return;

   child.castShadow = true;
   child.receiveShadow = true;

   // ---- BLUE TRIANGLE ----
   if (child.name === "Blue_triangle") {
     child.material = new THREE.MeshLambertMaterial({ color: 0xaeede1 });

     blueTriangleRef.current = child;

     // START POSITION (local)
     child.position.set(-4, 0, 0); // adjust as desired
   }

   // ---- H MESH (stores final target for triangle) ----
   else if (child.name === "H") {
     hRef.current = child;

     // Store *local* final position for triangle target
     hFinalPos.current.copy(child.position.clone());
   }

   // ---- DEFAULT MESHES ----
   else {
     child.material = new THREE.MeshStandardMaterial({
       color: 0x000000,
       roughness: 0.2,
       metalness: 0.9,
     });
   }
 });


  return (
    <>
      <hemisphereLight args={[0xffffff, 0x8d8d8d, 0.75]} />

      {/* Lights */}
      <spotLight
        ref={blueLightRef}
        position={initialBluePos.toArray()}
        angle={Math.PI}
        intensity={50}
        penumbra={1}
        color={"#82aaff"}
        castShadow
      />

      <spotLight
        ref={goldLightRef}
        position={initialGoldPos.toArray()}
        angle={Math.PI}
        intensity={60}
        penumbra={1}
        color={"#ffcb6b"}
        castShadow
      />

      {/* Reflective Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <MeshReflectorMaterial
          resolution={2048}
          mirror={0.8}
          mixBlur={2}
          mixStrength={2}
          blur={[400, 100]}
          depthScale={1}
          minDepthThreshold={0.9}
          maxDepthThreshold={1}
          color="#FFFFFF"
          roughness={0.4}
          metalness={0.0}
        />
      </mesh>

      {/* Tilted Back Wall */}
      <mesh
        position={[0, -1.0, -1]}
        rotation={[-Math.PI / 2 + Math.PI / 4, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 40]} />
        <meshLambertMaterial color={0xFFFFFF} />
      </mesh>

      {/* GLB Logo */}
      <primitive
        ref={logoRef}
        object={gltf.scene}
        position={startLogoPos.toArray()}
        castShadow
        receiveShadow
        scale={1}
      />
    </>
  );
}




