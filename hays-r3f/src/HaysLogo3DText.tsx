import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

const HaysLogo3D: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Text
          color="black"
          fontSize={3}
          maxWidth={200}
          lineHeight={1}
          textAlign="center"
          position={[0, 0, 0]}
        >
          HAYS
        </Text>
      </Suspense>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
};

export default HaysLogo3D;
