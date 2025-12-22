'use client';

export default function PartnerTiersGrid() {
  return (
    <div className="space-y-12">
      {/* Platinum Partners - 2 slots */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-lg font-mono font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-300">
            Platinum
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
          <span className="text-sm font-mono text-gray-500">2 spots</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border-2 border-gray-400/50 bg-zinc-950 flex items-center justify-center"
            >
              <span className="text-gray-600 font-mono text-sm">Your logo here</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gold Partners - 8 slots */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-lg font-mono font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
            Gold
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
          <span className="text-sm font-mono text-gray-500">8 spots</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl border-2 border-amber-500/40 bg-zinc-950 flex items-center justify-center"
            >
              <span className="text-gray-700 font-mono text-xs">Logo</span>
            </div>
          ))}
        </div>
      </div>

      {/* Community Partners - unlimited */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-lg font-mono font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
            Community
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent" />
          <span className="text-sm font-mono text-gray-500">unlimited</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg border border-cyan-500/20 bg-zinc-950 flex items-center justify-center"
            >
              <span className="text-gray-600 font-mono text-[10px]">Logo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}









