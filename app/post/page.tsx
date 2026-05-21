"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, ImagePlus, X } from "lucide-react";
import { BadgeCard } from "./components/BadgeCard";
import { getFontEmbedCSS } from "@/lib/font-embed";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1080;

export default function PostPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;

    const updateScale = () => {
      const { width: containerWidth } = element.getBoundingClientRect();
      const padding = 32;
      const availableWidth = containerWidth - padding * 2;
      const newScale = availableWidth / CARD_WIDTH;
      setScale(Math.max(0.15, Math.min(newScale, 1)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
      link.download = `appliedaiconf_${safeName}_${CARD_WIDTH}x${CARD_HEIGHT}.png`;
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
            Share you&apos;re attending
          </h1>
          <p className="text-neutral-400 mt-3 text-lg">
            Make a cover for your X, LinkedIn or Instagram post. Tell the world you&apos;ll be there.
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-5 mb-8 max-w-2xl mx-auto">
          {/* Row 1: Name + optional Role */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
            <div className="flex-1">
              <label
                htmlFor="badge-name"
                className="block text-sm text-neutral-400 mb-2"
                style={{ fontFamily: "var(--font-kode-mono), monospace" }}
              >
                Name
              </label>
              <input
                id="badge-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 40))}
                placeholder="Enter your name"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-white/60 transition-colors"
                style={{ fontFamily: "var(--font-kode-mono), monospace" }}
              />
            </div>
            <div className="sm:w-56">
              <label
                htmlFor="badge-role"
                className="block text-sm text-neutral-400 mb-2"
                style={{ fontFamily: "var(--font-kode-mono), monospace" }}
              >
                Role <span className="text-neutral-500 font-normal">(optional)</span>
              </label>
              <input
                id="badge-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value.slice(0, 40))}
                placeholder="e.g. Engineer, CTO"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-white/60 transition-colors"
                style={{ fontFamily: "var(--font-kode-mono), monospace" }}
              />
            </div>
            <div className="sm:w-56">
              <label
                htmlFor="badge-company"
                className="block text-sm text-neutral-400 mb-2"
                style={{ fontFamily: "var(--font-kode-mono), monospace" }}
              >
                Company <span className="text-neutral-500 font-normal">(optional)</span>
              </label>
              <input
                id="badge-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value.slice(0, 40))}
                placeholder="e.g. Acme"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-white/60 transition-colors"
                style={{ fontFamily: "var(--font-kode-mono), monospace" }}
              />
            </div>
          </div>

          {/* Row 2: Photo + Format, compact */}
          <div className="flex flex-wrap items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="badge-photo"
            />
            <div className="flex items-center gap-2">
              <span
                className="text-sm text-neutral-400 shrink-0"
                style={{ fontFamily: "var(--font-kode-mono), monospace" }}
              >
                Photo
              </span>
              {imageUrl ? (
                <>
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={handleRemoveImage}
                    className="p-2 rounded-md border border-white/20 hover:border-white/40 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/20 hover:border-white/40 text-neutral-400 hover:text-white transition-colors cursor-pointer text-sm"
                  style={{ fontFamily: "var(--font-kode-mono), monospace" }}
                >
                  <ImagePlus className="w-3.5 h-3.5 shrink-0" />
                  Add
                </button>
              )}
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
              height: CARD_HEIGHT * scale,
            }}
          >
            <div ref={cardRef}>
              <BadgeCard
                name={name}
                role={role || undefined}
                company={company || undefined}
                imageUrl={imageUrl}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-all cursor-pointer"
            style={{ fontFamily: "var(--font-kode-mono), monospace" }}
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Download cover"}
          </button>
        </div>
      </div>
    </div>
  );
}
