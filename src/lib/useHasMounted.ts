import { useEffect, useState } from "react";

/** Mount-gated flag so SSR HTML and the first client render match (no hydration mismatch). */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
