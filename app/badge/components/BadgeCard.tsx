import { CompanyLogosStrip } from "./CompanyLogosStrip";

function getNameFontSize(name: string): number {
  const len = name.length;
  if (len <= 5) return 72;
  if (len <= 8) return 60;
  if (len <= 12) return 48;
  return 38;
}

interface BadgeCardProps {
  name: string;
}

export function BadgeCard({ name }: BadgeCardProps) {
  const displayName = name || "YOUR NAME";
  const fontSize = getNameFontSize(displayName);
  const isPlaceholder = !name;

  return (
    <div className="relative w-[1080px] h-[1080px] overflow-hidden" style={{ background: "#05070f" }}>
      {/* Aurora gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 100%, rgba(56, 189, 248, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 90%, rgba(168, 85, 247, 0.10) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 90% 20%, rgba(236, 72, 153, 0.06) 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content - vertically centered */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-16">
        {/* {Tech: Europe} label */}
        <span
          className="text-white/40 text-2xl tracking-wide mb-6"
          style={{ fontFamily: "'Kode Mono', monospace" }}
        >
          {"{Tech: Europe}"}
        </span>

        {/* Conference name - THE HERO */}
        <div
          className="text-white font-bold tracking-tight leading-[0.88] text-center"
          style={{ fontFamily: "'Kode Mono', monospace", fontSize: "148px" }}
        >
          <div>APPLIED</div>
          <div>AI CONF</div>
        </div>

        {/* Date + Location */}
        <div
          className="text-white/40 text-2xl tracking-[0.15em] uppercase mt-8"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          MAY 28, 2026 &middot; BERLIN
        </div>

        {/* Divider */}
        <div className="w-32 h-px bg-white/10 my-10" />

        {/* "I'm attending" + name */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="text-lg tracking-[0.3em] uppercase text-white/30"
            style={{ fontFamily: "'Kode Mono', monospace" }}
          >
            I&apos;M ATTENDING
          </div>
          <div
            className={`font-bold text-white text-center uppercase leading-[0.95] ${
              isPlaceholder ? "opacity-20" : ""
            }`}
            style={{
              fontFamily: "'Kode Mono', monospace",
              fontSize: `${fontSize}px`,
            }}
          >
            {displayName}
          </div>
        </div>
      </div>

      {/* Bottom - Company logos */}
      <div className="absolute bottom-12 left-12 right-12 z-20">
        <CompanyLogosStrip height={32} rowGap={28} labelSize={13} />
      </div>
    </div>
  );
}
