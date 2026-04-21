import { LifeBuoy, MessageCircle, Slack, Mail } from "lucide-react";

export function HelpCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <LifeBuoy className="w-5 h-5 text-white" />
        </div>
        <h2 className="font-mono text-lg font-semibold text-white">Need help?</h2>
      </div>

      <ul className="space-y-2 text-sm text-neutral-300">
        <li className="flex items-start gap-3">
          <MessageCircle className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <span>
            Find anyone in a black <span className="font-mono text-white">crew</span>{" "}
            t-shirt. We are here to help.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Slack className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <span>
            Attendee Slack: invite link printed on your badge.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
          <a
            href="mailto:hello@techeurope.io"
            className="text-white hover:underline underline-offset-4"
          >
            hello@techeurope.io
          </a>
        </li>
      </ul>
    </div>
  );
}
