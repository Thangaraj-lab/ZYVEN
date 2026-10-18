"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ease, dur } from "@/lib/motion";

/** Copy-to-clipboard button with icon morph (copy -> check) and revert after 1.8s. */
export function CopyButton({
  text,
  label,
  copiedLabel,
  className,
}: {
  text: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(copiedLabel);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-[12px] border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "ok" : "copy"}
          initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: dur.fast, ease: ease.out }}
          className="inline-flex"
        >
          {copied ? (
            <Check className="size-4 text-success" strokeWidth={3} />
          ) : (
            <Copy className="size-4" />
          )}
        </motion.span>
      </AnimatePresence>
      {copied ? copiedLabel : label}
    </button>
  );
}
