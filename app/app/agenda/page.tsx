import { AgendaList } from "../components/AgendaList";

export default function AgendaPage() {
  return (
    <div className="space-y-3 pt-1">
      <p className="text-xs text-zinc-400">
        May 28, 2026 · The Delta Campus, Berlin · all times CEST (UTC+2)
      </p>

      <AgendaList />
    </div>
  );
}
