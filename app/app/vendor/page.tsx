"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Camera } from "lucide-react";
import { api } from "@convex/_generated/api";
import { QrScanner } from "../components/QrScanner";

function parseVoucherToken(text: string): string | null {
  try {
    const url = new URL(text);
    const m = url.pathname.match(/^\/v\/(vch_[a-z0-9]+)/i);
    return m?.[1] ?? null;
  } catch {
    // Allow the raw token directly too in case the QR just encodes "vch_..."
    if (/^vch_[a-z0-9]+$/i.test(text.trim())) return text.trim();
    return null;
  }
}

export default function VendorScanPage() {
  const me = useQuery(api.users.me);
  const redeem = useMutation(api.vouchers.redeem);

  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleScan = useCallback(
    async (text: string) => {
      if (status === "saving") return;
      const token = parseVoucherToken(text);
      if (!token) {
        setStatus("error");
        setMessage("That QR isn't a voucher.");
        return;
      }
      setStatus("saving");
      try {
        await redeem({ token });
        setStatus("success");
        setMessage(`Voucher ${token} redeemed`);
      } catch (e) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Failed to redeem");
      }
    },
    [redeem, status],
  );

  if (me === undefined) return <p className="font-mono text-xs text-white/40">Loading…</p>;
  if (!me || (me.accessLevel !== "vendor" && me.accessLevel !== "admin")) {
    return (
      <div className="space-y-2">
        <p className="font-mono text-sm">Vendors only.</p>
        <p className="text-xs text-white/50">
          Your account isn&apos;t marked as a vendor. Ask the conference desk to grant
          access if you&apos;re supposed to redeem vouchers here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1">
      <div className="flex items-center gap-2">
        <Camera className="size-4 text-white/60" strokeWidth={1.75} />
        <p className="font-mono text-sm text-white">Scan a voucher to redeem</p>
      </div>

      <QrScanner onScan={handleScan} paused={status === "saving"} />

      {status === "saving" && (
        <p className="font-mono text-xs text-white/60 text-center animate-pulse">
          Redeeming…
        </p>
      )}
      {status === "success" && (
        <div className="rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/40 px-4 py-3 flex items-center gap-3">
          <Check className="size-6 text-emerald-300" strokeWidth={2.5} />
          <div>
            <p className="font-mono text-sm text-emerald-100">{message}</p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setMessage(null);
              }}
              className="font-mono text-xs underline text-emerald-200/80 mt-1"
            >
              Scan another
            </button>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="rounded-xl bg-red-500/15 ring-1 ring-red-500/40 px-4 py-3">
          <p className="font-mono text-sm text-red-100">{message}</p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setMessage(null);
            }}
            className="font-mono text-xs underline text-red-200/80 mt-1"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
