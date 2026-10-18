"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { ease, dur, variants } from "@/lib/motion";

/** Friendly empty state with a flat SVG illustration slot + optional CTA. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={variants.fadeUp}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-surface/50 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-7" />
      </span>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

/** Section heading with eyebrow + title used across landing/app screens. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6",
        align === "center" ? "mx-auto max-w-2xl text-center" : "",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-sm text-muted sm:text-base">{subtitle}</p>}
    </div>
  );
}

/** Simple vertical timeline for submission history. */
export interface TimelineItemData {
  id: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  meta?: React.ReactNode;
  tone?: "default" | "success" | "danger" | "warning" | "primary";
}

const toneDot: Record<NonNullable<TimelineItemData["tone"]>, string> = {
  default: "bg-border",
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
  primary: "bg-primary",
};

export function Timeline({ items }: { items: TimelineItemData[] }) {
  return (
    <ol className="relative space-y-6 pl-6">
      <span aria-hidden className="absolute bottom-2 left-[9px] top-2 w-px bg-border" />
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.base, delay: i * 0.05, ease: ease.out }}
            className="relative"
          >
            <span
              aria-hidden
              className={cn(
                "absolute -left-6 top-1.5 size-[19px] rounded-full border-4 border-bg",
                toneDot[item.tone ?? "default"],
              )}
            />
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground">{item.title}</p>
                {item.meta && <span className="text-xs text-muted">{item.meta}</span>}
              </div>
              {item.body && <div className="mt-1.5 text-sm text-muted">{item.body}</div>}
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}
