"use client";

interface SectionHeadingProps {
  title: string;
  description?: string;
  className?: string;
  sectionId?: string;
}

export function SectionHeading({ title, description, className = "", sectionId }: SectionHeadingProps) {
  const handleCopy = () => {
    if (!sectionId || typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    window.history.replaceState(null, "", `#${sectionId}`);
  };

  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-white tracking-tighter leading-[1.05]">
        {sectionId ? (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy link to ${title} section`}
            className="group inline-flex items-baseline gap-3 cursor-pointer"
          >
            <span>{title}</span>
            <span
              aria-hidden="true"
              className="font-mono text-xl sm:text-2xl md:text-3xl text-gray-400 opacity-0 group-hover:opacity-40 transition-opacity"
            >
              #
            </span>
          </button>
        ) : (
          title
        )}
      </h2>
      {description && (
        <p className="text-lg sm:text-xl text-gray-400 mt-8">
          {description}
        </p>
      )}
    </div>
  );
}
