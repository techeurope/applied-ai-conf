import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  lede,
  backHref = "/app",
  backLabel = "Home",
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="space-y-3">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-white"
      >
        <ArrowLeft className="size-3" strokeWidth={1.75} />
        {backLabel}
      </Link>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        {eyebrow}
      </p>
      <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tighter leading-[0.95]">
        <span className="text-glow">{title}</span>
      </h1>
      {lede && (
        <p className="text-base sm:text-lg text-white/65 max-w-2xl leading-relaxed">
          {lede}
        </p>
      )}
    </header>
  );
}

export function PageFooter() {
  return (
    <footer className="pt-6 mt-2 border-t border-white/5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
      <Link href="/app/programme" className="hover:text-white">programme</Link>
      <Link href="/app/venue" className="hover:text-white">venue</Link>
      <Link href="/app/travel" className="hover:text-white">travel</Link>
      <Link href="/code-of-conduct" className="hover:text-white">code of conduct</Link>
      <Link href="/" className="hover:text-white ml-auto">‹ techeurope.io</Link>
    </footer>
  );
}
