export default function Format() {
  return (
    <section id="format" className="relative w-full bg-black py-24 lg:py-32">
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
        <h2 className="text-4xl font-mono font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-glow mb-8">
          Format
        </h2>
        <ul className="space-y-3 text-lg text-gray-300 mb-8">
          <li className="flex items-start gap-3">
            <span className="text-white/60 font-mono">—</span>
            One day in Berlin at The Delta Campus
          </li>
          <li className="flex items-start gap-3">
            <span className="text-white/60 font-mono">—</span>
            Two tracks: Main track and Side track (hands-on, technical sessions)
          </li>
          <li className="flex items-start gap-3">
            <span className="text-white/60 font-mono">—</span>
            Workshops, panels, and live demos focused on production AI
          </li>
          <li className="flex items-start gap-3">
            <span className="text-white/60 font-mono">—</span>
            Expo area with sponsors and community partners
          </li>
        </ul>
        <p className="text-base text-gray-500 italic">
          Full agenda coming soon. Speaker lineup updates will be posted
          regularly.
        </p>
      </div>
    </section>
  );
}

