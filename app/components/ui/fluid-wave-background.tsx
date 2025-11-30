"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Settings, X } from "lucide-react"

interface FluidWaveControls {
  animationSpeed: number
  waveSpeedX: number
  waveSpeedY: number
  waveFrequency1: number
  waveFrequency2: number
  waveFrequency3: number
  noiseAmount: number
  noiseScale: number
  distortAmount: number
  distortFrequency: number
  bandThreshold: number
  bandSharpness: number
  posterizationLevels: number
  ditherIntensity: number
  colorIntensity: number
  darkness: number
}

function FluidWaveShader({ controls }: { controls: FluidWaveControls }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uAnimationSpeed: { value: controls.animationSpeed },
      uWaveSpeedX: { value: controls.waveSpeedX },
      uWaveSpeedY: { value: controls.waveSpeedY },
      uWaveFrequency1: { value: controls.waveFrequency1 },
      uWaveFrequency2: { value: controls.waveFrequency2 },
      uWaveFrequency3: { value: controls.waveFrequency3 },
      uNoiseAmount: { value: controls.noiseAmount },
      uNoiseScale: { value: controls.noiseScale },
      uDistortAmount: { value: controls.distortAmount },
      uDistortFrequency: { value: controls.distortFrequency },
      uBandThreshold: { value: controls.bandThreshold },
      uBandSharpness: { value: controls.bandSharpness },
      uPosterizationLevels: { value: controls.posterizationLevels },
      uDitherIntensity: { value: controls.ditherIntensity },
      uColorIntensity: { value: controls.colorIntensity },
      uDarkness: { value: controls.darkness },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useMemo(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uAnimationSpeed.value = controls.animationSpeed
      material.uniforms.uWaveSpeedX.value = controls.waveSpeedX
      material.uniforms.uWaveSpeedY.value = controls.waveSpeedY
      material.uniforms.uWaveFrequency1.value = controls.waveFrequency1
      material.uniforms.uWaveFrequency2.value = controls.waveFrequency2
      material.uniforms.uWaveFrequency3.value = controls.waveFrequency3
      material.uniforms.uNoiseAmount.value = controls.noiseAmount
      material.uniforms.uNoiseScale.value = controls.noiseScale
      material.uniforms.uDistortAmount.value = controls.distortAmount
      material.uniforms.uDistortFrequency.value = controls.distortFrequency
      material.uniforms.uBandThreshold.value = controls.bandThreshold
      material.uniforms.uBandSharpness.value = controls.bandSharpness
      material.uniforms.uPosterizationLevels.value = controls.posterizationLevels
      material.uniforms.uDitherIntensity.value = controls.ditherIntensity
      material.uniforms.uColorIntensity.value = controls.colorIntensity
      material.uniforms.uDarkness.value = controls.darkness
    }
  }, [controls])

  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uAnimationSpeed;
    uniform float uWaveSpeedX;
    uniform float uWaveSpeedY;
    uniform float uWaveFrequency1;
    uniform float uWaveFrequency2;
    uniform float uWaveFrequency3;
    uniform float uNoiseAmount;
    uniform float uNoiseScale;
    uniform float uDistortAmount;
    uniform float uDistortFrequency;
    uniform float uBandThreshold;
    uniform float uBandSharpness;
    uniform float uPosterizationLevels;
    uniform float uDitherIntensity;
    uniform float uColorIntensity;
    uniform float uDarkness;
    varying vec2 vUv;
    
    float dither8x8(vec2 position, float brightness) {
      int x = int(mod(position.x, 8.0));
      int y = int(mod(position.y, 8.0));
      int index = x + y * 8;
      float limit = 0.0;
      
      if (x < 8) {
        if (index == 0) limit = 0.0;
        if (index == 1) limit = 32.0;
        if (index == 2) limit = 8.0;
        if (index == 3) limit = 40.0;
        if (index == 4) limit = 2.0;
        if (index == 5) limit = 34.0;
        if (index == 6) limit = 10.0;
        if (index == 7) limit = 42.0;
        if (index == 8) limit = 48.0;
        if (index == 9) limit = 16.0;
        if (index == 10) limit = 56.0;
        if (index == 11) limit = 24.0;
        if (index == 12) limit = 50.0;
        if (index == 13) limit = 18.0;
        if (index == 14) limit = 58.0;
        if (index == 15) limit = 26.0;
        if (index == 16) limit = 12.0;
        if (index == 17) limit = 44.0;
        if (index == 18) limit = 4.0;
        if (index == 19) limit = 36.0;
        if (index == 20) limit = 14.0;
        if (index == 21) limit = 46.0;
        if (index == 22) limit = 6.0;
        if (index == 23) limit = 38.0;
        if (index == 24) limit = 60.0;
        if (index == 25) limit = 28.0;
        if (index == 26) limit = 52.0;
        if (index == 27) limit = 20.0;
        if (index == 28) limit = 62.0;
        if (index == 29) limit = 30.0;
        if (index == 30) limit = 54.0;
        if (index == 31) limit = 22.0;
        if (index == 32) limit = 3.0;
        if (index == 33) limit = 35.0;
        if (index == 34) limit = 11.0;
        if (index == 35) limit = 43.0;
        if (index == 36) limit = 1.0;
        if (index == 37) limit = 33.0;
        if (index == 38) limit = 9.0;
        if (index == 39) limit = 41.0;
        if (index == 40) limit = 51.0;
        if (index == 41) limit = 19.0;
        if (index == 42) limit = 59.0;
        if (index == 43) limit = 27.0;
        if (index == 44) limit = 49.0;
        if (index == 45) limit = 17.0;
        if (index == 46) limit = 57.0;
        if (index == 47) limit = 25.0;
        if (index == 48) limit = 15.0;
        if (index == 49) limit = 47.0;
        if (index == 50) limit = 7.0;
        if (index == 51) limit = 39.0;
        if (index == 52) limit = 13.0;
        if (index == 53) limit = 45.0;
        if (index == 54) limit = 5.0;
        if (index == 55) limit = 37.0;
        if (index == 56) limit = 63.0;
        if (index == 57) limit = 31.0;
        if (index == 58) limit = 55.0;
        if (index == 59) limit = 23.0;
        if (index == 60) limit = 61.0;
        if (index == 61) limit = 29.0;
        if (index == 62) limit = 53.0;
        if (index == 63) limit = 21.0;
      }
      
      return brightness < limit / 64.0 ? 0.0 : 1.0;
    }
    
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
    
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }
    
    void main() {
      vec2 uv = vUv;
      
      float t = uTime * uAnimationSpeed;
      
      vec2 p = uv;
      p.x += t * uWaveSpeedX;
      p.y += t * uWaveSpeedY;
      
      float wave1 = sin(p.y * uWaveFrequency1 + p.x * uWaveFrequency1 * 0.7 + t);
      float wave2 = sin(p.x * uWaveFrequency2 + p.y * uWaveFrequency2 * 0.6 - t * 1.1);
      float wave3 = sin((p.x + p.y) * uWaveFrequency3 * 0.7 + t * 0.8);
      
      vec2 noiseCoord = p * uNoiseScale + vec2(t * 0.3, t * 0.5);
      float n = fbm(noiseCoord) * uNoiseAmount;
      
      float wave = (wave1 * 0.4 + wave2 * 0.35 + wave3 * 0.25);
      wave += n;
      
      vec2 distort = vec2(
        sin(p.y * uDistortFrequency + p.x * uDistortFrequency * 0.8 + t * 0.6) * uDistortAmount,
        cos(p.x * uDistortFrequency + p.y * uDistortFrequency * 0.7 - t * 0.4) * uDistortAmount
      );
      
      vec2 distortedUv = uv + distort;
      float distortedWave = sin(distortedUv.y * uWaveFrequency2 * 1.2 + distortedUv.x * uWaveFrequency2 * 0.9 + t);
      
      wave = mix(wave, distortedWave, 0.15);
      
      float waveNormalized = wave * 0.5 + 0.5;
      
      float thresholdRange = 0.02;
      float band = smoothstep(uBandThreshold - thresholdRange, uBandThreshold + thresholdRange, waveNormalized);
      band = pow(band, uBandSharpness);
      
      // Create colorful waves that blend naturally with the wave pattern
      // Use wave values to influence color, not just position
      float hueBase = mod(p.x * 0.15 + p.y * 0.2 + t * 0.1, 1.0);
      float hueVariation = wave * 0.3; // Use wave pattern to vary hue
      float hue = mod(hueBase + hueVariation, 1.0);
      
      // Create color that follows the wave pattern intensity
      // Vercel-like: cooler, more cybernetic colors (blue/cyan/purple)
      float colorStrength = abs(wave); 
      vec3 colorfulWave = vec3(
        0.5 + 0.5 * sin(hue * 6.28318 + 3.5), // Blue bias
        0.5 + 0.5 * sin(hue * 6.28318 + 3.0), // Cyan bias
        0.5 + 0.5 * sin(hue * 6.28318 + 4.5)  // Purple bias
      );
      
      colorfulWave *= (0.4 + colorStrength * 0.6);
      
      vec3 monoColor1 = vec3(1.0, 1.0, 1.0);
      vec3 monoColor2 = vec3(0.1, 0.1, 0.15); // Darker base
      vec3 monoWave = mix(monoColor2, monoColor1, band);
      
      vec3 waveColor = mix(monoWave, colorfulWave, band * uColorIntensity);
      
      vec3 bgColor = vec3(0.02, 0.03, 0.05); // Very dark blue-black
      vec3 color = mix(bgColor, waveColor, band * (1.0 - uDarkness));
      
      // Posterization
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      gray = floor(gray * uPosterizationLevels) / uPosterizationLevels;
      
      // Apply posterization to color channels
      vec3 posterizedColor = vec3(
        floor(color.r * uPosterizationLevels) / uPosterizationLevels,
        floor(color.g * uPosterizationLevels) / uPosterizationLevels,
        floor(color.b * uPosterizationLevels) / uPosterizationLevels
      );
      
      // Dithering
      vec2 ditherCoord = gl_FragCoord.xy / 4.0;
      float dithered = dither8x8(ditherCoord, gray);
      vec3 ditheredColor = mix(vec3(0.0), posterizedColor, dithered * uDitherIntensity);
      
      gl_FragColor = vec4(ditheredColor, 1.0);
    }
  `

  // Random seed for animation start position
  const timeOffset = useMemo(() => Math.random() * 1000, [])

  // Update resolution on resize
  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uResolution.value.set(size.width, size.height)
    }
  }, [size.width, size.height])

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = state.clock.elapsedTime + timeOffset
    }
  })

  // Scale plane to match viewport aspect ratio
  const aspect = useMemo(() => size.width / size.height, [size.width, size.height])
  
  // Update mesh scale when aspect ratio changes
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.x = aspect
    }
  }, [aspect])
  
  return (
    <mesh ref={meshRef} scale={[aspect, 1, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  )
}

export function FluidWaveBackground() {
  const [showControls, setShowControls] = useState(false)
  const [controls, setControls] = useState<FluidWaveControls>({
    animationSpeed: 0.05, 
    waveSpeedX: 0.02,
    waveSpeedY: 0.01,
    waveFrequency1: 5.0, // Increased from 3.0 for smaller waves (zoomed out look)
    waveFrequency2: 6.0, // Increased from 4.0
    waveFrequency3: 7.0, // Increased from 5.0
    noiseAmount: 0.3,
    noiseScale: 2.0,
    distortAmount: 0.2,
    distortFrequency: 2.0,
    bandThreshold: 0.6,
    bandSharpness: 1.2,
    posterizationLevels: 16.0,
    ditherIntensity: 0.5,
    colorIntensity: 0.4,
    darkness: 0.6,
  })

  const updateControl = (key: keyof FluidWaveControls, value: number) => {
    setControls((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="absolute inset-0 bg-black" style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
        <FluidWaveShader controls={controls} />
      </Canvas>

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

      {showControls && (
        <div className="absolute top-36 right-4 z-50 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-6 w-80 max-h-[70vh] overflow-y-auto custom-scrollbar shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold text-lg">Wave Controls</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setControls({
                animationSpeed: 0.05, 
                waveSpeedX: 0.02,
                waveSpeedY: 0.01,
                waveFrequency1: 5.0,
                waveFrequency2: 6.0,
                waveFrequency3: 7.0,
                noiseAmount: 0.3,
                noiseScale: 2.0,
                distortAmount: 0.2,
                distortFrequency: 2.0,
                bandThreshold: 0.6,
                bandSharpness: 1.2,
                posterizationLevels: 16.0,
                ditherIntensity: 0.5,
                colorIntensity: 0.4,
                darkness: 0.6,
              })}
              className="h-6 text-xs text-gray-400 hover:text-white"
            >
              Reset
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white text-sm">Animation Speed: {controls.animationSpeed.toFixed(3)}</Label>
              <Slider
                value={[controls.animationSpeed]}
                onValueChange={([value]) => updateControl("animationSpeed", value)}
                min={0}
                max={0.2}
                step={0.001}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Wave Speed X: {controls.waveSpeedX.toFixed(3)}</Label>
              <Slider
                value={[controls.waveSpeedX]}
                onValueChange={([value]) => updateControl("waveSpeedX", value)}
                min={-0.1}
                max={0.1}
                step={0.001}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Wave Speed Y: {controls.waveSpeedY.toFixed(3)}</Label>
              <Slider
                value={[controls.waveSpeedY]}
                onValueChange={([value]) => updateControl("waveSpeedY", value)}
                min={-0.1}
                max={0.1}
                step={0.001}
                className="w-full"
              />
            </div>

            <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-3 text-sm text-gray-400">Frequencies (Zoom)</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Frequency 1: {controls.waveFrequency1.toFixed(1)}</Label>
                  <Slider
                    value={[controls.waveFrequency1]}
                    onValueChange={([value]) => updateControl("waveFrequency1", value)}
                    min={0.1}
                    max={20.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Frequency 2: {controls.waveFrequency2.toFixed(1)}</Label>
                  <Slider
                    value={[controls.waveFrequency2]}
                    onValueChange={([value]) => updateControl("waveFrequency2", value)}
                    min={0.1}
                    max={20.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Frequency 3: {controls.waveFrequency3.toFixed(1)}</Label>
                  <Slider
                    value={[controls.waveFrequency3]}
                    onValueChange={([value]) => updateControl("waveFrequency3", value)}
                    min={0.1}
                    max={20.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-3 text-sm text-gray-400">Distortion & Noise</h4>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                  <Label className="text-white text-sm">Noise Amount: {controls.noiseAmount.toFixed(2)}</Label>
                  <Slider
                    value={[controls.noiseAmount]}
                    onValueChange={([value]) => updateControl("noiseAmount", value)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Distort Amount: {controls.distortAmount.toFixed(2)}</Label>
                  <Slider
                    value={[controls.distortAmount]}
                    onValueChange={([value]) => updateControl("distortAmount", value)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-3 text-sm text-gray-400">Appearance</h4>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Band Threshold: {controls.bandThreshold.toFixed(2)}</Label>
                  <Slider
                    value={[controls.bandThreshold]}
                    onValueChange={([value]) => updateControl("bandThreshold", value)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white text-sm">Color Intensity: {controls.colorIntensity.toFixed(2)}</Label>
                  <Slider
                    value={[controls.colorIntensity]}
                    onValueChange={([value]) => updateControl("colorIntensity", value)}
                    min={0}
                    max={2}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                 <div className="space-y-2">
                  <Label className="text-white text-sm">Darkness: {controls.darkness.toFixed(2)}</Label>
                  <Slider
                    value={[controls.darkness]}
                    onValueChange={([value]) => updateControl("darkness", value)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
