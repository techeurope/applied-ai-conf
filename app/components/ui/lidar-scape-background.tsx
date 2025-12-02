"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface LidarControls {
  speed: number
  noiseScale: number
  noiseStrength: number
  gridSize: number
  lineThickness: number
  colorR: number
  colorG: number
  colorB: number
  glowIntensity: number
  fogDensity: number
  // New CSS-based "Push to Background" controls
  overlayOpacity: number 
  blurAmount: number 
}

function LidarGrid({ controls }: { controls: LidarControls }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: controls.speed },
      uNoiseScale: { value: controls.noiseScale },
      uNoiseStrength: { value: controls.noiseStrength },
      uGridSize: { value: controls.gridSize },
      uLineThickness: { value: controls.lineThickness },
      uColor: { value: new THREE.Color(controls.colorR, controls.colorG, controls.colorB) },
      uGlowIntensity: { value: controls.glowIntensity },
      uFogDensity: { value: controls.fogDensity },
    }),
    [controls.speed, controls.noiseScale, controls.noiseStrength, controls.gridSize, controls.lineThickness, controls.colorR, controls.colorG, controls.colorB, controls.glowIntensity, controls.fogDensity]
  )

  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uSpeed.value = controls.speed
      material.uniforms.uNoiseScale.value = controls.noiseScale
      material.uniforms.uNoiseStrength.value = controls.noiseStrength
      material.uniforms.uGridSize.value = controls.gridSize
      material.uniforms.uLineThickness.value = controls.lineThickness
      material.uniforms.uColor.value.setRGB(controls.colorR, controls.colorG, controls.colorB)
      material.uniforms.uGlowIntensity.value = controls.glowIntensity
      material.uniforms.uFogDensity.value = controls.fogDensity
    }
  }, [controls])

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  const vertexShader = `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;
    
    varying vec2 vUv;
    varying float vElevation;
    varying float vDistance;

    // Simplex 2D noise
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
      
      // Calculate position with scrolling effect
      vec3 pos = position;
      
      // Scroll the noise along Z axis
      float scrollY = uTime * uSpeed;
      float noiseInputX = pos.x * uNoiseScale;
      float noiseInputY = (pos.y + scrollY) * uNoiseScale; // Using y for plane forward direction
      
      // Get noise value
      float elevation = snoise(vec2(noiseInputX, noiseInputY));
      
      // Apply elevation to Z axis (up)
      pos.z += elevation * uNoiseStrength;
      
      vElevation = elevation;
      
      vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
      vDistance = -viewPosition.z;
      
      gl_Position = projectionMatrix * viewPosition;
    }
  `

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
      // Create grid pattern
      // Shift UVs to match the scrolling noise movement
      float scrollY = uTime * uSpeed;
      vec2 gridUv = vUv * uGridSize;
      gridUv.y += scrollY * uGridSize;
      
      // Grid lines
      vec2 grid = abs(fract(gridUv - 0.5) - 0.5) / fwidth(gridUv);
      float line = min(grid.x, grid.y);
      float lineStrength = 1.0 - min(line, 1.0);
      
      // Thicken lines
      lineStrength = smoothstep(0.0, uLineThickness, lineStrength);
      
      // Color based on elevation and base color
      vec3 finalColor = uColor;
      
      // Add brightness based on elevation (peaks are brighter)
      finalColor += vec3(vElevation * 0.5);
      
      // Apply grid pattern
      finalColor *= lineStrength;
      
      // Glow effect
      finalColor *= uGlowIntensity;
      
      // Fog - fade out in distance
      float fogFactor = smoothstep(0.0, 1.0 / uFogDensity, vDistance * 0.05); // Adjusted for better depth
      float opacity = (1.0 - fogFactor) * lineStrength;
      
      // Bottom/Top fade (vignette for the plane ends)
      float vignette = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
      opacity *= vignette;

      gl_FragColor = vec4(finalColor, opacity);
    }
  `

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, -5]}>
      {/* Large plane with many segments for smooth terrain */}
      <planeGeometry args={[40, 40, 100, 100]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

export function LidarScapeBackground() {
  const [controls] = useState<LidarControls>({
    speed: 0.004,
    noiseScale: 0.07,
    noiseStrength: 1.7,
    gridSize: 41.0,
    lineThickness: 0.01,
    colorR: 0.67,
    colorG: 0.44,
    colorB: 0.19,
    glowIntensity: 2.0,
    fogDensity: 0.90,
    overlayOpacity: 0.44, // New: Start with a subtle dim
    blurAmount: 0,       // New: Start with no blur
  })

  // const updateControl = (key: keyof LidarControls, value: number) => {
  //   setControls((prev) => ({ ...prev, [key]: value }))
  // }

  return (
    <div className="absolute inset-0 bg-black w-full h-full">
      {/* 1. The WebGL Canvas (The Animation) */}
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <LidarGrid controls={controls} />
      </Canvas>

      {/* 2. The CSS Filters Layer (Push to Background) */}
      {/* This sits on top of the canvas but behind the content, dimming/blurring the waves */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-300 ease-out"
        style={{
          backgroundColor: `rgba(0,0,0, ${controls.overlayOpacity})`,
          backdropFilter: `blur(${controls.blurAmount}px)`,
          WebkitBackdropFilter: `blur(${controls.blurAmount}px)`,
        }}
      />

      {/* Controls Toggle (Hidden)
      <div className="absolute top-24 right-4 z-50 pointer-events-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowControls(!showControls)}
          className="bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70 transition-colors"
        >
          {showControls ? <X className="h-4 w-4 text-white" /> : <Settings className="h-4 w-4 text-white" />}
        </Button>
      </div>
      */}

      {/* Controls Panel (Hidden - commented out) */}
      {/* 
      {showControls && (
        <div className="absolute top-36 right-4 z-50 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-6 w-80 max-h-[70vh] overflow-y-auto custom-scrollbar shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold text-lg">Lidar Controls</h3>
            <Button 
              variant="ghost" 
              onClick={() => setControls({
                speed: 0.004,
                noiseScale: 0.07,
                noiseStrength: 1.7,
                gridSize: 41.0,
                lineThickness: 0.01,
                colorR: 0.67,
                colorG: 0.44,
                colorB: 0.19,
                glowIntensity: 2.0,
                fogDensity: 0.90,
                overlayOpacity: 0.2,
                blurAmount: 0,
              })}
              className="h-6 text-xs text-gray-400 hover:text-white"
            >
              Reset
            </Button>
          </div>

          <div className="space-y-6">
            <div className="border-b border-white/20 pb-6 mb-2">
              <h4 className="text-white font-medium mb-3 text-sm text-emerald-400">Background Visibility</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Dim (Opacity): {controls.overlayOpacity.toFixed(2)}</Label>
                  <Slider
                    value={[controls.overlayOpacity]}
                    onValueChange={([value]) => updateControl("overlayOpacity", value)}
                    min={0}
                    max={0.95}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-[10px] text-gray-400">Darkens the animation to let text pop</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Speed: {controls.speed.toFixed(3)}</Label>
              <Slider
                value={[controls.speed]}
                onValueChange={([value]) => updateControl("speed", value)}
                min={0}
                max={0.2}
                step={0.001}
                className="w-full"
              />
            </div>

            <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-3 text-sm text-gray-400">Terrain</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Noise Scale: {controls.noiseScale.toFixed(2)}</Label>
                  <Slider
                    value={[controls.noiseScale]}
                    onValueChange={([value]) => updateControl("noiseScale", value)}
                    min={0.01}
                    max={1.0}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white text-sm">Peak Height: {controls.noiseStrength.toFixed(1)}</Label>
                  <Slider
                    value={[controls.noiseStrength]}
                    onValueChange={([value]) => updateControl("noiseStrength", value)}
                    min={0}
                    max={5.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-3 text-sm text-gray-400">Grid</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Grid Size: {controls.gridSize.toFixed(1)}</Label>
                  <Slider
                    value={[controls.gridSize]}
                    onValueChange={([value]) => updateControl("gridSize", value)}
                    min={5.0}
                    max={100.0}
                    step={1.0}
                    className="w-full"
                  />
                </div>
                 <div className="space-y-2">
                  <Label className="text-white text-sm">Line Thickness: {controls.lineThickness.toFixed(2)}</Label>
                  <Slider
                    value={[controls.lineThickness]}
                    onValueChange={([value]) => updateControl("lineThickness", value)}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-3 text-sm text-gray-400">Atmosphere</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Glow: {controls.glowIntensity.toFixed(1)}</Label>
                  <Slider
                    value={[controls.glowIntensity]}
                    onValueChange={([value]) => updateControl("glowIntensity", value)}
                    min={0}
                    max={5.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                 <div className="space-y-2">
                  <Label className="text-white text-sm">Fog Density: {controls.fogDensity.toFixed(2)}</Label>
                  <Slider
                    value={[controls.fogDensity]}
                    onValueChange={([value]) => updateControl("fogDensity", value)}
                    min={0.01}
                    max={1.0}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
             <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-3 text-sm text-gray-400">Color</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-white text-sm">Red: {controls.colorR.toFixed(2)}</Label>
                   <Slider value={[controls.colorR]} onValueChange={([v]) => updateControl("colorR", v)} min={0} max={1} step={0.01} />
                </div>
                <div className="space-y-2">
                   <Label className="text-white text-sm">Green: {controls.colorG.toFixed(2)}</Label>
                   <Slider value={[controls.colorG]} onValueChange={([v]) => updateControl("colorG", v)} min={0} max={1} step={0.01} />
                </div>
                <div className="space-y-2">
                   <Label className="text-white text-sm">Blue: {controls.colorB.toFixed(2)}</Label>
                   <Slider value={[controls.colorB]} onValueChange={([v]) => updateControl("colorB", v)} min={0} max={1} step={0.01} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  )
}
