export default function About() {
  return (
    <section id="about" className="relative w-full bg-black py-24 lg:py-32">
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
        {/* About Applied AI Conf */}
        <div className="mb-20">
          <h2 className="text-4xl font-mono font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-glow mb-8">
            About Applied AI Conf
          </h2>
          <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
            <p>
              Applied AI Conf is a one-day, highly curated conference for people
              who are actually putting AI into production: Europe&apos;s leading
              technical founders, engineering leaders, and the global infra and
              devtools teams powering them.
            </p>
            <p>
              Over one day, we&apos;ll go deep on how to design, build, and
              scale production-grade AI systems. You&apos;ll learn directly from
              teams shipping AI into real products every day.
            </p>
            <div className="pt-4">
              <p className="text-white font-medium mb-4">
                Expect a program packed with:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-white/60 font-mono">—</span>
                  Engineering-focused talks on architecture, tooling, and best
                  practices
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white/60 font-mono">—</span>
                  Hands-on workshops by next-gen infrastructure companies
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white/60 font-mono">—</span>
                  Technical panels on what&apos;s working (and what isn&apos;t)
                  in production
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white/60 font-mono">—</span>
                  Live demos from companies running AI in production today
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Who it's for */}
        <div className="mb-20">
          <h2 className="text-4xl font-mono font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-glow mb-8">
            Who it&apos;s for
          </h2>
          <ul className="space-y-3 text-lg text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              Technical founders and CTOs building AI products
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              Engineers shipping AI features into production
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              ML / applied AI practitioners focused on real systems
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              Product and engineering leaders scaling AI teams
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              Infra and devtools teams enabling production AI
            </li>
          </ul>
        </div>

        {/* What you'll walk away with */}
        <div>
          <h2 className="text-4xl font-mono font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-glow mb-8">
            What you&apos;ll walk away with
          </h2>
          <ul className="space-y-3 text-lg text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              Practical patterns for building and scaling production AI systems
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              Honest lessons about what worked and what didn&apos;t
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>
              New tools and approaches from infra and devtools teams
            </li>
            <li className="flex items-start gap-3">
              <span className="text-white/60 font-mono">—</span>A stronger
              network of builders across Europe
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

