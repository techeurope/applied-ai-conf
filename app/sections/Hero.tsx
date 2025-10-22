import { CONFERENCE_INFO } from '@/data/conference';
import { PARTNERSHIP_OVERVIEW } from '@/data/partnerships';
import { SplineScene } from '@/components';

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      {/* Background Spline Scene - Neural Network */}
      <div className="absolute inset-0 z-0 opacity-70">
        <SplineScene
          scene="https://prod.spline.design/KRNIQmlKyZ6SYYoF/scene.splinecode"
          className="w-full h-full scale-150"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.4em] text-gray-300">
          {CONFERENCE_INFO.title}
        </p>
        <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          {CONFERENCE_INFO.tagline}
        </h1>
        <p className="mb-6 text-xl text-gray-300 sm:text-2xl">
          {CONFERENCE_INFO.location}
        </p>
        <p className="mb-12 max-w-3xl text-lg text-gray-200 sm:text-xl">
          {PARTNERSHIP_OVERVIEW.about[0]}
        </p>

        <form className="mb-16 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-full border border-gray-600 bg-black/70 px-6 py-4 text-base text-white placeholder:text-gray-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <button
            type="submit"
            className="rounded-full bg-white px-8 py-4 text-base font-medium text-black transition-colors hover:bg-gray-200"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
