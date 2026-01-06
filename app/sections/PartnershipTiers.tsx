"use client";

import Link from "next/link";
import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Platinum shader - Molten Silver (Same logic as Gold but Silver)
function PlatinumShader() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;
    
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    void main() {
      vec2 uv = vUv;
      float t = uTime * 0.2;
      
      // Layered noise for smooth liquid texture (same as Gold but offsets changed for "different seed" feel)
      float n1 = noise(uv * 3.0 + vec2(t * 0.5 + 10.0, t + 5.0)); // Added offsets
      float n2 = noise(uv * 6.0 - vec2(t + 2.0, t * 0.8 + 3.0));
      
      // Combine to create a metallic surface map
      // Modified frequency slightly to look different
      float metal = 0.5 + 0.5 * sin(uv.x * 3.5 + uv.y * 3.5 + n1 * 2.0 + n2 + t);
      
      // Sharp specular highlight for shine
      float shine = pow(metal, 5.0);
      
      // Platinum/Silver color palette
      vec3 darkSilver = vec3(0.1, 0.12, 0.15);
      vec3 mainSilver = vec3(0.5, 0.55, 0.6); 
      vec3 brightSilver = vec3(0.9, 0.9, 1.0);
      
      // Mix colors based on "metal" value
      vec3 col = mix(darkSilver, mainSilver, metal);
      col += brightSilver * shine * 0.7; // Additive shine, slightly stronger
      
      // Cool glow for Platinum
      col += vec3(0.05, 0.1, 0.15) * 0.2;

      // Vignette
      float vignette = 1.0 - length(uv - 0.5) * 0.6;
      col *= vignette;
      
      gl_FragColor = vec4(col, 0.5 + shine * 0.3); 
    }
  `;

  const timeOffset = useMemo(() => Math.random() * 1000, []);

  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime + timeOffset;
    }
  });

  const aspect = useMemo(
    () => size.width / size.height,
    [size.width, size.height]
  );

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.x = aspect;
    }
  }, [aspect]);

  return (
    <mesh ref={meshRef} scale={[aspect, 1, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

// Gold shader - molten/shiny metallic effect (Static)
function GoldShader() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 15.0 }, // Fixed time for a good static snapshot
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;
    
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    void main() {
      vec2 uv = vUv;
      float t = uTime * 0.2;
      
      // Layered noise for smooth liquid texture
      float n1 = noise(uv * 3.0 + vec2(t * 0.5, t));
      float n2 = noise(uv * 6.0 - vec2(t, t * 0.8));
      
      // Combine to create a metallic surface map
      float metal = 0.5 + 0.5 * sin(uv.x * 4.0 + uv.y * 3.0 + n1 * 2.0 + n2 + t);
      
      // Sharp specular highlight for shine
      float shine = pow(metal, 5.0);
      
      // Gold color palette
      vec3 darkGold = vec3(0.2, 0.1, 0.01); // Darker base
      vec3 mainGold = vec3(0.6, 0.4, 0.05); // Darker main gold
      vec3 brightGold = vec3(0.9, 0.7, 0.4); // Slightly dimmer highlights
      
      // Mix colors based on "metal" value
      vec3 col = mix(darkGold, mainGold, metal);
      col += brightGold * shine * 0.8; // Additive shine
      
      // Vignette
      float vignette = 1.0 - length(uv - 0.5) * 0.6;
      col *= vignette;
      
      gl_FragColor = vec4(col, 0.5 + shine * 0.3); 
    }
  `;

  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  const aspect = useMemo(
    () => size.width / size.height,
    [size.width, size.height]
  );

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.x = aspect;
    }
  }, [aspect]);

  return (
    <mesh ref={meshRef} scale={[aspect, 1, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export default function PartnershipTiers() {
  return (
    <section
      id="tiers"
      className="relative overflow-hidden py-24 lg:py-32 min-h-screen flex flex-col justify-center"
    >
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-mono font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl text-glow">
            Partners
          </h2>
          <p className="mx-auto mt-6 text-lg text-gray-300 leading-relaxed max-w-2xl">
            Meet Europe&apos;s applied AI builders in one room. Get in front of founders, CTOs, and engineers shipping AI into real products.
          </p>
        </div>

        {/* What partners get */}
        <div className="mb-16 max-w-2xl mx-auto">
          <h3 className="text-xl font-mono font-bold text-white mb-6">What partners get</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              Brand visibility across the website, email, and on-site signage
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              Booth space to meet builders, customers, and hiring candidates
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              Optional workshop/demo slot (technical, relevant content)
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              A highly curated audience focused on production AI
            </li>
          </ul>
        </div>

        {/* Tier Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16 items-center">
          {/* Platinum Box - Spans 5 columns, Taller */}
          <div className="md:col-span-5 group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-white/60 bg-zinc-950/80 overflow-hidden transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_80px_rgba(255,255,255,0.3)] hover:scale-[1.02] hover:border-white min-h-[200px] md:min-h-[220px]">
            <div className="absolute inset-0 opacity-80">
              <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
                <PlatinumShader />
              </Canvas>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <h3 className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Platinum
              </h3>
            </div>
          </div>

          {/* Gold Box - Spans 4 columns */}
          <div className="md:col-span-4 group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-amber-500/40 bg-zinc-950/90 overflow-hidden transition-all duration-300 hover:shadow-[0_0_60px_rgba(245,158,11,0.25)] hover:scale-[1.02] hover:border-amber-500/60 min-h-[180px] md:min-h-[200px]">
            <div className="absolute inset-0 opacity-80">
              <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
                <GoldShader />
              </Canvas>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <h3 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Gold
              </h3>
            </div>
          </div>

          {/* Community Box - Spans 3 columns, Smaller */}
          <div className="md:col-span-3 group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-cyan-500/30 bg-transparent overflow-hidden transition-all duration-300 hover:shadow-[0_0_60px_rgba(34,211,238,0.15)] hover:scale-[1.02] hover:border-cyan-500/50 min-h-[140px] md:min-h-[160px]">
            <div className="relative z-10 flex flex-col items-center justify-center">
              <h3 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Community
              </h3>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://tally.so/r/Me1ZKM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              Become a partner
            </Link>
            <Link
              href="mailto:tim@techeurope.io?subject=Applied%20AI%20Conf%20-%20Sponsorship%20Deck%20Request"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-transparent px-10 text-lg font-semibold text-white transition-all hover:bg-white/5 hover:border-white/40"
            >
              Request sponsorship deck
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
