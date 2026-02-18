// Speaker company names in a bordered grid (table-style)
const ROW_1 = ["Langdock", "Choco", "Legora", "Knowunity", "VEED.IO"];
const ROW_2 = ["Codewords", "Tacto", "Dust", "Intercom"];

interface CompanyLogosStripProps {
  /** Font size for company names */
  fontSize?: number;
  /** Font size for the label */
  labelSize?: number;
  /** Custom label text */
  label?: string;
  /** Vertical padding inside each cell */
  cellPadding?: number;
}

export function CompanyLogosStrip({
  fontSize = 16,
  labelSize = 13,
  label = "Speakers from",
  cellPadding = 14,
}: CompanyLogosStripProps) {
  const borderColor = "rgba(255,255,255,0.10)";
  const cellStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: `${fontSize}px`,
    padding: `${cellPadding}px 0`,
    borderRight: `1px solid ${borderColor}`,
  };

  return (
    <div className="flex flex-col w-full" style={{ gap: 16 }}>
      <span
        className="uppercase tracking-[0.25em] text-white/30 text-center"
        style={{
          fontFamily: "'Kode Mono', monospace",
          fontSize: `${labelSize}px`,
        }}
      >
        {label}
      </span>
      <div
        className="w-full"
        style={{ borderTop: `1px solid ${borderColor}` }}
      >
        {/* Row 1 */}
        <div
          className="flex w-full"
          style={{
            borderBottom: `1px solid ${borderColor}`,
            borderLeft: `1px solid ${borderColor}`,
          }}
        >
          {ROW_1.map((name) => (
            <span
              key={name}
              className="text-white/40 text-center"
              style={{
                ...cellStyle,
                width: `${100 / ROW_1.length}%`,
              }}
            >
              {name}
            </span>
          ))}
        </div>
        {/* Row 2 */}
        <div
          className="flex w-full"
          style={{
            borderBottom: `1px solid ${borderColor}`,
            borderLeft: `1px solid ${borderColor}`,
          }}
        >
          {ROW_2.map((name) => (
            <span
              key={name}
              className="text-white/40 text-center"
              style={{
                ...cellStyle,
                width: `${100 / ROW_2.length}%`,
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
