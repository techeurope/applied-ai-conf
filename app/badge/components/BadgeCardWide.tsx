import { CompanyLogosStrip } from "./CompanyLogosStrip";

function getNameFontSize(name: string): number {
  const len = name.length;
  if (len <= 5) return 52;
  if (len <= 8) return 42;
  if (len <= 12) return 34;
  return 28;
}

interface BadgeCardWideProps {
  name: string;
  imageUrl?: string | null;
}

export function BadgeCardWide({ name, imageUrl }: BadgeCardWideProps) {
  const displayName = name || "YOUR NAME";
  const fontSize = getNameFontSize(displayName);
  const isPlaceholder = !name;

  return (
    <div className="relative w-[1200px] h-[630px] overflow-hidden" style={{ background: "#05070f" }}>
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

      {/* Main content centered in space above the bottom grid */}
      <div className="absolute inset-0 z-20 flex items-center px-16" style={{ paddingBottom: 140 }}>
        {/* Left side - Photo + name + "is attending" */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-4">
            {imageUrl && (
              <div
                className="rounded-full overflow-hidden border-2 border-white/20 shrink-0"
                style={{ width: 90, height: 90 }}
              >
                <img
                  src={imageUrl}
                  alt="Attendee"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div
              className={`font-bold text-white uppercase leading-[0.95] ${
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
          <div
            className="text-sm tracking-[0.3em] uppercase text-white/30 mt-3"
            style={{ fontFamily: "'Kode Mono', monospace" }}
          >
            is attending
          </div>
        </div>

        {/* Right side - Conference branding */}
        <div className="flex flex-col items-end">
          <span
            className="text-white/40 text-base tracking-wide mb-3"
            style={{ fontFamily: "'Kode Mono', monospace" }}
          >
            {"{Tech: Europe}"}
          </span>
          <div
            className="text-white font-bold tracking-tight leading-[0.88] text-right"
            style={{ fontFamily: "'Kode Mono', monospace", fontSize: "76px" }}
          >
            <div>APPLIED</div>
            <div>AI CONF</div>
          </div>
          <div
            className="text-white/40 text-base tracking-[0.15em] uppercase mt-5"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            MAY 28, 2026 &middot; BERLIN
          </div>
        </div>
      </div>

      {/* BOTTOM — Company grid pinned to bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <CompanyLogosStrip fontSize={15} labelSize={10} cellPadding={10} label="with speakers from" />
      </div>
    </div>
  );
}
