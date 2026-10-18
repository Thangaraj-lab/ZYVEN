import { useCallback, useEffect, useRef, useState } from "react";

type Interest = "online" | "offline";

/** Live browser connectivity. Defaults to `true` (assume online until proven otherwise). */
export function useNetwork(): { online: boolean } {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return { online };
}

/** localStorage-backed state that syncs across tabs (same key = same channel). */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === keyRef.current && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue) as T);
        } catch {
          /* ignore malformed */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next;
        try {
          window.localStorage.setItem(keyRef.current, JSON.stringify(resolved));
        } catch {
          /* private mode etc. */
        }
        return resolved;
      });
    },
    [],
  );

  return [value, set] as const;
}

export type { Interest };
