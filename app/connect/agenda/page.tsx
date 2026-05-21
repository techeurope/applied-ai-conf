import { AGENDA } from "@/data/agenda";
import { AgendaList } from "../components/AgendaList";

export default function AgendaPage() {
  return (
    <div className="space-y-4 pt-2">
      <header className="space-y-1">
        <h1 className="font-mono text-xl tracking-tight">Agenda</h1>
        <p className="text-sm text-zinc-400">
          May 28, 2026 · The Delta Campus, Berlin
        </p>
      </header>

      <AgendaList slots={AGENDA} />
    </div>
  );
}
