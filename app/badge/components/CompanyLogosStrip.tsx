// Company logos for speaker companies (white/light versions for dark backgrounds)
// Two rows distributed across full width
const ROW_1 = [
  { name: "Langdock", src: "/logos/langdock_dark.png" },
  { name: "Choco", src: "/logos/choco_dark.png" },
  { name: "Legora", src: "/logos/legora_dark.png" },
  { name: "Knowunity", src: "/logos/knowunity_dark.png" },
  { name: "VEED.IO", src: "/logos/veed.svg" },
];

const ROW_2 = [
  { name: "Codewords", src: "/logos/codewords.svg" },
  { name: "Tacto", src: "/logos/tacto_dark.png" },
  { name: "Dust", src: "/logos/dust.svg" },
  { name: "Intercom", src: "/logos/intercom.svg" },
];

interface CompanyLogosStripProps {
  height?: number;
  rowGap?: number;
  labelSize?: number;
}

export function CompanyLogosStrip({
  height = 30,
  rowGap = 20,
  labelSize = 13,
}: CompanyLogosStripProps) {
  return (
    <div className="flex flex-col w-full" style={{ gap: rowGap }}>
      <span
        className="uppercase tracking-[0.25em] text-white/30 text-center"
        style={{
          fontFamily: "'Kode Mono', monospace",
          fontSize: `${labelSize}px`,
        }}
      >
        Speakers from
      </span>
      <div className="flex items-center justify-between w-full">
        {ROW_1.map((logo) => (
          <img
            key={logo.name}
            src={logo.src}
            alt={logo.name}
            crossOrigin="anonymous"
            className="object-contain opacity-50"
            style={{ height, width: "auto" }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between w-full">
        {ROW_2.map((logo) => (
          <img
            key={logo.name}
            src={logo.src}
            alt={logo.name}
            crossOrigin="anonymous"
            className="object-contain opacity-50"
            style={{ height, width: "auto" }}
          />
        ))}
      </div>
    </div>
  );
}
