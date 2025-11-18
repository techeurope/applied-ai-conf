"use client"

import { useRef, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Settings } from "lucide-react"

interface ShaderControls {
  animationSpeed: number
  posterizationLevels: number
  waveDensity: number
  tunnelSize: number
  threshold: number
  ditherIntensity: number
  centerFadeSize: number
  waveCount: number
  colorWaveCount: number
  colorWaveThickness: number
  colorWaveSpeed: number
  colorWaveIntensity: number
}

function WaveShader({ controls }: { controls: ShaderControls }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uAnimationSpeed: { value: controls.animationSpeed },
      uPosterizationLevels: { value: controls.posterizationLevels },
      uWaveDensity: { value: controls.waveDensity },
      uTunnelSize: { value: controls.tunnelSize },
      uThreshold: { value: controls.threshold },
      uDitherIntensity: { value: controls.ditherIntensity },
      uCenterFadeSize: { value: controls.centerFadeSize },
      uWaveCount: { value: controls.waveCount },
      uColorWaveCount: { value: controls.colorWaveCount },
      uColorWaveThickness: { value: controls.colorWaveThickness },
      uColorWaveSpeed: { value: controls.colorWaveSpeed },
      uColorWaveIntensity: { value: controls.colorWaveIntensity },
    }),
    [controls],
  )

  useMemo(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uAnimationSpeed.value = controls.animationSpeed
      material.uniforms.uPosterizationLevels.value = controls.posterizationLevels
      material.uniforms.uWaveDensity.value = controls.waveDensity
      material.uniforms.uTunnelSize.value = controls.tunnelSize
      material.uniforms.uThreshold.value = controls.threshold
      material.uniforms.uDitherIntensity.value = controls.ditherIntensity
      material.uniforms.uCenterFadeSize.value = controls.centerFadeSize
      material.uniforms.uWaveCount.value = controls.waveCount
      material.uniforms.uColorWaveCount.value = controls.colorWaveCount
      material.uniforms.uColorWaveThickness.value = controls.colorWaveThickness
      material.uniforms.uColorWaveSpeed.value = controls.colorWaveSpeed
      material.uniforms.uColorWaveIntensity.value = controls.colorWaveIntensity
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
    uniform float uPosterizationLevels;
    uniform float uWaveDensity;
    uniform float uTunnelSize;
    uniform float uThreshold;
    uniform float uDitherIntensity;
    uniform float uCenterFadeSize;
    uniform float uWaveCount;
    uniform float uColorWaveCount;
    uniform float uColorWaveThickness;
    uniform float uColorWaveSpeed;
    uniform float uColorWaveIntensity;
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
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float hash(float n) {
      return fract(sin(n) * 43758.5453123);
    }
    
    vec3 getColorForWave(float index) {
      float hue = fract(index * 0.381966);
      
      vec3 color;
      if (hue < 0.166) {
        color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), hue * 6.0);
      } else if (hue < 0.333) {
        color = mix(vec3(1.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0), (hue - 0.166) * 6.0);
      } else if (hue < 0.5) {
        color = mix(vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 1.0), (hue - 0.333) * 6.0);
      } else if (hue < 0.666) {
        color = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 0.0, 1.0), (hue - 0.5) * 6.0);
      } else if (hue < 0.833) {
        color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 1.0), (hue - 0.666) * 6.0);
      } else {
        color = mix(vec3(1.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), (hue - 0.833) * 6.0);
      }
      
      return color;
    }
    
    vec3 getColorForLine(float index) {
      float hue = fract(index * 0.381966);
      
      vec3 color;
      if (hue < 0.166) {
        color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), hue * 6.0);
      } else if (hue < 0.333) {
        color = mix(vec3(1.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0), (hue - 0.166) * 6.0);
      } else if (hue < 0.5) {
        color = mix(vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 1.0), (hue - 0.333) * 6.0);
      } else if (hue < 0.666) {
        color = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 0.0, 1.0), (hue - 0.5) * 6.0);
      } else if (hue < 0.833) {
        color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 1.0), (hue - 0.666) * 6.0);
      } else {
        color = mix(vec3(1.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), (hue - 0.833) * 6.0);
      }
      
      return color;
    }
    
    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      
      uv *= uTunnelSize;
      
      float dist = length(uv);
      float angle = atan(uv.y, uv.x);
      
      float depth = dist + uTime * uAnimationSpeed;
      
      float wave1 = sin(angle * 8.0 * uWaveDensity + depth * 15.0 * uWaveDensity) * 0.5;
      float wave2 = sin(angle * 12.0 * uWaveDensity - depth * 18.0 * uWaveDensity) * 0.5;
      float wave3 = sin(angle * 6.0 * uWaveDensity + depth * 20.0 * uWaveDensity + uTime * uAnimationSpeed * 0.8) * 0.5;
      float wave4 = sin(dist * 25.0 * uWaveDensity - uTime * uAnimationSpeed * 1.5) * 0.5;
      float wave5 = sin(angle * 10.0 * uWaveDensity + dist * 22.0 * uWaveDensity + uTime * uAnimationSpeed) * 0.5;
      
      float noise = random(vec2(angle, depth) + uTime * uAnimationSpeed * 0.25) * 0.3;
      
      float pattern = (wave1 + wave2 + wave3 + wave4 + wave5) / uWaveCount;
      pattern = pattern * 0.5 + 0.5;
      pattern = mix(pattern, noise, 0.2);
      
      float radialFalloff = 1.0 - smoothstep(0.0, 1.2, dist);
      pattern *= radialFalloff;
      
      float centerFade = smoothstep(0.0, uCenterFadeSize, dist);
      centerFade = pow(centerFade, 0.5);
      pattern *= centerFade;
      
      float mask = smoothstep(uThreshold - 0.2, uThreshold + 0.2, pattern);
      
      vec3 color1 = vec3(1.0, 1.0, 1.0);
      vec3 color2 = vec3(0.85, 0.85, 0.85);
      
      vec3 color = mix(color2, color1, pattern);
      
      color *= mask;
      
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      gray = floor(gray * uPosterizationLevels) / uPosterizationLevels;
      vec2 ditherCoord = gl_FragCoord.xy / 4.0;
      float dithered = dither8x8(ditherCoord, gray);
      vec3 ditheredColor = mix(vec3(0.0), color, dithered * uDitherIntensity);
      
      vec3 colorLines = vec3(0.0);
      for (float i = 0.0; i < 20.0; i++) {
        if (i >= uColorWaveCount) break;
        
        float randomAngleOffset = hash(i) * 6.28318;
        float lineAngle = (i * 6.28318 / max(uColorWaveCount, 1.0)) + randomAngleOffset;
        
        float angleDiff = abs(mod(angle - lineAngle + 3.14159, 6.28318) - 3.14159);
        
        float lineStrength = smoothstep(uColorWaveThickness, 0.0, angleDiff);
        
        float randomLength = 0.05 + hash(i + 100.0) * 0.15;
        
        float timeOffset = hash(i + 300.0) * 3.0;
        float cycleTime = mod(uTime * uColorWaveSpeed + timeOffset, 3.0);
        
        float lineDepth = cycleTime - dist;
        
        float streakFade = smoothstep(randomLength + 0.1, randomLength, abs(lineDepth)) * 
                          smoothstep(-0.1, 0.0, lineDepth);
        
        float maxRadius = 0.6; // Lines disappear before this radius
        float fadeStart = 0.3; // Start fading at this radius
        float radialLineFade = 1.0 - smoothstep(fadeStart, maxRadius, dist);
        radialLineFade = pow(radialLineFade, 2.0); // Make fade more aggressive
        
        streakFade *= radialLineFade;
        
        lineStrength *= streakFade;
        
        lineStrength *= centerFade;
        
        vec3 lineColor = getColorForLine(i);
        
        float lineGray = dot(lineColor, vec3(0.299, 0.587, 0.114)) * lineStrength * uColorWaveIntensity;
        lineGray = floor(lineGray * uPosterizationLevels) / uPosterizationLevels;
        vec2 lineDitherCoord = gl_FragCoord.xy / 4.0;
        float lineDithered = dither8x8(lineDitherCoord, lineGray);
        vec3 ditheredLineColor = lineColor * lineDithered * uDitherIntensity * lineStrength * uColorWaveIntensity;
        
        colorLines += ditheredLineColor;
      }
      
      vec3 finalColor = ditheredColor + colorLines;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  )
}

export function ShaderWaveBackground() {
  const [showControls, setShowControls] = useState(false)
  const [controls, setControls] = useState<ShaderControls>({
    animationSpeed: 0.064,
    posterizationLevels: 1,
    waveDensity: 0.5,
    tunnelSize: 0.6,
    threshold: 0.45,
    ditherIntensity: 0.65,
    centerFadeSize: 0.47,
    waveCount: 2,
    colorWaveCount: 17,
    colorWaveThickness: 0.837,
    colorWaveSpeed: 0.1,
    colorWaveIntensity: 1.1,
  })

  const updateControl = (key: keyof ShaderControls, value: number) => {
    setControls((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }} style={{ width: "100%", height: "100%" }}>
        <WaveShader controls={controls} />
      </Canvas>

      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowControls(!showControls)}
          className="bg-black/50 backdrop-blur-sm border-white/20 hover:bg-black/70"
        >
          <Settings className="h-4 w-4 text-white" />
        </Button>
      </div>

      {showControls && (
        <div className="absolute top-16 right-4 z-50 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto">
          <h3 className="text-white font-semibold mb-4 text-lg">Shader Controls</h3>

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
              <Label className="text-white text-sm">Posterization Levels: {controls.posterizationLevels}</Label>
              <Slider
                value={[controls.posterizationLevels]}
                onValueChange={([value]) => updateControl("posterizationLevels", value)}
                min={1}
                max={16}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Wave Density: {controls.waveDensity.toFixed(2)}</Label>
              <Slider
                value={[controls.waveDensity]}
                onValueChange={([value]) => updateControl("waveDensity", value)}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Tunnel Size: {controls.tunnelSize.toFixed(2)}</Label>
              <Slider
                value={[controls.tunnelSize]}
                onValueChange={([value]) => updateControl("tunnelSize", value)}
                min={0.1}
                max={2}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Threshold: {controls.threshold.toFixed(2)}</Label>
              <Slider
                value={[controls.threshold]}
                onValueChange={([value]) => updateControl("threshold", value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Dither Intensity: {controls.ditherIntensity.toFixed(2)}</Label>
              <Slider
                value={[controls.ditherIntensity]}
                onValueChange={([value]) => updateControl("ditherIntensity", value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Center Fade Size: {controls.centerFadeSize.toFixed(3)}</Label>
              <Slider
                value={[controls.centerFadeSize]}
                onValueChange={([value]) => updateControl("centerFadeSize", value)}
                min={0}
                max={1.0}
                step={0.01}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Wave Count: {controls.waveCount}</Label>
              <Slider
                value={[controls.waveCount]}
                onValueChange={([value]) => updateControl("waveCount", value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="border-t border-white/20 pt-4 mt-4">
              <h4 className="text-white font-semibold mb-3 text-sm">Colorful Waves</h4>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Color Wave Count: {controls.colorWaveCount}</Label>
                  <Slider
                    value={[controls.colorWaveCount]}
                    onValueChange={([value]) => updateControl("colorWaveCount", value)}
                    min={0}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">
                    Color Wave Thickness: {controls.colorWaveThickness.toFixed(3)}
                  </Label>
                  <Slider
                    value={[controls.colorWaveThickness]}
                    onValueChange={([value]) => updateControl("colorWaveThickness", value)}
                    min={0.001}
                    max={1.0}
                    step={0.001}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Color Wave Speed: {controls.colorWaveSpeed.toFixed(2)}</Label>
                  <Slider
                    value={[controls.colorWaveSpeed]}
                    onValueChange={([value]) => updateControl("colorWaveSpeed", value)}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">
                    Color Wave Intensity: {controls.colorWaveIntensity.toFixed(2)}
                  </Label>
                  <Slider
                    value={[controls.colorWaveIntensity]}
                    onValueChange={([value]) => updateControl("colorWaveIntensity", value)}
                    min={0}
                    max={2}
                    step={0.1}
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
