"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useStore } from "@/store/useStore";

const subscribe = (cb: () => void) => useStore.persist.onFinishHydration(cb);

/** True once the persisted cart has been read from localStorage (avoids hydration mismatches). */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => useStore.persist.hasHydrated(),
    () => false,
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);
  return <>{children}</>;
}
