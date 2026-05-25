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
        "Camera permission was denied. On iPhone: Settings → Safari → Camera → set to 'Ask' or 'Allow', then reload. On Chrome: tap the lock icon in the address bar → Camera → Allow.",
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

export function QrScanner({ onScan, paused = false }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<ScannerError | null>(null);
  // started = the user has tapped "Enable camera" so we have a fresh
  // user-gesture context in which to call getUserMedia. iOS Safari
  // silently denies the call (with no prompt) when it isn't initiated
  // from a tap, so we never call it on mount unless the Permissions
  // API tells us camera access is already granted (see effect below).
  const [started, setStarted] = useState(false);
  const [requesting, setRequesting] = useState(false);
  // null = still checking, true = autostart (no button), false = show button
  const [permissionResolved, setPermissionResolved] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // Check the Permissions API on mount. If the user has already granted
  // camera access in a previous session, skip the "Enable camera" button
  // and just start the stream — useEffect-initiated getUserMedia is
  // allowed by browsers when permission is already 'granted' (the gesture
  // requirement only applies when the call would prompt). Permissions
  // API isn't fully supported on iOS Safari for 'camera', so anything
  // other than an explicit 'granted' falls back to the button.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (
          typeof navigator !== "undefined" &&
          "permissions" in navigator &&
          navigator.permissions?.query
        ) {
          const status = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          if (cancelled) return;
          if (status.state === "granted") {
            setStarted(true);
          }
          setPermissionResolved(true);
          return;
        }
      } catch {
        /* fall through to button */
      }
      if (!cancelled) setPermissionResolved(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Pause/resume: when the parent flips `paused` (e.g. while saving a
  // scan), tear the stream down to free the camera; restart it after
  // unpause. This still doesn't initiate getUserMedia without a prior
  // user gesture — once `started` is true the original tap counts as
  // the gesture for the remainder of the page lifetime.
  useEffect(() => {
    if (!started) return;
    if (paused) {
      stopCamera();
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play().catch(() => {});
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
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
          setStarted(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [paused, started, stopCamera]);

  // The actual permission prompt. Called from the button's onClick so
  // iOS Safari sees a user gesture. We request the stream here,
  // immediately stash it, and flip `started` — the effect above takes
  // it from there.
  const enableCamera = useCallback(async () => {
    setError(null);
    setRequesting(true);
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      // Stop the probe stream immediately — the effect above will
      // request its own once `started` flips. Holding onto two streams
      // breaks zxing on some Android Chrome builds.
      stream.getTracks().forEach((t) => t.stop());
      setStarted(true);
    } catch (err) {
      setError({
        name: err instanceof Error ? err.name || "Error" : "Error",
        message: err instanceof Error ? err.message : "Camera unavailable",
      });
    } finally {
      setRequesting(false);
    }
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

  if (permissionResolved === null) {
    return (
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 animate-pulse">
          Checking camera…
        </p>
      </div>
    );
  }

  if (!started) {
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
          <span className="text-[11px] text-white/40 max-w-[200px] text-center leading-snug">
            Your browser will ask for permission to use the camera.
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
