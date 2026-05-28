"use client";

import { useSyncExternalStore } from "react";

// Returns `false` during SSR and the first client render (hydration),
// then `true` after. Use this to gate any conditional rendering that
// would otherwise differ between server and first client render — most
// commonly anything keyed on `useCachedQuery`, which hydrates from
// localStorage synchronously on the client (server has no localStorage,
// so it sees `undefined`).
//
// `useSyncExternalStore` is the React-blessed primitive for this case:
// React deliberately uses `getServerSnapshot` during hydration, so the
// first client render matches the server output, then transitions to
// `getSnapshot` post-hydration without triggering the hydration warning.
// `useState(false) + useEffect(setMounted(true))` exhibits a subtle
// re-render glitch under Next 16 / Turbopack that still leaks into the
// hydration diff.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHasHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
