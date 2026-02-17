"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, ImagePlus, X } from "lucide-react";
import { BadgeCard } from "./components/BadgeCard";
import { BadgeCardWide } from "./components/BadgeCardWide";
import { getFontEmbedCSS } from "@/lib/font-embed";
import { LUMA_EVENT_ID } from "@/data/navigation";

type BadgeFormat = "square" | "wide";

const FORMAT_CONFIG = {
  square: { width: 1080, height: 1080, label: "Square (Instagram)" },
  wide: { width: 1200, height: 630, label: "Wide (Twitter/LinkedIn)" },
} as const;

export default function BadgePage() {
  const [name, setName] = useState("");
  const [format, setFormat] = useState<BadgeFormat>("square");
  const [isExporting, setIsExporting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [scale, setScale] = useState(0.4);

  const config = FORMAT_CONFIG[format];

  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;

    const updateScale = () => {
      const { width: containerWidth } = element.getBoundingClientRect();
      const padding = 32;
      const availableWidth = containerWidth - padding * 2;
      const newScale = availableWidth / config.width;
      setScale(Math.max(0.15, Math.min(newScale, 1)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    return () => observer.disconnect();
  }, [config.width]);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleRemoveImage = useCallback(() => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleExport = async () => {
    if (!cardRef.current || isExporting) return;

    setIsExporting(true);
    try {
      await document.fonts.ready;
      const fontEmbedCSS = await getFontEmbedCSS();

      const pixelRatio = 2;
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio,
        fontEmbedCSS,
        skipFonts: true,
      });

      const safeName = name
        ? name.toLowerCase().replace(/\s+/g, "_")
        : "badge";
      const link = document.createElement("a");
      link.download = `appliedaiconf_${safeName}_${config.width}x${config.height}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-kode-mono), monospace" }}
          >
            Get Your Badge
          </h1>
          <p className="text-neutral-400 mt-3 text-lg">
            Generate a personalized attendee badge and share it on social media.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 mb-8 max-w-2xl mx-auto">
          {/* Name input */}
          <div className="flex-1">
            <label
              htmlFor="badge-name"
              className="block text-sm text-neutral-400 mb-2"
              style={{ fontFamily: "var(--font-kode-mono), monospace" }}
            >
              First Name
            </label>
            <input
              id="badge-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="Enter your first name"
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-white/60 transition-colors"
              style={{ fontFamily: "var(--font-kode-mono), monospace" }}
            />
          </div>

          {/* Photo upload */}
          <div>
            <label
              className="block text-sm text-neutral-400 mb-2"
              style={{ fontFamily: "var(--font-kode-mono), monospace" }}
            >
              Photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="badge-photo"
            />
            {imageUrl ? (
              <div className="flex items-center gap-2">
                <div className="w-[46px] h-[46px] rounded-full overflow-hidden border border-white/20">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="p-3 rounded-lg border border-white/20 hover:border-white/40 text-neutral-400 hover:text-white transition-colors"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/20 hover:border-white/40 text-neutral-400 hover:text-white transition-colors whitespace-nowrap"
                style={{ fontFamily: "var(--font-kode-mono), monospace" }}
              >
                <ImagePlus className="w-4 h-4" />
                Add photo
              </button>
            )}
          </div>

          {/* Format toggle */}
          <div>
            <label
              className="block text-sm text-neutral-400 mb-2"
              style={{ fontFamily: "var(--font-kode-mono), monospace" }}
            >
              Format
            </label>
            <div className="flex gap-2">
              {(Object.keys(FORMAT_CONFIG) as BadgeFormat[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setFormat(key)}
                  className={`px-4 py-3 rounded-lg border text-sm transition-all whitespace-nowrap ${
                    format === key
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white border-white/20 hover:border-white/40"
                  }`}
                  style={{ fontFamily: "var(--font-kode-mono), monospace" }}
                >
                  {FORMAT_CONFIG[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div
          ref={previewRef}
          className="flex justify-center mb-8 overflow-hidden"
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              height: config.height * scale,
            }}
          >
            <div ref={cardRef}>
              {format === "square" ? (
                <BadgeCard name={name} imageUrl={imageUrl} />
              ) : (
                <BadgeCardWide name={name} imageUrl={imageUrl} />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-all"
            style={{ fontFamily: "var(--font-kode-mono), monospace" }}
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Download Badge"}
          </button>

          <button
            data-luma-action="checkout"
            data-luma-event-id={LUMA_EVENT_ID}
            className="w-full border border-white/20 hover:border-white/40 text-white py-3 px-6 rounded-lg transition-all text-center"
            style={{ fontFamily: "var(--font-kode-mono), monospace" }}
          >
            Get your ticket
          </button>
        </div>
      </div>
    </div>
  );
}
