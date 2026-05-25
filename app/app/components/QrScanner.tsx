"use client";

import { BrowserMultiFormatReader } from "@zxing/browser";
import { useCallback, useEffect, useRef, useState } from "react";

interface QrScannerProps {
  onScan: (text: string) => void;
  paused?: boolean;
}

type ScannerError = {
  name: string;
  message: string;
};

function isInsecureContext(): boolean {
  if (typeof window === "undefined") return false;
  return !window.isSecureContext;
}

function diagnoseError(err: unknown): {
  hint: string;
  isPermission: boolean;
} {
  const name = err instanceof Error ? err.name : "";
  const message = err instanceof Error ? err.message.toLowerCase() : "";
  if (name === "NotAllowedError" || message.includes("denied") || message.includes("not allowed")) {
    return {
      isPermission: true,
      hint:
        "Camera permission was denied. On iPhone: Settings → Safari → Camera → set to 'Ask' or 'Allow', then reload. On Chrome: tap the lock icon in the address bar → Camera → Allow.",
    };
  }
  if (name === "NotFoundError" || message.includes("no camera") || message.includes("not found")) {
    return {
      isPermission: false,
      hint: "No camera was detected on this device. Use the photo upload below instead.",
    };
  }
  if (name === "NotReadableError" || message.includes("in use") || message.includes("could not start")) {
    return {
      isPermission: false,
      hint: "Another app is already using the camera. Close other camera apps and try again.",
    };
  }
  if (isInsecureContext()) {
    return {
      isPermission: false,
      hint: "Browser blocks camera access on insecure (non-HTTPS) origins. Open the page over https://.",
    };
  }
  return {
    isPermission: false,
    hint: "Use the photo upload below as a fallback.",
  };
}

export function QrScanner({ onScan, paused = false }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<ScannerError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
          throw new Error(
            "This browser doesn't expose camera APIs. Try Safari (iOS) or Chrome (Android) over HTTPS.",
          );
        }
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
          setError({
            name: err instanceof Error ? err.name || "Error" : "Error",
            message: err instanceof Error ? err.message : "Camera unavailable",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        (reader as unknown as { reset?: () => void }).reset?.();
      } catch {
        /* ignore */
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        if (video.srcObject === stream) {
          video.srcObject = null;
        }
      }
    };
  }, [paused, retryCount]);

  const retry = useCallback(() => {
    setError(null);
    setRetryCount((n) => n + 1);
  }, []);

  if (error) {
    const diag = diagnoseError(error);
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-100 space-y-3">
        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-red-200">
            Camera unavailable
          </div>
          <div className="text-sm leading-relaxed">{diag.hint}</div>
        </div>
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center px-4 py-2 rounded-full bg-white text-black font-mono text-xs font-medium"
        >
          Try again
        </button>
        <details className="font-mono text-[10px] text-red-200/60">
          <summary className="cursor-pointer select-none">Technical details</summary>
          <div className="pt-2 break-all">
            {error.name}: {error.message}
          </div>
        </details>
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
