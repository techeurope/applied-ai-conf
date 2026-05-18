import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { ScanLine, Users, Compass, CalendarDays } from "lucide-react";

export default async function ConnectHome() {
  const { user } = await withAuth();

  if (user) {
    redirect("/connect/scan");
  }

  return (
    <div className="space-y-12 pt-8 sm:pt-16">
      <header className="space-y-6 text-center sm:text-left">
        <h1 className="font-mono font-bold text-5xl sm:text-7xl tracking-tighter leading-[1.05] pb-1 text-glow">
          connect
        </h1>
        <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-prose">
          Scan, capture, and keep the people you meet at Applied AI Conf.
          <br className="hidden sm:block" />
          Works offline. Everyone scans everyone. No tiers.
        </p>
      </header>

      <a
        href="/api/auth/sign-in"
        className="group inline-flex items-center justify-center w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-black font-mono text-sm font-medium shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] transition-all ring-1 ring-white/30"
      >
        Sign in to continue
      </a>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
        {[
          { icon: ScanLine, title: "Scan QR codes", body: "Capture contacts in one tap. The camera reads any Connect QR." },
          { icon: Users, title: "Notes & tags", body: "Add context the moment you meet. Searchable later." },
          { icon: Compass, title: "Browse the room", body: "See who's here, who's interesting, who matches your goals." },
          { icon: CalendarDays, title: "Agenda, offline", body: "The whole schedule in your pocket, even if the wifi dies." },
        ].map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="glass-card rounded-2xl p-5 hover:border-white/20 transition-colors"
          >
            <Icon className="size-5 text-white/70 mb-4" strokeWidth={1.5} />
            <div className="font-mono text-sm text-white mb-1.5">{title}</div>
            <div className="text-sm text-white/50 leading-relaxed">{body}</div>
          </div>
        ))}
      </section>

      <footer className="pt-6 border-t border-white/5">
        <p className="text-xs text-white/40 leading-relaxed">
          Applied AI Conf · May 28, 2026 · The Delta Campus, Berlin
        </p>
      </footer>
    </div>
  );
}
