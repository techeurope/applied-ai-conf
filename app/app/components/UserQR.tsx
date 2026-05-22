"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface UserQRProps {
  token: string;
  origin?: string;
  size?: number;
  showUrl?: boolean;
  /** Override the inner container max-width (defaults to `max-w-xs`). */
  maxWidthClass?: string;
}

export function UserQR({
  token,
  origin,
  size = 320,
  showUrl = true,
  maxWidthClass = "max-w-xs",
}: UserQRProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [resolvedOrigin, setResolvedOrigin] = useState(origin);

  useEffect(() => {
    if (!resolvedOrigin && typeof window !== "undefined") {
      setResolvedOrigin(window.location.origin);
    }
  }, [resolvedOrigin]);

  useEffect(() => {
    if (!resolvedOrigin) return;
    const url = `${resolvedOrigin}/app/u/${token}`;
    QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [token, resolvedOrigin, size]);

  return (
    <div className="space-y-3">
      <div
        className={`aspect-square w-full ${maxWidthClass} mx-auto rounded-2xl border border-white/10 bg-white p-4 flex items-center justify-center`}
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="Your QR code"
            className="w-full h-full"
            width={size}
            height={size}
          />
        ) : (
          <div className="font-mono text-xs text-white/40">Generating QR…</div>
        )}
      </div>
      {showUrl && resolvedOrigin && (
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 text-center break-all">
          {resolvedOrigin}/app/u/{token}
        </p>
      )}
    </div>
  );
}
