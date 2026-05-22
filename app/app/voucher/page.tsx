"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useQuery } from "convex/react";
import { Check, Coffee, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { api } from "@convex/_generated/api";

const KIND_META: Record<string, { icon: LucideIcon; label: string }> = {
  lunch: { icon: UtensilsCrossed, label: "Lunch" },
  coffee: { icon: Coffee, label: "Coffee" },
};

export default function VoucherPage() {
  const vouchers = useQuery(api.vouchers.myVouchers);

  if (vouchers === undefined) {
    return <p className="font-mono text-xs text-white/40 pt-6">Loading…</p>;
  }

  if (vouchers.length === 0) {
    return (
      <div className="space-y-2 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // VOUCHERS
        </p>
        <p className="text-sm text-white/60">
          You don&apos;t have any vouchers right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-1">
      <header className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          // VOUCHERS · {vouchers.length}
        </p>
        <p className="text-sm text-white/60">
          Show the QR to the vendor at the conference.
        </p>
      </header>

      <div className="space-y-6">
        {vouchers.map((v) => (
          <VoucherFull key={v._id} voucher={v} />
        ))}
      </div>
    </div>
  );
}

function VoucherFull({
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
  const meta = KIND_META[voucher.kind] ?? {
    icon: UtensilsCrossed,
    label: voucher.kind,
  };
  const Icon = meta.icon;
  const redeemed = !!voucher.redeemedAt;

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!origin || redeemed) return;
    QRCode.toDataURL(`${origin}/v/${voucher.publicToken}`, {
      width: 800,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [origin, voucher.publicToken, redeemed]);

  return (
    <section
      className={`glass-card rounded-3xl p-5 sm:p-6 space-y-4 ${
        redeemed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <Icon className="size-5 text-white/80" strokeWidth={1.75} />
          <p className="font-mono text-base text-white">{meta.label}</p>
        </div>
        {redeemed ? (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30">
            <Check className="size-3" strokeWidth={2.5} />
            Redeemed
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            1× use
          </span>
        )}
      </div>

      <div className="aspect-square w-full rounded-2xl bg-white p-4 sm:p-5 flex items-center justify-center">
        {redeemed ? (
          <div className="text-center space-y-2">
            <div className="size-20 mx-auto rounded-full bg-emerald-500/20 ring-2 ring-emerald-400/40 flex items-center justify-center">
              <Check className="size-10 text-emerald-600" strokeWidth={2.5} />
            </div>
            <p className="font-mono text-sm text-black/70">
              Redeemed at{" "}
              {new Date(voucher.redeemedAt!).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`${meta.label} voucher QR`}
            className="w-full h-full"
          />
        ) : (
          <div className="font-mono text-xs text-black/40">Generating QR…</div>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 text-center break-all">
        {voucher.publicToken}
      </p>
    </section>
  );
}
