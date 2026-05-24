"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useQuery } from "convex/react";
import { CheckCircle2, Maximize2, QrCode, X } from "lucide-react";
import { api } from "@convex/_generated/api";

// Renders the signed-in user's personal Luma check-in QR. Source URL comes
// straight from Luma's get-guests response (`check_in_qr_code`) and is what
// their email + the Luma ticket page already encode — so it's safe to
// surface to the user themselves.
//
// Hidden when the user has no Luma data yet (e.g. account created but ticket
// not linked, or the Luma sync hasn't run since the backfill).
export function LumaCheckInCard() {
  const data = useQuery(api.luma.myCheckIn);
  const [open, setOpen] = useState(false);

  // Query is loading or signed-out / not-linked. Nothing to show.
  if (data === undefined) return null;
  if (data === null) return null;
  if (!data.checkInUrl) return null;

  const checkedIn = !!data.checkedInAt;

  return (
    <>
      <section className="rounded-2xl ring-1 ring-emerald-300/30 bg-gradient-to-br from-emerald-400/[0.07] to-emerald-400/[0.02] p-4 sm:p-5">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Inline mini QR */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative shrink-0 size-24 sm:size-28 rounded-xl bg-white p-2 ring-1 ring-white/20 hover:scale-[1.02] transition-transform"
            aria-label="Enlarge check-in QR"
          >
            <Qr url={data.checkInUrl} size={120} />
            <span className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-stone-900 ring-2 ring-[#05070f] flex items-center justify-center">
              <Maximize2 className="size-3 text-white" strokeWidth={2} />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <QrCode className="size-3.5 text-emerald-300" strokeWidth={2} />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200">
                Your check-in
              </p>
            </div>
            <p className="text-lg sm:text-xl text-white font-medium tracking-tight leading-tight">
              {checkedIn ? "You're checked in." : "Show this at the door."}
            </p>
            <p className="text-sm text-white/55 mt-1 leading-snug">
              {checkedIn ? (
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-300" strokeWidth={2} />
                  Checked in
                  {data.checkedInAt && (
                    <span className="text-white/40">
                      · {new Date(data.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </span>
              ) : (
                <>
                  Tap the QR to enlarge it. Luma check-in QR — works the same
                  as the one in your confirmation email.
                </>
              )}
            </p>
            {data.ticketType && (
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 mt-2">
                {data.ticketType}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Full-screen overlay — large QR for the door scanner. */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="size-5 text-white" strokeWidth={2} />
          </button>
          <div
            className="flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl bg-white p-5 shadow-2xl">
              <Qr url={data.checkInUrl} size={420} />
            </div>
            <p className="text-white text-center max-w-xs">
              {data.name && (
                <span className="block text-lg font-medium tracking-tight">
                  {data.name}
                </span>
              )}
              <span className="block text-sm text-white/55 mt-1">
                {checkedIn
                  ? "You're already checked in."
                  : "Hand the screen to the crew at the door."}
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Qr({ url, size }: { url: string; size: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0c0a06", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [url, size]);
  if (!dataUrl) {
    return (
      <div
        className="rounded bg-stone-100 animate-pulse"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Luma check-in QR"
      width={size}
      height={size}
      className="block w-full h-auto"
    />
  );
}
