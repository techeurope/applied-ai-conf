import Link from "next/link";
import { Mic, Users, Workflow, Compass, Wrench, Shield } from "lucide-react";
import { PageHeader, PageFooter } from "../_static/PageHeader";

export const metadata = {
  title: "About · Applied AI Conf",
};

const CLUSTERS = [
  {
    icon: Wrench,
    title: "AI Engineering",
    body: "Coding, testing, deploying with AI. How engineers integrate AI into their daily development workflow.",
  },
  {
    icon: Workflow,
    title: "Production Case Studies",
    body: "What shipped, what broke, what changed. Architecture decisions, rollout plans, incident postmortems.",
  },
  {
    icon: Compass,
    title: "LLM Application Architecture",
    body: "RAG vs fine-tuning, multi-model routing, tool calling, agent orchestration, context engineering.",
  },
  {
    icon: Mic,
    title: "Evaluation, Observability & Quality",
    body: "Offline eval, online A/B, regression suites, guardrails, golden datasets, LLM-as-judge, tracing.",
  },
  {
    icon: Users,
    title: "LLMOps & AI Infrastructure",
    body: "Cost control, latency, deployment, reliability. Serving patterns, batching, streaming, fallback systems.",
  },
  {
    icon: Shield,
    title: "Enterprise Readiness",
    body: "Security, privacy, governance, compliance. Prompt injection, data leakage, permissions, policy-as-code.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8 pt-1">
      <PageHeader
        eyebrow="// applied ai conf · 01"
        title={<>What this is.</>}
        lede={
          <>
            One day in Berlin for engineers shipping AI to production. Two
            stages, twenty-five speakers, lunch in the middle. No product
            pitches. Just war stories, reference architectures, and the
            decisions behind them.
          </>
        }
      />

      <section className="grid sm:grid-cols-2 gap-4">
        <Block
          eyebrow="// for who"
          title="Builders shipping it"
          body="Senior engineers, CTOs, founders, and technical product people who already have AI in production — or are weeks away from it. Curated, in-person, single track of conversation."
        />
        <Block
          eyebrow="// not for"
          title="Tourists"
          body="No keynote selling something. No futurology. No on-the-roadmap. If a talk doesn't reference real systems with real users, it doesn't run."
        />
      </section>

      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          // the format
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Format
            tag="MAIN STAGE"
            tone="emerald"
            title="Keynotes & talks"
            body="For CTOs, founders, engineering leaders, senior engineers. Tooling discussed only in the context of production deployment stories. No parallel session during keynotes."
          />
          <Format
            tag="SIDE STAGE"
            tone="violet"
            title="Deep dives & demos"
            body="Workshops, teardowns, partner demos. Smaller room, louder opinions. Hands-on takeaways."
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            // six topic clusters
          </p>
          <Link
            href="/app/programme"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 hover:text-white"
          >
            programme detail →
          </Link>
        </div>
        <ul className="grid sm:grid-cols-2 gap-3">
          {CLUSTERS.map((c, i) => {
            const Icon = c.icon;
            return (
              <li
                key={c.title}
                className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-4 space-y-2 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-emerald-200/80" strokeWidth={1.75} />
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-sm text-white font-medium">{c.title}</h3>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{c.body}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl ring-1 ring-emerald-300/25 bg-emerald-400/[0.04] p-5 sm:p-6 space-y-2 [box-shadow:0_0_60px_-24px_rgba(52,211,153,0.4)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-200">
          // the two panels
        </p>
        <p className="text-base sm:text-lg text-white leading-snug max-w-2xl">
          <span className="text-emerald-200">"What broke in production and what we changed."</span>{" "}
          War stories from across themes. Real failures, debugging journeys, the fixes.
        </p>
        <p className="text-base sm:text-lg text-white leading-snug max-w-2xl">
          <span className="text-emerald-200">"The 2026 production stack."</span>{" "}
          Eval + infra + architecture + constraints. What it actually looks like today.
        </p>
      </section>

      <PageFooter />
    </div>
  );
}

function Block({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl ring-1 ring-white/10 bg-white/[0.02] p-5 space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
        {eyebrow}
      </p>
      <h2 className="text-xl text-white font-medium tracking-tight">{title}</h2>
      <p className="text-sm text-white/60 leading-relaxed">{body}</p>
    </div>
  );
}

function Format({
  tag,
  tone,
  title,
  body,
}: {
  tag: string;
  tone: "emerald" | "violet";
  title: string;
  body: string;
}) {
  const t =
    tone === "emerald"
      ? { ring: "ring-emerald-300/30", text: "text-emerald-200", bg: "bg-emerald-400/[0.04]" }
      : { ring: "ring-violet-300/30", text: "text-violet-200", bg: "bg-violet-400/[0.04]" };
  return (
    <div className={`rounded-2xl ring-1 ${t.ring} ${t.bg} p-5 space-y-2`}>
      <p className={`font-mono text-[10px] uppercase tracking-[0.25em] ${t.text}`}>
        {tag}
      </p>
      <h3 className="text-lg text-white font-medium tracking-tight">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{body}</p>
    </div>
  );
}
