import Link from 'next/link';
import { SPONSORS } from '@/data/sponsors';

export default function Sponsors() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center">Sponsors</h2>
        <p className="text-center text-gray-400 mb-12">
          <Link href="#" className="hover:underline">Become a sponsor</Link>
        </p>
        
        <div className="space-y-12">
          {/* Diamond Partners */}
          {SPONSORS.diamond.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-500 mb-6 text-center">Diamond partner</h3>
              <div className="flex justify-center gap-6 flex-wrap">
                {SPONSORS.diamond.map((sponsor, index) => (
                  <div key={index} className="w-48 h-24 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center font-bold text-xl">
                    {sponsor}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Platinum Partners */}
          {SPONSORS.platinum.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-500 mb-6 text-center">Platinum partners</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {SPONSORS.platinum.map((sponsor, index) => (
                  <div key={index} className="w-full h-20 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center font-semibold">
                    {sponsor}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gold Partners */}
          {SPONSORS.gold.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-500 mb-6 text-center">Gold partners</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                {SPONSORS.gold.map((sponsor, index) => (
                  <div key={index} className="w-full h-16 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center text-sm font-medium">
                    {sponsor}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
