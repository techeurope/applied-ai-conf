"use client";

import { useRef, useState, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { ElementType, Position } from "../store";
import { useSpeakerAssetStore } from "../store";

interface SelectableElementProps {
  elementType: ElementType;
  position: Position;
  children: React.ReactNode;
  onPositionChange?: (position: Position) => void;
  disabled?: boolean;
}

export function SelectableElement({
  elementType,
  position,
  children,
  onPositionChange,
  disabled = false,
}: SelectableElementProps) {
  const groupRef = useRef<Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialPosition, setInitialPosition] = useState<Position | null>(null);

  const { camera, size } = useThree();
  const { selectedElement, setSelectedElement } = useSpeakerAssetStore();

  const isSelected = selectedElement === elementType;

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      // Normalize screen coordinates (-1 to 1)
      const x = (screenX / size.width) * 2 - 1;
      const y = -(screenY / size.height) * 2 + 1;

      // Create a vector in normalized device coordinates
      const vector = new Vector3(x, y, 0.5);
      vector.unproject(camera);

      // Get direction from camera to point
      const dir = vector.sub(camera.position).normalize();

      // Calculate intersection with z=0 plane
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));

      return { x: pos.x, y: pos.y };
    },
    [camera, size]
  );

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (disabled) return;
      
      e.stopPropagation();
      setSelectedElement(elementType);
      
      // Start drag
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialPosition(position);

      // Capture pointer
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    },
    [disabled, elementType, position, setSelectedElement]
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isDragging || !dragStart || !initialPosition || disabled) return;

      e.stopPropagation();

      // Calculate delta in screen space
      const deltaScreen = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };

      // Convert to world space (approximate scaling based on camera)
      // The camera is at z=5 with fov=45, so we need to scale accordingly
      const worldScale = (camera.position.z * 2 * Math.tan((45 * Math.PI) / 360)) / size.height;
      
      const newPosition: Position = {
        x: initialPosition.x + deltaScreen.x * worldScale,
        y: initialPosition.y - deltaScreen.y * worldScale, // Invert Y
      };

      onPositionChange?.(newPosition);
    },
    [isDragging, dragStart, initialPosition, disabled, camera, size, onPositionChange]
  );

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isDragging) return;
      
      e.stopPropagation();
      setIsDragging(false);
      setDragStart(null);
      setInitialPosition(null);

      // Release pointer
      (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
    },
    [isDragging]
  );

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Selection indicator */}
      {isSelected && !disabled && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color="#ab7030" transparent opacity={0} />
        </mesh>
      )}
      
      {/* Hover/selection outline effect via CSS cursor */}
      <group
        onPointerEnter={() => {
          if (!disabled) document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          if (!isDragging) document.body.style.cursor = "default";
        }}
      >
        {children}
      </group>
    </group>
  );
}

// Simple hit area for background clicks
export function BackgroundClickArea() {
  const { setSelectedElement } = useSpeakerAssetStore();

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      // Only deselect if this is the first object hit (no other object intercepted)
      // The event will only reach here if no other object stopped propagation
      setSelectedElement(null);
    },
    [setSelectedElement]
  );

  return (
    <mesh position={[0, 0, -5]} onPointerDown={handlePointerDown}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

