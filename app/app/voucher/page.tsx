"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  Coffee,
  ExternalLink,
  Expand,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { FullScreenQr } from "../components/FullScreenQr";

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
          Use these at the counters at the conference.
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
    _id: Id<"vouchers">;
    kind: string;
    publicToken: string;
    redeemedAt?: number;
    externalLabel?: string;
    externalUrl?: string;
  };
}) {
  const meta = KIND_META[voucher.kind] ?? {
    icon: UtensilsCrossed,
    label: voucher.kind,
  };
  const redeemed = !!voucher.redeemedAt;
  const isExternalKind = voucher.kind.startsWith("lunch");

  if (isExternalKind) {
    return (
      <ExternalVoucher voucher={voucher} meta={meta} redeemed={redeemed} />
    );
  }
  return <QrVoucher voucher={voucher} meta={meta} redeemed={redeemed} />;
}

function ExternalVoucher({
  voucher,
  meta,
  redeemed,
}: {
  voucher: {
    _id: Id<"vouchers">;
    kind: string;
    externalLabel?: string;
    externalUrl?: string;
  };
  meta: { icon: LucideIcon; label: string };
  redeemed: boolean;
}) {
  const Icon = meta.icon;
  const claimExternal = useMutation(api.vouchers.claimExternalForMyVoucher);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (voucher.externalUrl || redeemed) return;
    setClaiming(true);
    setError(null);
    claimExternal({ voucherId: voucher._id })
      .catch((e: Error) => setError(e.message ?? "Could not claim voucher"))
      .finally(() => setClaiming(false));
  }, [voucher._id, voucher.externalUrl, redeemed, claimExternal]);

  return (
    <section className="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <Icon className="size-5 text-white/80" strokeWidth={1.75} />
          <p className="font-mono text-base text-white">{meta.label}</p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          €15 · 1× use
        </span>
      </div>

      <p className="text-sm text-white/70">
        This is your voucher for food at the conference.
      </p>

      {error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : voucher.externalUrl ? (
        <a
          href={voucher.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-white text-stone-900 font-mono text-sm uppercase tracking-[0.18em] py-3.5 hover:bg-white/90 transition-colors"
        >
          Open voucher
          <ExternalLink className="size-4" strokeWidth={2} />
        </a>
      ) : (
        <div className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-white/5 text-white/40 font-mono text-sm uppercase tracking-[0.18em] py-3.5">
          {claiming ? "Preparing…" : "Loading…"}
        </div>
      )}

      {voucher.externalLabel && (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30 text-center">
          {voucher.externalLabel}
        </p>
      )}
    </section>
  );
}

function QrVoucher({
  voucher,
  meta,
  redeemed,
}: {
  voucher: {
    _id: Id<"vouchers">;
    kind: string;
    publicToken: string;
    redeemedAt?: number;
  };
  meta: { icon: LucideIcon; label: string };
  redeemed: boolean;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const Icon = meta.icon;

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!origin || redeemed) return;
    QRCode.toDataURL(`${origin}/v/${voucher.publicToken}`, {
      width: 320,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [origin, voucher.publicToken, redeemed]);

  const voucherUrl = origin ? `${origin}/v/${voucher.publicToken}` : null;

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

      {redeemed ? (
        <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-6 flex items-center gap-4">
          <div className="size-12 rounded-full bg-emerald-500/15 ring-2 ring-emerald-400/40 flex items-center justify-center shrink-0">
            <Check className="size-6 text-emerald-300" strokeWidth={2.5} />
          </div>
          <p className="text-sm text-white/70">
            Redeemed at{" "}
            <span className="font-mono text-white tabular-nums">
              {new Date(voucher.redeemedAt!).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="group relative aspect-square w-full mx-auto max-w-[240px] sm:max-w-[280px] rounded-2xl bg-white p-3 flex items-center justify-center"
          aria-label={`Enlarge ${meta.label} voucher QR`}
        >
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`${meta.label} voucher QR`}
              className="w-full h-full"
            />
          ) : (
            <div className="font-mono text-xs text-black/40">Generating…</div>
          )}
          <span className="absolute top-2 right-2 size-7 rounded-full bg-stone-900/80 backdrop-blur ring-1 ring-white/15 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
            <Expand className="size-3.5 text-white" strokeWidth={2} />
          </span>
        </button>
      )}

      {!redeemed && (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 text-center">
          Tap the QR to enlarge
        </p>
      )}

      {voucherUrl && !redeemed && (
        <FullScreenQr
          open={fullscreen}
          value={voucherUrl}
          title={meta.label}
          caption="Hand the screen to the vendor at the counter."
          onClose={() => setFullscreen(false)}
        />
      )}
    </section>
  );
}
