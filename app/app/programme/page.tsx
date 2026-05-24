import Link from "next/link";
import { ArrowRight, FlaskConical, Layers, Receipt, Target, Wrench, Workflow } from "lucide-react";
import { PageHeader, PageFooter } from "../_static/PageHeader";

export const metadata = {
  title: "Programme · Applied AI Conf",
};

const LENSES = [
  { num: "01", icon: Target, title: "Decision framework", body: "Why we chose X over Y." },
  { num: "02", icon: FlaskConical, title: "Failure postmortem", body: "What broke and how we fixed it." },
  { num: "03", icon: Receipt, title: "Metrics-driven", body: "What we measured, what moved." },
  { num: "04", icon: Layers, title: "Reference architecture", body: "A pattern you can copy." },
  { num: "05", icon: Wrench, title: "Hard constraints", body: "Latency, cost, privacy, scale." },
  { num: "06", icon: Workflow, title: "Tooling workflow", body: "Pipeline end to end." },
];

const STRUCTURE = [
  { time: "09:10", title: "Opening keynote", note: "Main stage only." },
  { time: "09:45 – 12:25", title: "Morning programme", note: "Six talks per stage, 20 min each, 5 min changeover." },
  { time: "12:30", title: "Lunch", note: "60 minutes. Expo hall." },
  { time: "13:30", title: "Afternoon programme", note: "Main stage talks + side stage deep dives." },
  { time: "15:10", title: "Coffee", note: "20 minutes." },
  { time: "15:30", title: "Final block", note: "Talks, then the two closing panels." },
  { time: "17:30", title: "Closing remarks", note: "And drinks." },
];

export default function ProgrammePage() {
  return (
    <div className="space-y-8 pt-1">
      <PageHeader
        eyebrow="// applied ai conf · 02"
        title={<>The programme.</>}
        lede={
          <>
            Six topic clusters, six engineering lenses, two stages. The rules
            are simple: no product pitches, no parallel session during
            keynotes, and no repeating the same lens twice on the same stage.
          </>
        }
      />

      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // shape of the day
        </p>
        <ol className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
          {STRUCTURE.map((row) => (
            <li
              key={row.time}
              className="grid grid-cols-[100px_1fr] gap-4 px-4 sm:px-5 py-3 items-baseline"
            >
              <span className="font-mono text-sm text-white/85 tabular-nums">
                {row.time}
              </span>
              <div>
                <p className="text-sm text-white">{row.title}</p>
                <p className="text-xs text-white/45 mt-0.5">{row.note}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link
          href="/app/agenda"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white pt-1"
        >
          See the full agenda by minute
          <ArrowRight className="size-3" strokeWidth={1.75} />
        </Link>
      </section>

      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // six engineering lenses
        </p>
        <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
          Every session gets a primary area (cluster) and an engineering lens.
          Within the same area, the same lens won't repeat on the same stage —
          so you never see two failure postmortems back to back.
        </p>
        <ul className="grid sm:grid-cols-2 gap-3">
          {LENSES.map((l) => {
            const Icon = l.icon;
            return (
              <li
                key={l.num}
                className="rounded-xl ring-1 ring-white/10 bg-white/[0.02] p-4 flex items-start gap-3"
              >
                <Icon className="size-4 text-emerald-200/80 mt-1 shrink-0" strokeWidth={1.75} />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 tabular-nums">
                    {l.num} · {l.title}
                  </p>
                  <p className="text-sm text-white/70 mt-1">{l.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl ring-1 ring-emerald-300/25 bg-emerald-400/[0.04] p-5 sm:p-6 space-y-3 [box-shadow:0_0_60px_-24px_rgba(52,211,153,0.35)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-200">
          // the two panels
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200/70 mb-1">
              PANEL 1
            </p>
            <p className="text-base text-white font-medium leading-snug">
              "What broke in production, and what we changed."
            </p>
            <p className="text-xs text-white/55 mt-1.5 leading-relaxed">
              War stories from across themes. Speakers share real failures, debugging journeys, and the changes they made.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200/70 mb-1">
              PANEL 2
            </p>
            <p className="text-base text-white font-medium leading-snug">
              "The 2026 production stack."
            </p>
            <p className="text-xs text-white/55 mt-1.5 leading-relaxed">
              Eval + infra + architecture + constraints. What the production-grade AI stack actually looks like today.
            </p>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
