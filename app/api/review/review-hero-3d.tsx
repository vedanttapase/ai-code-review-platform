"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Code2, ArrowRight } from 'lucide-react'

export default function ReviewHero3D() {
  return (
    <div className="relative w-full h-[85vh] bg-[#060709] text-white overflow-hidden rounded-2xl border border-white/[0.03] shadow-2xl flex items-center justify-center">
      
      {/* Cinematic Ambient Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] animate-pulse [animation-delay:3s]" />
      </div>

      {/* Futuristic 3D Cyber Grid Background */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" style={{ transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'top' }} />

      {/* Hardware-Accelerated 3D Floating Geometry Core */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none" style={{ perspective: '1200px' }}>
        <motion.div 
          animate={{ 
            rotateX: [15, 25, 15], 
            rotateY: [0, 360],
            scale: [1, 1.03, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-[450px] h-[450px] border border-purple-500/20 rounded-full shadow-[0_0_80px_rgba(168,85,247,0.15)] flex items-center justify-center"
        >
          {/* Multi-axis Orbital Intersecting Rings */}
          <div className="absolute w-[400px] h-[400px] border border-dashed border-blue-500/30 rounded-full" style={{ transform: 'rotateY(70deg)' }} />
          <div className="absolute w-[350px] h-[350px] border border-zinc-700/50 rounded-full" style={{ transform: 'rotateX(65deg)' }} />
          <div className="absolute w-[280px] h-[280px] border border-purple-500/40 rounded-full" style={{ transform: 'rotateY(30deg)' }} />
          
          {/* Hyper-Glow Plasma Core */}
          <div className="w-40 h-40 bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 rounded-full opacity-25 blur-xl animate-pulse" />
          <div className="absolute w-12 h-12 bg-white rounded-full opacity-10 blur-sm shadow-[0_0_30px_#fff]" />
        </motion.div>
      </div>

      {/* High-End Glassmorphism Floating UI Overlays */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-12 bg-gradient-to-t from-[#060709] via-transparent to-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl text-left"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium tracking-wider text-purple-400 uppercase rounded-full bg-purple-500/10 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Code2 className="w-3 h-3 animate-spin [animation-duration:4s]" /> Next-Gen Code Intelligence
          </span>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight md:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
            Autonomous <br/>AI Code Review.
          </h1>
          <p className="mt-4 text-lg text-zinc-400 leading-relaxed max-w-lg">
            Upload repositories, inspect vulnerabilities, and refactor lines instantaneously using multi-agent intelligence.
          </p>
        </motion.div>

        {/* Dynamic Action Input Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-2xl p-3 rounded-xl border border-white/[0.06] bg-zinc-900/30 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] self-center flex items-center gap-3 transition-all hover:border-purple-500/20"
        >
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Paste your public/private GitHub repository URL..." 
              className="w-full bg-zinc-950/40 border border-white/[0.03] rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <button className="group relative overflow-hidden bg-white text-black font-semibold text-sm px-6 py-3 rounded-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-300 flex items-center gap-2">
            <span>Analyze Repo</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
