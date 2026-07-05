"use main"
import React, { useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from "@react-three/drei"
import { motion } from "framer-motion"
import * as THREE from "three"

// 3D Animated Blob representing "AI Core Network"
function AnimatedCore() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Rotate and distort the 3D mesh dynamically over time
  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    meshRef.current.rotation.x = Math.sin(time / 4) * 0.2
    meshRef.current.rotation.y = time * 0.15
  })

  return (
    <Float speed={3} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere
        ref={meshRef}
        args={[1.6, 64, 64]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={hovered ? "#a855f7" : "#3b82f6"} // Morphing Purple & Blue
          attach="material"
          distort={0.4}
          speed={4}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>
    </Float>
  )
}

// Particle field flowing behind the 3D scene
function ParticleField({ count = 150 }) {
  const points = useRef<THREE.Points>(null)
  
  const particlesPosition = React.useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  }, [count])

  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.getElapsedTime() * 0.02
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition, 3]}
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a855f7" sizeAttenuation depthWrite={false} transparent opacity={0.6} />
    </points>
  )
}

export default function ReviewHero3D() {
  return (
    <div className="relative w-full h-[85vh] bg-[#0b0c0e] text-white overflow-hidden rounded-2xl border border-white/[0.05] shadow-2xl">
      {/* Three.js 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#a855f7" />
          <directionalLight position={[-5, 5, 2]} intensity={1} color="#3b82f6" />
          
          <AnimatedCore />
          <ParticleField count={200} />
          
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Floating UI Layer utilizing 3D Card tilting styles */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-12 bg-gradient-to-t from-[#0b0c0e] via-transparent to-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-purple-400 uppercase rounded-full bg-purple-500/10 border border-purple-500/20">
            Next-Gen Code Intelligence
          </span>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            Autonomous <br/>AI Code Review.
          </h1>
          <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
            Upload repositories, inspect vulnerabilities, and refactor lines instantaneously using multi-agent intelligence.
          </p>
        </motion.div>

        {/* Action Panel: Interactive Glass Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-2xl p-6 rounded-xl border border-white/[0.08] bg-zinc-900/40 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.05)] self-center flex items-center gap-4"
        >
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Paste your public/private GitHub repository URL..." 
              className="w-full bg-zinc-950/60 border border-white/[0.05] rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <button className="relative group overflow-hidden bg-white text-black font-medium text-sm px-6 py-3 rounded-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300">
            <span className="relative z-10 flex items-center gap-2">
              Analyze Architecture
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-purple-500 to-blue-500 transition-transform duration-500 ease-out z-0 opacity-20" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
