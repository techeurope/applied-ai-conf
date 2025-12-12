"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LidarGridBackgroundProps {
  gridColor: string;
}

function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

export function LidarGridBackground({ gridColor }: LidarGridBackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = hexToThreeColor(gridColor);

  const uniforms = useRef({
    uTime: { value: 0 },
    uSpeed: { value: 0.004 },
    uNoiseScale: { value: 0.07 },
    uNoiseStrength: { value: 1.7 },
    uGridSize: { value: 41.0 },
    uLineThickness: { value: 0.01 },
    uColor: { value: color },
    uGlowIntensity: { value: 2.0 },
    uFogDensity: { value: 0.9 },
  });

  useEffect(() => {
    uniforms.current.uColor.value = hexToThreeColor(gridColor);
  }, [gridColor]);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const vertexShader = `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;
    
    varying vec2 vUv;
    varying float vElevation;
    varying float vDistance;

    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      float scrollY = uTime * uSpeed;
      float noiseInputX = pos.x * uNoiseScale;
      float noiseInputY = (pos.y + scrollY) * uNoiseScale;
      float elevation = snoise(vec2(noiseInputX, noiseInputY));
      pos.z += elevation * uNoiseStrength;
      vElevation = elevation;
      vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
      vDistance = -viewPosition.z;
      gl_Position = projectionMatrix * viewPosition;
    }
  `;

  const fragmentShader = `
    uniform float uGridSize;
    uniform float uLineThickness;
    uniform vec3 uColor;
    uniform float uGlowIntensity;
    uniform float uFogDensity;
    uniform float uTime;
    uniform float uSpeed;
    
    varying vec2 vUv;
    varying float vElevation;
    varying float vDistance;

    void main() {
      float scrollY = uTime * uSpeed;
      vec2 gridUv = vUv * uGridSize;
      gridUv.y += scrollY * uGridSize;
      vec2 grid = abs(fract(gridUv - 0.5) - 0.5) / fwidth(gridUv);
      float line = min(grid.x, grid.y);
      float lineStrength = 1.0 - min(line, 1.0);
      lineStrength = smoothstep(0.0, uLineThickness, lineStrength);
      vec3 finalColor = uColor;
      finalColor += vec3(vElevation * 0.5);
      finalColor *= lineStrength;
      finalColor *= uGlowIntensity;
      float fogFactor = smoothstep(0.0, 1.0 / uFogDensity, vDistance * 0.05);
      float opacity = (1.0 - fogFactor) * lineStrength;
      float vignette = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
      opacity *= vignette;
      gl_FragColor = vec4(finalColor, opacity);
    }
  `;

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2.5, 0, 0]}
      position={[0, -2.5, -6]}
    >
      <planeGeometry args={[40, 40, 100, 100]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}



