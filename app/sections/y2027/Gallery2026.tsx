import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { GALLERY_2026, PHOTO_CREDIT, photoDetailUrl } from "./config";

export default function Gallery2026() {
  return (
    <section id="gallery" className="relative -mt-2 pb-16 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Masonry — flows straight out of the hero, no section break */}
        <div className="columns-2 gap-3 sm:gap-4 lg:columns-3 [column-fill:_balance]">
          {GALLERY_2026.map((photo) => (
            <a
              key={photo.src}
              href={photoDetailUrl(photo.key)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:mb-4"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </a>
          ))}

          {/* View-the-full-gallery card, living in the grid */}
          <a
            href={PHOTO_CREDIT.fullGallery}
            target="_blank"
            rel="noopener noreferrer"
            className="group mb-3 flex break-inside-avoid flex-col items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.03] px-6 py-7 text-center transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.07] sm:mb-4"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition-colors group-hover:border-white/50">
              <ArrowUpRight className="h-4 w-4 text-white/70 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
            </span>
            <span className="font-mono text-sm font-medium text-white/90">
              View the full gallery
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
              All photos from 2026
            </span>
          </a>
        </div>

        {/* Credit + full gallery (text) */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center font-mono text-xs text-white/40 sm:flex-row sm:justify-center sm:gap-4">
          <span>
            Photos by{" "}
            <a
              href={PHOTO_CREDIT.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white hover:decoration-white/50"
            >
              {PHOTO_CREDIT.name}
            </a>
          </span>
          <span className="hidden text-white/20 sm:inline">·</span>
          <a
            href={PHOTO_CREDIT.fullGallery}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            View the full gallery
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
