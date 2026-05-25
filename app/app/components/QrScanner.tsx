"use client";

import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera } from "lucide-react";
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
        "Camera permission was denied. On iPhone: Settings → Safari → Camera → set to 'Allow', then reload. On Chrome: tap the lock icon in the address bar → Camera → Allow.",
    };
  }
  if (
    name === "NotFoundError" ||
    message.includes("no camera") ||
    message.includes("not found")
  ) {
    return {
      hint: "No camera was detected on this device. Use the photo upload below instead.",
    };
  }
  if (
    name === "NotReadableError" ||
    message.includes("in use") ||
    message.includes("could not start")
  ) {
    return {
      hint: "Another app is already using the camera. Close other camera apps and try again.",
    };
  }
  if (isInsecureContext()) {
    return {
      hint: "Browser blocks camera access on insecure (non-HTTPS) origins. Open the page over https://.",
    };
  }
  return {
    hint: "Use the photo upload below as a fallback.",
  };
}

async function acquireStream(): Promise<MediaStream> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== "function"
  ) {
    throw new Error(
      "This browser doesn't expose camera APIs. Try Safari (iOS) or Chrome (Android) over HTTPS.",
    );
  }
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" } },
    audio: false,
  });
}

export function QrScanner({ onScan, paused = false }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<ScannerError | null>(null);
  // null = haven't tried yet (still resolving), "running" = stream is up,
  // "needs_gesture" = silent attempt failed, show the Enable button
  const [phase, setPhase] = useState<"resolving" | "running" | "needs_gesture">(
    "resolving",
  );
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopCamera = useCallback(() => {
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
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Attach the (already-acquired) stream to the video element and start
  // zxing's decode loop. Used both by the silent-on-mount path and the
  // button path so the logic only lives in one place.
  const attachAndDecode = useCallback(async (stream: MediaStream) => {
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
    setPhase("running");
    try {
      await reader.decodeFromVideoElement(video, (result) => {
        if (result) onScanRef.current(result.getText());
      });
    } catch {
      /* zxing throws on reset, ignore */
    }
  }, []);

  // First-mount: race getUserMedia against a short timeout. On iOS
  // Safari without a prior gesture, getUserMedia can hang forever
  // instead of throwing, so we can't rely on a thrown error to fall
  // back to the button. If we don't get a stream in ~1.2s, treat it as
  // "needs gesture" and surface the Enable button (whose onClick is the
  // gesture iOS requires). When permission is already persisted the
  // stream returns well inside the budget and the user never sees the
  // button.
  useEffect(() => {
    let cancelled = false;
    let pendingStream: Promise<MediaStream> | null = null;
    const SILENT_TIMEOUT_MS = 1200;
    (async () => {
      try {
        pendingStream = acquireStream();
        const stream = await Promise.race<MediaStream | "__timeout__">([
          pendingStream,
          new Promise<"__timeout__">((resolve) =>
            setTimeout(() => resolve("__timeout__"), SILENT_TIMEOUT_MS),
          ),
        ]);
        if (cancelled) {
          if (stream !== "__timeout__") {
            stream.getTracks().forEach((t) => t.stop());
          }
          return;
        }
        if (stream === "__timeout__") {
          // iOS Safari is silently waiting on us. Give up the silent
          // path and show the gesture button. Stop the in-flight stream
          // if/when it eventually resolves so we don't leak the camera.
          pendingStream
            .then((s) => s.getTracks().forEach((t) => t.stop()))
            .catch(() => {});
          setPhase("needs_gesture");
          return;
        }
        await attachAndDecode(stream);
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "";
        const message = err instanceof Error ? err.message.toLowerCase() : "";
        // Soft errors (NotAllowedError, no-gesture) just mean we need
        // the button. Hard errors (no camera at all, insecure context,
        // no API) surface the error UI directly.
        const isGestureFix =
          name === "NotAllowedError" ||
          message.includes("denied") ||
          message.includes("not allowed") ||
          message.includes("gesture") ||
          message.includes("user activation");
        if (isGestureFix) {
          setPhase("needs_gesture");
        } else {
          setError({
            name: err instanceof Error ? err.name || "Error" : "Error",
            message: err instanceof Error ? err.message : "Camera unavailable",
          });
          setPhase("needs_gesture");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // attachAndDecode is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause/resume from parent. Tear the stream down on pause; rebuild
  // on unpause using the same silent attempt (we already have a
  // permission grant by this point, so iOS shouldn't re-prompt).
  useEffect(() => {
    if (phase !== "running") return;
    if (!paused) return;
    stopCamera();
    let cancelled = false;
    return () => {
      cancelled = true;
      (async () => {
        if (cancelled) return;
        try {
          const stream = await acquireStream();
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          await attachAndDecode(stream);
        } catch {
          setPhase("needs_gesture");
        }
      })();
    };
  }, [paused, phase, stopCamera, attachAndDecode]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const enableCamera = useCallback(async () => {
    setError(null);
    setRequesting(true);
    try {
      const stream = await acquireStream();
      await attachAndDecode(stream);
    } catch (err) {
      setError({
        name: err instanceof Error ? err.name || "Error" : "Error",
        message: err instanceof Error ? err.message : "Camera unavailable",
      });
    } finally {
      setRequesting(false);
    }
  }, [attachAndDecode]);

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
          onClick={enableCamera}
          disabled={requesting}
          className="inline-flex items-center px-4 py-2 rounded-full bg-white text-black font-mono text-xs font-medium disabled:opacity-50"
        >
          {requesting ? "Requesting…" : "Try again"}
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

  if (phase === "resolving") {
    return (
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 animate-pulse">
          Starting camera…
        </p>
      </div>
    );
  }

  if (phase === "needs_gesture") {
    return (
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
        <button
          type="button"
          onClick={enableCamera}
          disabled={requesting}
          className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors disabled:opacity-50"
        >
          <Camera className="size-7 text-white/80" strokeWidth={1.5} />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/80">
            {requesting ? "Requesting access…" : "Enable camera"}
          </span>
          <span className="text-[11px] text-white/40 max-w-[220px] text-center leading-snug">
            iOS Safari asks again after every reload by default. Set
            Settings → Safari → Camera → Allow to skip this step.
          </span>
        </button>
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
