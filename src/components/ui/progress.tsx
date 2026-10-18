"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ease, dur, useMotionOK } from "@/lib/motion";

interface ProgressBarProps {
  value: number; // 0..100
  className?: string;
  indicatorClassName?: string;
  glow?: boolean;
  ariaLabel?: string;
}

/** Animated progress bar with a soft glowing leading edge. */
export function ProgressBar({
  value,
  className,
  indicatorClassName,
  glow,
  ariaLabel,
}: ProgressBarProps) {
  const motionOk = useMotionOK();
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <ProgressPrimitive.Root
      value={clamped}
      aria-label={ariaLabel}
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-border/60",
        className,
      )}
    >
      <ProgressPrimitive.Indicator className="h-full w-full">
        <motion.div
          initial={motionOk ? { width: 0 } : false}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: motionOk ? dur.slow : 0, ease: ease.out }}
          className={cn("relative h-full rounded-full brand-gradient", indicatorClassName)}
        >
          {glow && clamped > 4 && (
            <span
              aria-hidden
              className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/50 blur-md"
            />
          )}
        </motion.div>
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
}
