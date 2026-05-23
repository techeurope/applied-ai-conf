import { LifeBuoy, MessageCircle, Slack, Mail } from "lucide-react";

export function HelpCard() {
  return (
    <section className="glass-card rounded-2xl p-5 space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
        <LifeBuoy className="size-3" strokeWidth={2} />
        // NEED HELP?
      </p>
      <ul className="space-y-2 text-sm text-white/80">
        <li className="flex items-start gap-2.5">
          <MessageCircle className="size-4 text-white/50 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>
            Find anyone in a black <span className="font-mono text-white">crew</span> t-shirt. We&apos;re here to help.
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Slack className="size-4 text-white/50 mt-0.5 shrink-0" strokeWidth={1.75} />
          <span>Attendee Slack: invite link printed on your badge.</span>
        </li>
        <li className="flex items-start gap-2.5">
          <Mail className="size-4 text-white/50 mt-0.5 shrink-0" strokeWidth={1.75} />
          <a href="mailto:hello@techeurope.io" className="text-white hover:underline underline-offset-4">
            hello@techeurope.io
          </a>
        </li>
      </ul>
    </section>
  );
}
