"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ease, dur } from "@/lib/motion";
import { useHasMounted } from "@/lib/useHasMounted";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: dur.fast, ease: ease.out }}
        >
          {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function LocaleToggle({ className }: { className?: string }) {
  const [locale, setLocale] = React.useState<Locale>("en");

  React.useEffect(() => {
    const m = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE}=([^;]+)`));
    if (m?.[2] === "ta") setLocale("ta");
  }, []);

  function switchTo(next: Locale) {
    if (next === locale) return;
    setLocale(next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    window.location.reload();
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "flex min-h-11 items-center gap-0.5 rounded-full border border-border bg-surface-2 p-1 text-xs font-bold",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          locale === "en" ? "bg-surface text-foreground shadow-sm" : "text-muted",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchTo("ta")}
        aria-pressed={locale === "ta"}
        className={cn(
          "rounded-full px-2.5 py-1 font-tamil transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          locale === "ta" ? "bg-surface text-foreground shadow-sm" : "text-muted",
        )}
      >
        தமிழ்
      </button>
    </div>
  );
}
