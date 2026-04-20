"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ChevronDown, Download } from "lucide-react";
import { PARTNERS } from "@/data/partners";
import { CONFERENCE_INFO } from "@/data/conference";
import type { Partner, PartnerTier } from "@/types";
import { PartnerCard } from "./components/PartnerCard";

const RESOLUTIONS = {
  "1K": 1024,
  "2K": 2048,
  "4K": 4096,
} as const;

type ResolutionKey = keyof typeof RESOLUTIONS;

const STORAGE_KEY = "partners-selected-index";
const BASE_SIZE = 1080;

const FONT_URLS = [
  "https://fonts.googleapis.com/css2?family=Kode+Mono:wght@400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap",
];

let fontEmbedCSSCache: string | null = null;

async function getFontEmbedCSS(): Promise<string> {
  if (fontEmbedCSSCache) return fontEmbedCSSCache;

  try {
    const cssPromises = FONT_URLS.map(async (url) => {
      const response = await fetch(url);
      return response.text();
    });

    const cssTexts = await Promise.all(cssPromises);
    let combinedCSS = cssTexts.join("\n");

    const fontUrlRegex = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g;
    const fontUrls = new Set<string>();
    let match;
    while ((match = fontUrlRegex.exec(combinedCSS)) !== null) {
      fontUrls.add(match[1]);
    }

    const fontDataMap = new Map<string, string>();
    await Promise.all(
      Array.from(fontUrls).map(async (fontUrl) => {
        try {
          const response = await fetch(fontUrl);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          fontDataMap.set(fontUrl, base64);
        } catch (e) {
          console.warn("Failed to fetch font:", fontUrl, e);
        }
      })
    );

    fontDataMap.forEach((base64, url) => {
      combinedCSS = combinedCSS.split(url).join(base64);
    });

    fontEmbedCSSCache = combinedCSS;
    return combinedCSS;
  } catch (e) {
    console.warn("Failed to fetch font CSS:", e);
    return "";
  }
}

interface FlatPartner extends Partner {
  tier: PartnerTier;
}

function flattenPartners(): FlatPartner[] {
  const order: PartnerTier[] = ["premium", "gold", "community"];
  return order.flatMap((tier) =>
    PARTNERS[tier].map((p) => ({ ...p, tier }))
  );
}

const TIER_LABEL: Record<PartnerTier, string> = {
  premium: "Premium",
  gold: "Gold",
  community: "Community",
};

export default function PartnersMarketingPage() {
  const allPartners = useMemo(() => flattenPartners(), []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const index = parseInt(stored, 10);
      if (!isNaN(index) && index >= 0 && index < allPartners.length) {
        setSelectedIndex(index);
      }
    }
  }, [allPartners.length]);

  const [selectedResolution, setSelectedResolution] =
    useState<ResolutionKey>("2K");
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingSvg, setIsExportingSvg] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const svgCardRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.5);

  const partner = allPartners[selectedIndex];
  const dateLine = CONFERENCE_INFO.dateDisplay.toUpperCase();

  const handlePartnerChange = (index: number) => {
    setSelectedIndex(index);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, index.toString());
    }
  };

  const filenameBase = partner
    ? `${partner.tier}_${partner.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`
    : "partner";

  const handleExport = async () => {
    if (!cardRef.current || isExporting) return;

    setIsExporting(true);
    try {
      await document.fonts.ready;
      const fontEmbedCSS = await getFontEmbedCSS();

      const resolution = RESOLUTIONS[selectedResolution];
      const pixelRatio = resolution / BASE_SIZE;

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio,
        fontEmbedCSS,
        skipFonts: true,
      });

      const link = document.createElement("a");
      link.download = `${filenameBase}_${resolution}x${resolution}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSvg = async () => {
    if (!svgCardRef.current || isExportingSvg) return;

    setIsExportingSvg(true);
    try {
      await document.fonts.ready;
      const { elementToSVG, inlineResources } = await import("dom-to-svg");
      const svgDocument = elementToSVG(svgCardRef.current);
      await inlineResources(svgDocument.documentElement);
      const svgString = new XMLSerializer().serializeToString(svgDocument);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.download = `${filenameBase}_vector.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("SVG export error:", error);
      alert("Failed to export SVG. Please try again.");
    } finally {
      setIsExportingSvg(false);
    }
  };

  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;

    const updateScale = () => {
      const { width, height } = element.getBoundingClientRect();
      const maxSize = Math.min(width, height);
      const newScale = maxSize / BASE_SIZE;
      setScale(Math.max(0.2, Math.min(newScale, 1)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!partner) {
    return (
      <div className="min-h-screen bg-[#05070f] text-white p-8">
        No partners configured.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <div className="border-b border-white/10 px-6 py-4">
        <h1 className="font-mono text-xl tracking-tight">
          Partner Marketing Assets
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Select partner and export at 1K/2K/4K
        </p>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Preview */}
        <div
          ref={previewRef}
          className="flex-1 flex items-center justify-center p-8 overflow-hidden"
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            <div ref={cardRef}>
              <PartnerCard
                partner={partner}
                tier={partner.tier}
                conferenceDate={dateLine}
              />
            </div>
          </div>
        </div>

        {/* Hidden card rendered at origin for SVG export */}
        <div
          aria-hidden
          ref={svgCardRef}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            clipPath: "inset(100%)",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <PartnerCard
            partner={partner}
            tier={partner.tier}
            conferenceDate={dateLine}
            hideLogo
          />
        </div>

        {/* Controls */}
        <div className="w-full lg:w-80 border-l border-white/10 p-4 space-y-6">
          {/* Partner selector */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-mono">Partner</label>
            <div className="relative">
              <select
                value={selectedIndex}
                onChange={(e) => handlePartnerChange(Number(e.target.value))}
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer hover:border-white/40 transition-colors focus:outline-none focus:border-white/60"
              >
                {allPartners.map((p, i) => (
                  <option key={`${p.tier}-${p.name}`} value={i}>
                    {p.name} — {TIER_LABEL[p.tier]}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Resolution selector */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-mono">
              Export Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RESOLUTIONS) as ResolutionKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedResolution(key)}
                  className={`px-4 py-2 rounded-lg border font-mono text-sm transition-all ${
                    selectedResolution === key
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-white/20 hover:border-white/40"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Export buttons */}
          <div className="space-y-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono py-3 px-4 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exporting..." : `Export PNG (${selectedResolution})`}
            </button>
            <button
              onClick={handleExportSvg}
              disabled={isExportingSvg}
              className="w-full flex items-center justify-center gap-1.5 bg-transparent text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-mono py-1.5 px-2 rounded transition-all text-xs"
            >
              <Download className="w-3 h-3" />
              {isExportingSvg ? "Exporting..." : "Export current partner as SVG"}
            </button>
          </div>

          {/* Partner info */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="text-sm text-gray-400 font-mono">Partner Info</div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>{" "}
                <span className="text-white">{partner.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Tier:</span>{" "}
                <span className="text-white">{TIER_LABEL[partner.tier]}</span>
              </div>
              <div>
                <span className="text-gray-500">URL:</span>{" "}
                <span className="text-white">{partner.url}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
