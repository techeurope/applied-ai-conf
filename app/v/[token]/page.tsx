"use client";

import { use, useEffect, useState } from "react";
import QRCode from "qrcode";
import { UtensilsCrossed, Coffee, Check } from "lucide-react";

const KIND_META: Record<string, { icon: typeof UtensilsCrossed; label: string }> = {
  lunch: { icon: UtensilsCrossed, label: "Lunch" },
  coffee: { icon: Coffee, label: "Coffee" },
};

// Unauthenticated public landing for a voucher QR. We can't read the voucher
// from Convex here (no auth provider) but we don't need to — this page exists
// just so a non-vendor camera scan gives the holder something readable.
// The actual redemption happens at /app/vendor where a signed-in vendor
// scans the QR and the token is parsed client-side.
export default function VoucherLandingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  // Detect kind heuristically (the QR target URL has the token only; we'd
  // need an unauth Convex query to know the kind). For now, show a generic
  // voucher screen.
  const meta = KIND_META.lunch;
  const Icon = meta.icon;

  useEffect(() => {
    if (typeof window === "undefined") return;
    QRCode.toDataURL(`${window.location.origin}/v/${token}`, {
      width: 320,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [token]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center gap-6 p-6">
      <div className="flex items-center gap-2">
        <Icon className="size-6 text-white/70" strokeWidth={1.75} />
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-white/60">
          Applied AI Conf voucher
        </p>
      </div>
      <div className="size-72 rounded-2xl bg-white p-3 flex items-center justify-center">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Voucher QR" className="w-full h-full" />
        ) : (
          <div className="size-full" />
        )}
      </div>
      <p className="font-mono text-[11px] tracking-[0.2em] text-white/40 text-center max-w-md">
        Show this code to a vendor at the conference. They scan it once to redeem.
        <br />
        <span className="opacity-60">Code: {token}</span>
      </p>
    </div>
  );
}
