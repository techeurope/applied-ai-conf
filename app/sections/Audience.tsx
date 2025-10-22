import { PARTNERSHIP_OVERVIEW } from '@/data/partnerships';

export default function Audience() {
  return (
    <section id="audience" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl sm:text-5xl font-bold text-center">Audience Snapshot</h2>
        <p className="mt-4 max-w-3xl mx-auto text-center text-lg text-gray-200">
          A curated mix of builders, product owners, and partners shaping applied AI across Europe.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERSHIP_OVERVIEW.audience.map((segment) => (
            <div
              key={segment.label}
              className="rounded-3xl border border-gray-700 bg-black/80 p-8 text-center transition-colors hover:border-white"
            >
              <p className="text-base text-gray-200">{segment.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
