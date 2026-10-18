"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { dur, ease } from "@/lib/motion";
import type { Step } from "@/lib/data/types";

interface StepperProps {
  steps: Step[];
  /** index of the furthest step the user has confirmed (0-based). -1 = none done. */
  completedThrough: number;
  onConfirmStep: (index: number) => void;
  /** content rendered inside the active (open) step */
  renderActive: (index: number) => React.ReactNode;
}

/**
 * Guided mission stepper: steps unlock sequentially, completed steps collapse
 * with an animated check + gradient connector fill (B6-E3).
 */
export function Stepper({ steps, completedThrough, onConfirmStep, renderActive }: StepperProps) {
  const locale = useLocale();
  const t = useTranslations("missionDetail");
  const activeIndex = Math.min(completedThrough + 1, steps.length - 1);

  return (
    <ol className="space-y-2">
      {steps.map((step, i) => {
        const done = i <= completedThrough;
        const active = i === activeIndex && !done;
        const locked = i > activeIndex;
        const title = locale === "ta" ? step.titleTa : step.title;
        const body = locale === "ta" ? step.bodyTa ?? step.body : step.body;

        return (
          <li
            key={step.id}
            className={cn(
              "relative overflow-hidden rounded-2xl border transition-colors",
              active
                ? "border-primary/40 bg-surface shadow-md"
                : done
                  ? "border-success/30 bg-success/[0.04]"
                  : "border-border bg-surface/60",
            )}
          >
            {/* gradient connector fill for completed */}
            <AnimatePresence initial={false}>
              {done && (
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ originX: 0 }}
                  transition={{ duration: dur.base, ease: ease.out }}
                  className="absolute left-0 top-0 h-1 w-full brand-gradient"
                />
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 p-4">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  done
                    ? "bg-success text-white"
                    : active
                      ? "brand-gradient text-white"
                      : "bg-surface-2 text-muted",
                )}
              >
                {done ? (
                  <motion.span initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={ease.spring}>
                    <Check className="size-4" strokeWidth={3} />
                  </motion.span>
                ) : locked ? (
                  <Lock className="size-3.5" />
                ) : active ? (
                  <LockOpen className="size-4" />
                ) : (
                  i + 1
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-bold", locked && "text-muted")}>{title}</p>
              </div>
              {active && (
                <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
              )}
            </div>

            <AnimatePresence initial={false}>
              {active && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: dur.base, ease: ease.inOut }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border/60 px-4 pb-4 pt-3">
                    {body && <p className="mb-3 text-sm text-muted">{body}</p>}
                    {renderActive(i)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ol>
  );
}
