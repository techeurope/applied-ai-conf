import Link from "next/link";

export function Footer({ accent = "white" }: { accent?: "white" | "violet" | "amber" | "sky" | "emerald" }) {
  const hover: Record<typeof accent, string> = {
    white: "hover:text-white",
    violet: "hover:text-violet-200",
    amber: "hover:text-amber-200",
    sky: "hover:text-sky-200",
    emerald: "hover:text-emerald-200",
  };
  return (
    <footer className="w-full">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14 py-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        <Link href="/code-of-conduct" className={hover[accent]}>code of conduct</Link>
        <Link href="/privacy" className={hover[accent]}>privacy</Link>
        <Link href="/imprint" className={hover[accent]}>imprint</Link>
        <Link href="/" className={`${hover[accent]} ml-auto`}>‹ techeurope.io</Link>
      </div>
    </footer>
  );
}
