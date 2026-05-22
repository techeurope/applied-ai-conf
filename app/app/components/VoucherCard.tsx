"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { UtensilsCrossed, Coffee, Check } from "lucide-react";

const KIND_META: Record<string, { icon: typeof UtensilsCrossed; label: string }> = {
  lunch: { icon: UtensilsCrossed, label: "Lunch" },
  coffee: { icon: Coffee, label: "Coffee" },
};

export function VoucherCard({
  voucher,
}: {
  voucher: {
    _id: string;
    kind: string;
    publicToken: string;
    redeemedAt?: number;
  };
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!origin || voucher.redeemedAt) return;
    QRCode.toDataURL(`${origin}/v/${voucher.publicToken}`, {
      width: 200,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [origin, voucher.publicToken, voucher.redeemedAt]);

  const meta = KIND_META[voucher.kind] ?? { icon: UtensilsCrossed, label: voucher.kind };
  const Icon = meta.icon;
  const redeemed = !!voucher.redeemedAt;

  return (
    <div
      className={`glass-card rounded-2xl p-4 flex items-center gap-4 ${
        redeemed ? "opacity-60" : ""
      }`}
    >
      <div className="size-16 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
        {redeemed ? (
          <div className="size-14 rounded-lg bg-emerald-500/20 ring-1 ring-emerald-400/40 flex items-center justify-center">
            <Check className="size-7 text-emerald-300" strokeWidth={2.5} />
          </div>
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt={`${meta.label} voucher QR`} className="size-full" />
        ) : (
          <div className="size-full" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Icon className="size-4 text-white/60" strokeWidth={1.75} />
          <p className="font-mono text-sm text-white">{meta.label}</p>
        </div>
        {redeemed ? (
          <p className="text-xs text-emerald-200/80 mt-0.5">
            Redeemed {new Date(voucher.redeemedAt!).toLocaleTimeString()}
          </p>
        ) : (
          <p className="text-xs text-white/50 mt-0.5">Show the QR to the vendor.</p>
        )}
      </div>
    </div>
  );
}
