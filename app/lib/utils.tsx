import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Kerning fixes for problematic letter combinations in Kode Mono
// The "j" character has wide left and right bearings in Kode Mono
export function applyKerning(word: string): React.ReactNode {
  if (!word.includes("j")) {
    return word;
  }

  // Split by "j" to handle each instance
  const parts = word.split(/(j)/);
  return parts.map((part, i) => {
    if (part === "j") {
      const prevPart = parts[i - 1];
      const nextPart = parts[i + 1];
      const hasPrev = prevPart && prevPart.length > 0;
      const hasNext = nextPart && nextPart.length > 0;

      // Apply more aggressive negative margin on the left (worse issue)
      // Apply less aggressive negative margin on the right
      const leftMargin = hasPrev ? "-0.15em" : "0";
      const rightMargin = hasNext ? "-0.06em" : "0";

      return (
        <span
          key={i}
          style={{
            marginLeft: leftMargin,
            marginRight: rightMargin,
          }}
        >
          j
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
