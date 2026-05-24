"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { X } from "lucide-react";

// Shared full-screen QR overlay. Renders a black backdrop with the QR
// taking as much space as the viewport allows, so attendees can hold up
// their phone for a door / counter scanner without the surrounding UI
// stealing pixels.
//
// Triggered from a slim launcher card (LumaCheckInCard) or from clicking a
// smaller inline QR (Connect badge, Voucher). Mount unconditionally — the
// hook ordering depends on `open` being a render-time prop, not a guard,
// so the early-return for closed lives at the bottom and `useEffect`s
// fire on every render.
export function FullScreenQr({
  open,
  value,
  title,
  caption,
  onClose,
}: {
  open: boolean;
  value: string;
  title?: string;
  caption?: React.ReactNode;
  onClose: () => void;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: 1200,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0c0a06", light: "#ffffff" },
    })
      .then((d) => {
        if (!cancelled) setDataUrl(d);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, value]);

  // Close on Escape so keyboards work too.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Portal to document.body so the overlay always lives at the root and
  // can't be clipped by an ancestor stacking context (e.g. a glass-card
  // parent that uses backdrop-blur). Without this the overlay renders
  // *inside* the card's stacking context and the sticky header above it
  // ends up on top.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-5 sm:right-5 size-11 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center transition-colors"
        aria-label="Close"
      >
        <X className="size-5 text-white" strokeWidth={2} />
      </button>
      <div
        className="flex flex-col items-center gap-5 max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-2xl">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={title ?? "QR code"}
              className="block"
              style={{
                width: "min(82vw, 78vh)",
                height: "min(82vw, 78vh)",
              }}
            />
          ) : (
            <div
              className="bg-stone-100 animate-pulse rounded"
              style={{
                width: "min(82vw, 78vh)",
                height: "min(82vw, 78vh)",
              }}
            />
          )}
        </div>
        {(title || caption) && (
          <div className="text-white text-center max-w-sm">
            {title && (
              <p className="text-lg sm:text-xl font-medium tracking-tight">
                {title}
              </p>
            )}
            {caption && (
              <div className="text-sm text-white/60 mt-1.5 leading-relaxed">
                {caption}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
