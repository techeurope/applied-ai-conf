"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { IdCard, Ticket, Users, LogIn } from "lucide-react";

// Pitch surface for signed-out attendees. When the user is signed in this
// component renders nothing — personal context for signed-in users lives in
// the dedicated callout components (SpeakerCallout, VoucherReminder), so the
// landing never duplicates the top nav.
export function AuthRibbon() {
  const auth = useAuth();
  const pathname = usePathname();

  if (auth.loading) return null;
  if (auth.user) return null;

  const returnTo = encodeURIComponent(pathname ?? "/app");

  return (
    <section className="rounded-2xl ring-1 ring-emerald-300/40 bg-emerald-400/[0.06] p-5 space-y-3 [box-shadow:0_0_40px_-16px_rgba(52,211,153,0.4)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-200">
        // YOUR ACCOUNT
      </p>
      <p className="text-sm text-white/80 leading-relaxed">
        Sign in with your Luma ticket email to:
      </p>
      <ul className="space-y-1.5 text-sm text-white/70">
        <Bullet icon={IdCard}>Get your badge · scan others to capture contacts</Bullet>
        <Bullet icon={Ticket}>Claim your lunch voucher</Bullet>
        <Bullet icon={Users}>Favorite talks and build your own schedule</Bullet>
      </ul>
      <a
        href={`/api/auth/sign-in?return_to=${returnTo}`}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-mono text-sm hover:scale-[1.02] transition-transform"
      >
        <LogIn className="size-3.5" strokeWidth={2} />
        Sign in
      </a>
    </section>
  );
}

function Bullet({
  icon: Icon,
  children,
}: {
  icon: typeof IdCard;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="size-4 text-emerald-200/80 mt-0.5 shrink-0" strokeWidth={1.75} />
      <span>{children}</span>
    </li>
  );
}
