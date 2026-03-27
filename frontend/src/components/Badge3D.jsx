import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function BadgeMesh({ type = "accuracy" }) {
	const ref = useRef();
	useFrame((state, delta) => {
		if (ref.current) ref.current.rotation.y += delta * 0.9; // rotate around Y
	});

	// Simple procedural shapes for each badge type
	if (type === "accuracy") {
		return (
			<group ref={ref}>
				<mesh rotation={[Math.PI / 2, 0, 0]}>
					<torusGeometry args={[0.6, 0.12, 16, 64]} />
					<meshStandardMaterial
						color="#4ECDC4"
						metalness={0.6}
						roughness={0.3}
					/>
				</mesh>
				<mesh position={[0, 0, 0]}>
					<cylinderGeometry args={[0.06, 0.06, 0.8, 20]} />
					<meshStandardMaterial
						color="#083344"
						metalness={0.3}
						roughness={0.4}
					/>
				</mesh>
			</group>
		);
	}

	if (type === "streak") {
		return (
			<group ref={ref}>
				<mesh position={[0, -0.05, 0]}>
					<coneGeometry args={[0.45, 1.0, 20]} />
					<meshStandardMaterial
						color="#f97316"
						emissive="#ffb47a"
						metalness={0.2}
						roughness={0.5}
					/>
				</mesh>
				<mesh position={[0, -0.55, 0]} rotation={[Math.PI, 0, 0]}>
					<sphereGeometry args={[0.18, 16, 12]} />
					<meshStandardMaterial
						color="#ffc79c"
						metalness={0.1}
						roughness={0.6}
					/>
				</mesh>
			</group>
		);
	}

	// volume (played card count) -> stack of thin boxes
	return (
		<group ref={ref}>
			<mesh position={[0, -0.15, 0]}>
				<boxGeometry args={[0.9, 0.06, 0.6]} />
				<meshStandardMaterial color="#9B59B6" metalness={0.4} roughness={0.4} />
			</mesh>
			<mesh position={[0, 0.02, 0]}>
				<boxGeometry args={[0.8, 0.06, 0.55]} />
				<meshStandardMaterial color="#a87dcf" metalness={0.2} roughness={0.5} />
			</mesh>
			<mesh position={[0, 0.38, 0]}>
				<boxGeometry args={[0.7, 0.06, 0.5]} />
				<meshStandardMaterial color="#c39be3" metalness={0.1} roughness={0.6} />
			</mesh>
		</group>
	);
}

export default function Badge3D({ type = "accuracy" }) {
	return (
		<Canvas
			style={{ width: "100%", height: "100%", borderRadius: "50%" }}
			dpr={[1, 1.5]}
			camera={{ position: [0, 0, 3], fov: 50 }}
		>
			<ambientLight intensity={0.6} />
			<directionalLight position={[5, 5, 5]} intensity={0.9} />
			<directionalLight position={[-5, -5, -5]} intensity={0.4} />
			<BadgeMesh type={type} />
		</Canvas>
	);
}
