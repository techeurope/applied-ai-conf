"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface UserQRProps {
  userId: string;
  origin?: string;
  size?: number;
}

export function UserQR({ userId, origin, size = 320 }: UserQRProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [resolvedOrigin, setResolvedOrigin] = useState(origin);

  useEffect(() => {
    if (!resolvedOrigin && typeof window !== "undefined") {
      setResolvedOrigin(window.location.origin);
    }
  }, [resolvedOrigin]);

  useEffect(() => {
    if (!resolvedOrigin) return;
    const url = `${resolvedOrigin}/connect/u/${userId}`;
    QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [userId, resolvedOrigin, size]);

  return (
    <div className="space-y-3">
      <div className="aspect-square w-full max-w-xs mx-auto rounded-2xl border border-white/10 bg-white p-4 flex items-center justify-center">
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
      {resolvedOrigin && (
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 text-center break-all">
          {resolvedOrigin}/connect/u/{userId}
        </p>
      )}
    </div>
  );
}
