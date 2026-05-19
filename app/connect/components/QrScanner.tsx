"use client";

import { BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";

interface QrScannerProps {
  onScan: (text: string) => void;
  paused?: boolean;
}

export function QrScanner({ onScan, paused = false }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (paused) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    const reader = new BrowserMultiFormatReader();

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        await video.play().catch(() => {});
        await reader.decodeFromVideoElement(video, (result) => {
          if (!cancelled && result) {
            onScanRef.current(result.getText());
          }
        });
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Camera unavailable";
          setError(message);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        // Stop zxing's internal decode loop without touching srcObject.
        (reader as unknown as { reset?: () => void }).reset?.();
      } catch {
        // ignore
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        if (video.srcObject === stream) {
          video.srcObject = null;
        }
      }
    };
  }, [paused]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
        <div className="font-mono mb-1">Camera access needed</div>
        <div className="text-red-200/70 text-xs leading-relaxed">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10">
      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      <div className="absolute inset-8 border-2 border-foreground/60 rounded-lg pointer-events-none" />
    </div>
  );
}
