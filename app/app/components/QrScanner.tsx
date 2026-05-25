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

function diagnoseError(err: unknown): { hint: string } {
  const name = err instanceof Error ? err.name : "";
  const message = err instanceof Error ? err.message.toLowerCase() : "";
  if (
    name === "NotAllowedError" ||
    message.includes("denied") ||
    message.includes("not allowed")
  ) {
    return {
      hint:
        "Camera permission was denied. On iPhone: Settings → Safari → Camera → Allow, then reload. On Chrome: tap the lock icon → Camera → Allow.",
    };
  }
  if (
    name === "NotFoundError" ||
    message.includes("no camera") ||
    message.includes("not found")
  ) {
    return {
      hint: "No camera was detected. Use the photo upload below instead.",
    };
  }
  if (
    name === "NotReadableError" ||
    message.includes("in use") ||
    message.includes("could not start")
  ) {
    return {
      hint: "Another app is using the camera. Close other camera apps and try again.",
    };
  }
  if (isInsecureContext()) {
    return {
      hint: "Camera access is blocked on non-HTTPS origins. Open this page over https://.",
    };
  }
  return {
    hint: "Use the photo upload below as a fallback.",
  };
}

export function QrScanner({ onScan, paused = false }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const pausedRef = useRef(paused);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<ScannerError | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // pause = ignore decode results but leave the stream live. Tearing
  // the camera down on every save was causing iOS Safari to re-prompt.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);

    (async () => {
      try {
        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
          throw new Error(
            "This browser doesn't expose camera APIs. Use Safari (iOS) or Chrome (Android).",
          );
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play().catch(() => {});
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
        setReady(true);
        try {
          await reader.decodeFromVideoElement(video, (result) => {
            if (pausedRef.current) return;
            if (result) onScanRef.current(result.getText());
          });
        } catch {
          /* zxing throws on reset */
        }
      } catch (err) {
        if (cancelled) return;
        setError({
          name: err instanceof Error ? err.name || "Error" : "Error",
          message: err instanceof Error ? err.message : "Camera unavailable",
        });
      }
    })();

    return () => {
      cancelled = true;
      try {
        (readerRef.current as unknown as { reset?: () => void } | null)?.reset?.();
      } catch {
        /* ignore */
      }
      readerRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
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
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${ready ? "" : "invisible"}`}
        muted
        playsInline
      />
      {ready && (
        <div className="absolute inset-8 border-2 border-foreground/60 rounded-lg pointer-events-none" />
      )}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 animate-pulse">
            Starting camera…
          </p>
        </div>
      )}
    </div>
  );
}
