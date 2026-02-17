// Company logos for speaker companies (white/light versions for dark backgrounds)
// Each logo has a manually tuned maxWidth (in px at slotHeight=30) to normalize
// visual weight across different aspect ratios and baked-in whitespace.
interface Logo {
  name: string;
  src: string;
  /** Max width relative to base slotHeight of 30. Scales proportionally. */
  maxW: number;
}

const ROW_1: Logo[] = [
  { name: "Langdock", src: "/logos/langdock_dark.png", maxW: 110 },
  { name: "Choco", src: "/logos/choco_dark.png", maxW: 70 },
  { name: "Legora", src: "/logos/legora_dark.png", maxW: 60 },
  { name: "Knowunity", src: "/logos/knowunity_dark.png", maxW: 110 },
  { name: "VEED.IO", src: "/logos/veed.svg", maxW: 90 },
];

const ROW_2: Logo[] = [
  { name: "Codewords", src: "/logos/codewords.svg", maxW: 120 },
  { name: "Tacto", src: "/logos/tacto_dark.png", maxW: 90 },
  { name: "Dust", src: "/logos/dust.svg", maxW: 70 },
  { name: "Intercom", src: "/logos/intercom.svg", maxW: 30 },
];

interface CompanyLogosStripProps {
  /** Height of each logo slot in px */
  slotHeight?: number;
  /** Gap between the two logo rows */
  rowGap?: number;
  /** Font size for the label */
  labelSize?: number;
  /** Custom label text */
  label?: string;
}

const BASE_SLOT_HEIGHT = 30;

export function CompanyLogosStrip({
  slotHeight = 30,
  rowGap = 20,
  labelSize = 13,
  label = "Speakers from",
}: CompanyLogosStripProps) {
  const scaleFactor = slotHeight / BASE_SLOT_HEIGHT;

  return (
    <div className="flex flex-col w-full" style={{ gap: rowGap }}>
      <span
        className="uppercase tracking-[0.25em] text-white/30 text-center"
        style={{
          fontFamily: "'Kode Mono', monospace",
          fontSize: `${labelSize}px`,
        }}
      >
        {label}
      </span>
      <div className="flex items-center justify-between w-full">
        {ROW_1.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center justify-center"
            style={{
              height: slotHeight,
              width: `${100 / ROW_1.length}%`,
            }}
          >
            <img
              src={logo.src}
              alt={logo.name}
              crossOrigin="anonymous"
              className="object-contain opacity-50"
              style={{
                maxHeight: slotHeight,
                maxWidth: logo.maxW * scaleFactor,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between w-full">
        {ROW_2.map((logo) => (
          <div
            key={logo.name}
            className="flex items-center justify-center"
            style={{
              height: slotHeight,
              width: `${100 / ROW_2.length}%`,
            }}
          >
            <img
              src={logo.src}
              alt={logo.name}
              crossOrigin="anonymous"
              className="object-contain opacity-50"
              style={{
                maxHeight: slotHeight,
                maxWidth: logo.maxW * scaleFactor,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
