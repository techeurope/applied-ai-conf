"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { ArrowUpRight, CheckCircle2, Ticket } from "lucide-react";
import { api } from "@convex/_generated/api";
import { FullScreenQr } from "./FullScreenQr";
import { useCachedQuery } from "@/lib/useCachedQuery";
import { useHasHydrated } from "@/lib/use-has-hydrated";

type CheckInData = NonNullable<
  ReturnType<typeof useQuery<typeof api.luma.myCheckIn>>
>;

// Slim "your ticket" card on /app. The QR itself never renders inline —
// tapping the card opens a full-screen overlay with the Luma check-in QR
// so the user can hold the phone up to a scanner without distractions.
//
// Hidden when the user has no Luma data yet (e.g. account created but
// ticket not linked, or the Luma sync hasn't run since the backfill).
export function LumaCheckInCard() {
  const data: ReturnType<typeof useQuery<typeof api.luma.myCheckIn>> =
    useCachedQuery(api.luma.myCheckIn, {}, "luma.myCheckIn");
  const [open, setOpen] = useState(false);
  // Same hydration gate as AppShell: `useCachedQuery` returns the
  // localStorage snapshot synchronously on the client, so without this
  // the server renders the skeleton (data undefined) while the first
  // client render goes straight to the real <button> — classic
  // hydration mismatch.
  const hasHydrated = useHasHydrated();

  if (!hasHydrated || data === undefined) return <LumaCheckInSkeleton />;
  if (data === null) return null;
  if (!data.checkInUrl) return null;

  const checkedIn = !!data.checkedInAt;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full text-left rounded-2xl ring-1 ring-emerald-300/30 bg-gradient-to-br from-emerald-400/[0.08] to-emerald-400/[0.02] hover:from-emerald-400/[0.12] hover:ring-emerald-300/50 transition-colors p-4 sm:p-5 flex items-center gap-4"
        aria-label="Show your check-in QR"
      >
        <div className="size-12 sm:size-14 rounded-xl bg-emerald-400/15 ring-1 ring-emerald-300/30 flex items-center justify-center shrink-0">
          <Ticket className="size-5 sm:size-6 text-emerald-200" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200">
            Your ticket
          </p>
          <p className="text-base sm:text-lg text-white font-medium leading-tight mt-1">
            {checkedIn ? "You're checked in." : "Tap to show your check-in QR."}
          </p>
          {checkedIn ? (
            <p className="text-xs text-white/55 mt-1 inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-300" strokeWidth={2} />
              Checked in
              {data.checkedInAt && (
                <span className="text-white/40">
                  ·{" "}
                  {new Date(data.checkedInAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {data.ticketType && (
                <span className="text-white/40">· {data.ticketType}</span>
              )}
            </p>
          ) : (
            <p className="text-xs text-white/55 mt-1">
              Hand the screen to the crew at the door.
              {data.ticketType && (
                <span className="text-white/35"> · {data.ticketType}</span>
              )}
            </p>
          )}
        </div>
        <ArrowUpRight
          className="size-4 text-emerald-200/70 group-hover:text-emerald-200 shrink-0 transition-colors"
          strokeWidth={1.75}
        />
      </button>

      <FullScreenQr
        open={open}
        value={data.checkInUrl}
        title={data.name ?? undefined}
        caption={<CheckInCaption data={data} checkedIn={checkedIn} />}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

// Identity block shown under the QR in the full-screen overlay. The crew
// scanning the QR can read the email + ticket type to verify the person on
// stage matches the registered guest. Approval status surfaces edge cases
// (waitlisted / declined) so they're not turned away silently.
function CheckInCaption({
  data,
  checkedIn,
}: {
  data: CheckInData;
  checkedIn: boolean;
}) {
  return (
    <span className="block">
      <span className="block text-white/70">
        {checkedIn
          ? "You're already checked in."
          : "Hand the screen to the crew at the door."}
      </span>
      <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-white/55 mt-3 space-y-0.5">
        {data.email && (
          <span className="block normal-case tracking-normal font-sans text-white/75 break-all">
            {data.email}
          </span>
        )}
        <span className="block">
          {[
            data.ticketType,
            data.approvalStatus === "approved" ? null : data.approvalStatus,
            data.registeredAt
              ? `registered ${new Date(data.registeredAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
    </span>
  );
}

// Matches the outer dimensions of the real card so the page below doesn't
// shift when the data resolves.
function LumaCheckInSkeleton() {
  return (
    <section
      className="rounded-2xl ring-1 ring-emerald-300/15 bg-gradient-to-br from-emerald-400/[0.04] to-emerald-400/[0.01] p-4 sm:p-5 flex items-center gap-4"
      aria-hidden
    >
      <div className="size-12 sm:size-14 rounded-xl bg-white/[0.05] animate-pulse shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" />
        <div className="h-5 w-64 max-w-full rounded bg-white/[0.06] animate-pulse" />
        <div className="h-3 w-48 max-w-full rounded bg-white/[0.04] animate-pulse" />
      </div>
    </section>
  );
}
