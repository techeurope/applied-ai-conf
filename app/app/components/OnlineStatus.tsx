"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { WifiOff } from "lucide-react";

const OnlineContext = createContext<boolean>(true);

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <OnlineContext.Provider value={online}>{children}</OnlineContext.Provider>
  );
}

export function useOnlineStatus(): boolean {
  return useContext(OnlineContext);
}

export function OfflineChip() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 ring-1 ring-amber-400/40 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="size-3" strokeWidth={2} />
      Offline
    </span>
  );
}
