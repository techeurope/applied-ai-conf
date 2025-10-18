import { PARTNERSHIP_OVERVIEW } from '@/data/partnerships';

export default function Overview() {
  return (
    <section id="overview" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center sm:text-left">
            Applied AI in Europe — About
          </h2>
          <div className="space-y-5 text-lg text-gray-200">
            {PARTNERSHIP_OVERVIEW.about.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-gray-700 bg-black/80 p-8 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Scale</p>
            <p className="mt-4 text-3xl font-semibold text-white">
              {PARTNERSHIP_OVERVIEW.participants}
            </p>
          </div>
          <div className="rounded-3xl border border-gray-700 bg-black/80 p-8 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Focus areas</p>
            <ul className="mt-4 space-y-3 text-base text-gray-200">
              {PARTNERSHIP_OVERVIEW.focusAreas.map((area) => (
                <li key={area} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
