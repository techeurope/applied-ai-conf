"use client";

import React, { useEffect, useRef } from "react";

interface RotatingBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function RotatingBorder({ children, className = "" }: RotatingBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty("--x", `${x}px`);
      container.style.setProperty("--y", `${y}px`);
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden group ${className}`}
      style={
        {
          "--x": "50%",
          "--y": "50%",
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Rotating Gradient Border Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#fff_50%)] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full w-full bg-white text-black">
        {children}
      </div>
    </div>
  );
}

