import Link from "next/link";
import { AGENDA } from "@/data/agenda";
import { AgendaList } from "../../components/AgendaList";

export default function MyAgendaPage() {
  return (
    <div className="space-y-4 pt-2">
      <header className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-mono text-xl tracking-tight">My agenda</h1>
          <p className="text-sm text-zinc-400">
            Talks you marked. Heart any session on the full agenda to add it.
          </p>
        </div>
        <Link
          href="/connect/agenda"
          className="font-mono text-xs underline text-white/70 hover:text-white shrink-0"
        >
          Full agenda →
        </Link>
      </header>

      <AgendaList slots={AGENDA} onlyFavorites />
    </div>
  );
}
