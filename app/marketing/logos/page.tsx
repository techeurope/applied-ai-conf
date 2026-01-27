"use client";

import { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { LangdockLogo } from "@/components/ui/langdock-logo";
import { ChocoLogo } from "@/components/ui/choco-logo";
import { TactoLogo } from "@/components/ui/tacto-logo";
import { LegoraLogo } from "@/components/ui/legora-logo";
import { KnowunityLogo } from "@/components/ui/knowunity-logo";

const LOGOS = [
  { name: "langdock", Component: LangdockLogo },
  { name: "choco", Component: ChocoLogo },
  { name: "tacto", Component: TactoLogo },
  { name: "legora", Component: LegoraLogo },
  { name: "knowunity", Component: KnowunityLogo },
] as const;

// Resolution for export
const EXPORT_HEIGHT = 1024;
const EXPORT_SCALE = 8; // 8192px target height
const MAX_CANVAS_DIM = 16384; // Browser canvas limit

type LogoVariant = "dark" | "light";

function exportSvg(svg: SVGElement, variant: LogoVariant): string {
  const svgClone = svg.cloneNode(true) as SVGElement;
  
  // Set proper xmlns
  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  
  // Remove any className that might cause issues
  svgClone.removeAttribute("class");
  
  // Set color based on variant
  const fillColor = variant === "dark" ? "#ffffff" : "#000000";
  
  // Update all paths with currentColor
  const paths = svgClone.querySelectorAll("path");
  paths.forEach((path) => {
    const currentFill = path.getAttribute("fill");
    if (currentFill === "currentColor" || currentFill === "inherit" || !currentFill) {
      path.setAttribute("fill", fillColor);
    }
  });
  
  // Update g elements
  const gs = svgClone.querySelectorAll("g");
  gs.forEach((g) => {
    const currentFill = g.getAttribute("fill");
    if (currentFill === "currentColor") {
      g.setAttribute("fill", fillColor);
    }
  });
  
  return new XMLSerializer().serializeToString(svgClone);
}

function downloadSvg(svgString: string, filename: string) {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

async function renderLogoToBlob(
  svg: SVGElement,
  variant: LogoVariant
): Promise<Blob> {
  // Get viewBox dimensions
  const viewBox = svg.getAttribute("viewBox");
  let vbX = 0, vbY = 0, vbWidth = 112, vbHeight = 22;
  
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      [vbX, vbY, vbWidth, vbHeight] = parts;
    }
  }
  
  // Try to get bounding box for better accuracy
  try {
    const bbox = (svg as SVGGraphicsElement).getBBox();
    if (bbox.width > 0 && bbox.height > 0) {
      // Use bbox if it provides valid dimensions and is different from viewBox
      // This handles cases where transforms move content
      if (Math.abs(bbox.x - vbX) > 1 || Math.abs(bbox.y - vbY) > 1 ||
          Math.abs(bbox.width - vbWidth) > 1 || Math.abs(bbox.height - vbHeight) > 1) {
        // Content is transformed, adjust viewBox to fit actual content
        vbX = bbox.x;
        vbY = bbox.y;
        vbWidth = bbox.width;
        vbHeight = bbox.height;
      }
    }
  } catch {
    // getBBox can fail in some contexts, use viewBox values
  }
  
  const aspectRatio = vbWidth / vbHeight;

  // Calculate export dimensions, respecting browser canvas limits
  let exportHeight = EXPORT_HEIGHT * EXPORT_SCALE;
  let exportWidth = Math.round(exportHeight * aspectRatio);
  
  // If either dimension exceeds max, scale down proportionally
  if (exportWidth > MAX_CANVAS_DIM) {
    exportWidth = MAX_CANVAS_DIM;
    exportHeight = Math.round(exportWidth / aspectRatio);
  }
  if (exportHeight > MAX_CANVAS_DIM) {
    exportHeight = MAX_CANVAS_DIM;
    exportWidth = Math.round(exportHeight * aspectRatio);
  }

  // Clone and prepare SVG for export
  const svgClone = svg.cloneNode(true) as SVGElement;
  
  // Set proper dimensions and viewBox
  svgClone.setAttribute("width", String(exportWidth));
  svgClone.setAttribute("height", String(exportHeight));
  svgClone.setAttribute("viewBox", `${vbX} ${vbY} ${vbWidth} ${vbHeight}`);
  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  
  // Remove any className that might cause issues
  svgClone.removeAttribute("class");

  // Set color based on variant
  const fillColor = variant === "dark" ? "#ffffff" : "#000000";
  
  // Update all paths with currentColor
  const paths = svgClone.querySelectorAll("path");
  paths.forEach((path) => {
    const currentFill = path.getAttribute("fill");
    if (currentFill === "currentColor" || currentFill === "inherit" || !currentFill) {
      path.setAttribute("fill", fillColor);
    }
  });
  
  // Update rect elements in defs (like clipPath backgrounds)
  const rects = svgClone.querySelectorAll("rect");
  rects.forEach((rect) => {
    const currentFill = rect.getAttribute("fill");
    if (currentFill === "white" || currentFill === "black") {
      // Keep clipPath rects as-is, they define the clip area
    }
  });
  
  // Also update any g elements
  const gs = svgClone.querySelectorAll("g");
  gs.forEach((g) => {
    const currentFill = g.getAttribute("fill");
    if (currentFill === "currentColor") {
      g.setAttribute("fill", fillColor);
    }
  });

  // Make sure defs are properly included and clipPaths work correctly
  const defs = svgClone.querySelector("defs");
  if (defs) {
    // Ensure clipPath IDs are unique to avoid conflicts
    const clipPaths = defs.querySelectorAll("clipPath");
    clipPaths.forEach((cp, i) => {
      const oldId = cp.getAttribute("id");
      if (oldId) {
        const newId = `${oldId}-export-${i}`;
        cp.setAttribute("id", newId);
        // Update all elements that reference this clipPath
        // Check for clip-path attribute (standard SVG)
        svgClone.querySelectorAll(`[clip-path="url(#${oldId})"]`).forEach(el => {
          el.setAttribute("clip-path", `url(#${newId})`);
        });
        // Also scan all elements for clipPath attribute value containing the old ID
        svgClone.querySelectorAll("*").forEach(el => {
          const clipPathAttr = el.getAttribute("clip-path");
          if (clipPathAttr && clipPathAttr.includes(oldId)) {
            el.setAttribute("clip-path", `url(#${newId})`);
          }
        });
      }
    });
  }
  
  // Handle transforms: for SVGs with transforms that move content outside viewBox,
  // we need to ensure the content is visible
  // The getBBox() call above should have captured the actual rendered bounds

  // Convert SVG to data URL (base64 for better compatibility)
  const svgData = new XMLSerializer().serializeToString(svgClone);
  const base64 = btoa(unescape(encodeURIComponent(svgData)));
  const dataUrl = `data:image/svg+xml;base64,${base64}`;

  return new Promise((resolve, reject) => {
    // Create high-res canvas
    const canvas = document.createElement("canvas");
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Load and draw SVG
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Clear with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw scaled
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Fallback: try to get data URL and convert to blob
            try {
              const fallbackDataUrl = canvas.toDataURL("image/png", 1.0);
              fetch(fallbackDataUrl)
                .then(res => res.blob())
                .then(resolve)
                .catch(() => reject(new Error("Could not create blob")));
            } catch {
              reject(new Error("Could not create blob"));
            }
          }
        },
        "image/png",
        1.0
      );
    };
    
    img.onerror = (e) => {
      console.error("Image load error:", e);
      reject(new Error("Could not load SVG"));
    };
    
    img.src = dataUrl;
  });
}

export default function LogoExportPage() {
  const [isExportingAll, setIsExportingAll] = useState(false);

  const exportAll = useCallback(async () => {
    setIsExportingAll(true);
    try {
      const zip = new JSZip();

      // Get all SVGs from the page
      for (const logo of LOGOS) {
        const container = document.querySelector(`[data-logo="${logo.name}"]`);
        if (!container) continue;

        const darkSvg = container.querySelector(
          '[data-variant="dark"] svg'
        ) as SVGElement;
        const lightSvg = container.querySelector(
          '[data-variant="light"] svg'
        ) as SVGElement;

        if (darkSvg && lightSvg) {
          const darkBlob = await renderLogoToBlob(darkSvg, "dark");
          const lightBlob = await renderLogoToBlob(lightSvg, "light");

          zip.file(`${logo.name}_dark.png`, darkBlob);
          zip.file(`${logo.name}_light.png`, lightBlob);
          
          // Add SVG files
          const darkSvgString = exportSvg(darkSvg, "dark");
          const lightSvgString = exportSvg(lightSvg, "light");
          zip.file(`${logo.name}_dark.svg`, darkSvgString);
          zip.file(`${logo.name}_light.svg`, lightSvgString);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download ZIP
      const link = document.createElement("a");
      link.download = "all_logos.zip";
      link.href = URL.createObjectURL(zipBlob);
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setIsExportingAll(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#05070f] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-2xl tracking-tight">
              Logo Export Utility
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Export company logos as high-resolution PNGs (up to {MAX_CANVAS_DIM}px) or SVG files
            </p>
          </div>
          <button
            onClick={exportAll}
            disabled={isExportingAll}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 rounded-lg font-mono transition-all"
          >
            {isExportingAll ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Export All (ZIP)
          </button>
        </div>

        {/* SVG Logos */}
        <div className="grid gap-6">
          {LOGOS.map((logo) => (
            <div key={logo.name} data-logo={logo.name}>
              <div className="border border-white/10 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-lg capitalize">{logo.name}</h3>
                  <ExportButton name={logo.name} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Dark version */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-mono">
                        Dark (white logo)
                      </span>
                      <SvgDownloadButton name={logo.name} variant="dark" />
                    </div>
                    <div
                      data-variant="dark"
                      className="bg-[#05070f] p-8 rounded-lg flex items-center justify-center border border-white/10"
                    >
                      <logo.Component className="h-10 text-white" />
                    </div>
                  </div>

                  {/* Light version */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-mono">
                        Light (black logo)
                      </span>
                      <SvgDownloadButton name={logo.name} variant="light" />
                    </div>
                    <div
                      data-variant="light"
                      className="bg-white p-8 rounded-lg flex items-center justify-center"
                    >
                      <logo.Component className="h-10 text-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-3">
          <h3 className="font-mono text-lg">Instructions</h3>
          <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
            <li>
              Click &quot;Export All (ZIP)&quot; to download all logos in both
              dark and light versions (PNG + SVG)
            </li>
            <li>
              Or click &quot;Export Both&quot; on individual logos for a
              per-logo ZIP (includes PNG and SVG)
            </li>
            <li>
              Click &quot;SVG&quot; button next to each variant to download
              individual SVG files
            </li>
            <li>
              Extract and move PNG/SVG files to{" "}
              <code className="bg-black/50 px-2 py-0.5 rounded">
                public/logos/
              </code>
            </li>
            <li>
              Use <code className="bg-black/50 px-2 py-0.5 rounded">_dark</code>{" "}
              versions for dark backgrounds,{" "}
              <code className="bg-black/50 px-2 py-0.5 rounded">_light</code>{" "}
              for light
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// SVG download button component
function SvgDownloadButton({ name, variant }: { name: string; variant: LogoVariant }) {
  const handleDownload = useCallback(() => {
    const container = document.querySelector(`[data-logo="${name}"]`);
    if (!container) return;

    const svg = container.querySelector(
      `[data-variant="${variant}"] svg`
    ) as SVGElement;

    if (!svg) return;

    const svgString = exportSvg(svg, variant);
    downloadSvg(svgString, `${name}_${variant}.svg`);
  }, [name, variant]);

  return (
    <button
      onClick={handleDownload}
      className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 font-mono transition-colors"
      title={`Download ${variant} SVG`}
    >
      SVG
    </button>
  );
}

// Separate component for export button to use hooks
function ExportButton({ name }: { name: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const container = document.querySelector(`[data-logo="${name}"]`);
    if (!container) return;

    const darkSvg = container.querySelector(
      '[data-variant="dark"] svg'
    ) as SVGElement;
    const lightSvg = container.querySelector(
      '[data-variant="light"] svg'
    ) as SVGElement;

    if (!darkSvg || !lightSvg) return;

    setIsExporting(true);
    try {
      const zip = new JSZip();

      const darkBlob = await renderLogoToBlob(darkSvg, "dark");
      const lightBlob = await renderLogoToBlob(lightSvg, "light");

      zip.file(`${name}_dark.png`, darkBlob);
      zip.file(`${name}_light.png`, lightBlob);
      
      // Add SVG files
      const darkSvgString = exportSvg(darkSvg, "dark");
      const lightSvgString = exportSvg(lightSvg, "light");
      zip.file(`${name}_dark.svg`, darkSvgString);
      zip.file(`${name}_light.svg`, lightSvgString);

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const link = document.createElement("a");
      link.download = `${name}_logos.zip`;
      link.href = URL.createObjectURL(zipBlob);
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setIsExporting(false);
    }
  }, [name]);

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg text-sm font-mono transition-colors"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Export Both
    </button>
  );
}
