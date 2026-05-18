import { AGENDA } from "@/data/agenda";

export default function AgendaPage() {
  return (
    <div className="space-y-4 pt-2">
      <header className="space-y-1">
        <h1 className="font-mono text-xl tracking-tight">Agenda</h1>
        <p className="text-sm text-zinc-400">May 28, 2026 · The Delta Campus, Berlin</p>
      </header>

      <ol className="space-y-3">
        {AGENDA.map((slot) => (
          <li key={slot.id} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {slot.startTime}–{slot.endTime}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                {slot.stage}
              </span>
            </div>
            <div className="font-mono text-sm text-foreground">{slot.title}</div>
            {slot.speakerName && (
              <div className="text-xs text-zinc-400 mt-1">{slot.speakerName}</div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
