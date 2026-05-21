/* eslint-disable @next/next/no-img-element */
import { PARTNERS as PARTNERS_DATA } from "@/data/partners";

interface BadgeCardProps {
  name: string;
  role?: string;
  company?: string;
  imageUrl?: string | null;
}

const MONO = "var(--font-kode-mono), 'Kode Mono', ui-monospace, monospace";

const C = {
  bg: "rgb(9, 9, 11)",
  fg: "rgb(255, 255, 255)",
  fg70: "rgba(255, 255, 255, 0.70)",
  fg50: "rgba(255, 255, 255, 0.50)",
  fg30: "rgba(255, 255, 255, 0.30)",
  fg15: "rgba(255, 255, 255, 0.15)",
  fg08: "rgba(255, 255, 255, 0.08)",
};

/* All Premium + Gold partners, premium first. No visual distinction by tier.
   Pulled live from data so the cover stays in sync with the partners page. */
const PARTNERS_ALL = [
  ...PARTNERS_DATA.premium,
  ...PARTNERS_DATA.gold,
];
const PARTNERS_PER_ROW = 4;
const PARTNERS_ROWS = [
  PARTNERS_ALL.slice(0, PARTNERS_PER_ROW),
  PARTNERS_ALL.slice(PARTNERS_PER_ROW, PARTNERS_PER_ROW * 2),
];

/* logoScale from data is calibrated for the big partners page. On the cover
   most logos still look right, but Dust and dltHub end up far too small.
   Override only those two here, leave the rest with their data scale. */
const COVER_LOGO_SCALE: Record<string, number> = {
  Dust: 1,
  dltHub: 1,
};

const TE_GLYPH = `/$$$$$$$$ /$$$$$$$$
|__  $$__/| $$_____/
   | $$   | $$  /$$$$
   | $$   | $$$$$$$
   | $$   | $$____/
   | $$   | $$
   | $$   | $$$$$$$$
   |__/   |________/`;

/* 12 asterisks arranged in a ring — the {Tech: Europe} mark.
   Positions are pre-rounded to 4 decimal places so server and client
   serialize the SVG attributes identically (avoids hydration mismatch). */
const STAR_POSITIONS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  const r = 0.36;
  return {
    x: Math.round((0.5 + Math.cos(a) * r) * 10000) / 10000,
    y: Math.round((0.5 + Math.sin(a) * r + 0.018) * 10000) / 10000,
  };
});

function StarRing({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 1 1" width={size} height={size} aria-hidden="true">
      {STAR_POSITIONS.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={0.16}
          fill="currentColor"
        >
          *
        </text>
      ))}
    </svg>
  );
}

function EventStamp() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: MONO,
        fontSize: 22,
        lineHeight: 1,
        color: C.fg,
      }}
    >
      <StarRing size={30} />
      <span>{"{Tech: Europe}"}</span>
      <span style={{ color: C.fg30 }}>/</span>
      <span>Applied AI Conference 2026</span>
    </div>
  );
}

function Rule({
  label,
  total = 64,
  color = C.fg,
  style,
}: {
  label?: string;
  total?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  const text = label ? `---- ${label} ` : "";
  const dashes = "-".repeat(Math.max(0, total - text.length));
  return (
    <pre
      style={{
        fontFamily: MONO,
        fontSize: 22,
        lineHeight: 1,
        whiteSpace: "pre",
        color,
        margin: 0,
        ...style,
      }}
    >
      {text + dashes}
    </pre>
  );
}

function Headshot({
  imageUrl,
  size,
}: {
  imageUrl?: string | null;
  size: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        border: `1px dashed ${C.fg}`,
        background: "#0a0a0c",
        overflow: "hidden",
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.fg30,
            fontFamily: MONO,
            fontSize: 18,
          }}
        >
          + photo.jpg
        </div>
      )}
      {/* Halftone dot overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(9,9,11,0.78) 1.1px, transparent 1.7px)",
          backgroundSize: "5px 5px",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export function BadgeCard({ name, role, company, imageUrl }: BadgeCardProps) {
  const displayName = name || "Your name";
  const isPlaceholder = !name;
  const heroLine = "I'll be there.";

  return (
    <div
      style={{
        position: "relative",
        width: 1080,
        height: 1080,
        background: C.bg,
        color: C.fg,
        fontFamily: MONO,
        overflow: "hidden",
        userSelect: "none",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Faint corner glyph */}
      <pre
        style={{
          position: "absolute",
          top: -10,
          left: -40,
          margin: 0,
          fontFamily: MONO,
          fontSize: 14,
          lineHeight: "14px",
          whiteSpace: "pre",
          color: C.fg08,
          pointerEvents: "none",
        }}
      >
        {TE_GLYPH}
      </pre>

      {/* Outer dashed frame */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
          border: `1px dashed ${C.fg}`,
          padding: "44px 48px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <EventStamp />
          <span style={{ fontSize: 18, lineHeight: 1, color: C.fg50 }}>
            /post · attendee
          </span>
        </header>

        <Rule total={64} color={C.fg30} style={{ marginTop: 28 }} />

        {/* Body: photo + attendee */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "420px 1fr",
            gap: 44,
            alignItems: "start",
            marginTop: 36,
          }}
        >
          <Headshot imageUrl={imageUrl} size={420} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              paddingTop: 8,
            }}
          >
            <div style={{ fontSize: 18, lineHeight: 1, color: C.fg50 }}>
              + NAME
            </div>
            <div
              style={{
                fontSize: 64,
                lineHeight: 1.04,
                letterSpacing: "-0.5px",
                wordBreak: "break-word",
                opacity: isPlaceholder ? 0.3 : 1,
              }}
            >
              {displayName}
            </div>

            {(role || company) && (
              <>
                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 1,
                    color: C.fg50,
                    marginTop: 12,
                  }}
                >
                  + ROLE
                </div>
                {role && (
                  <div
                    style={{
                      fontSize: 38,
                      lineHeight: 1.12,
                      wordBreak: "break-word",
                    }}
                  >
                    {role}
                  </div>
                )}
                {company && (
                  <div
                    style={{
                      fontSize: 24,
                      lineHeight: 1.12,
                      color: C.fg50,
                      wordBreak: "break-word",
                      marginTop: role ? 6 : 0,
                    }}
                  >
                    @ {company}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom block — anchored to the bottom of the dashed frame */}
        <div style={{ marginTop: "auto", paddingTop: 36 }}>
          <Rule label={heroLine} total={64} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginTop: 28,
              gap: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 18, lineHeight: 1, color: C.fg50 }}>
                DATE
              </div>
              <div style={{ fontSize: 22, lineHeight: 1, marginTop: 8 }}>
                May 28, 2026
              </div>
            </div>
            <div>
              <div style={{ fontSize: 18, lineHeight: 1, color: C.fg50 }}>
                VENUE
              </div>
              <div style={{ fontSize: 22, lineHeight: 1, marginTop: 8 }}>
                The Delta Campus, Berlin
              </div>
            </div>
            <div>
              <div style={{ fontSize: 18, lineHeight: 1, color: C.fg50 }}>
                URL
              </div>
              <div style={{ fontSize: 22, lineHeight: 1, marginTop: 8 }}>
                conference.techeurope.io
              </div>
            </div>
          </div>

          {/* Muted dashed separator between meta info and partners */}
          <Rule total={64} color={C.fg30} style={{ marginTop: 28 }} />

          {/* Partner logos — premium first, then gold, no tier distinction. */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ fontSize: 18, lineHeight: 1, color: C.fg50 }}>
              PARTNERS
            </div>
            {PARTNERS_ROWS.map((row, ri) => (
              <div
                key={ri}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 32,
                }}
              >
                {row.map((p) => {
                  const scale = COVER_LOGO_SCALE[p.name] ?? p.logoScale;
                  return (
                    <div
                      key={p.name}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 48,
                      }}
                    >
                      <img
                        src={p.logo}
                        alt={p.logoAlt}
                        style={{
                          maxHeight: 48,
                          maxWidth: "100%",
                          objectFit: "contain",
                          filter: "brightness(0) invert(1)",
                          transform: scale ? `scale(${scale})` : undefined,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
