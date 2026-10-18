"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { CalendarClock, ExternalLink, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandIcon } from "@/components/brand-icons";
import { formatDate } from "@/lib/timeAgo";
import { ease, layoutIds } from "@/lib/motion";
import { motion } from "motion/react";
import type { Brand, MissionUIState, MissionWithState } from "@/lib/data/types";

const stateCtaKey: Record<MissionUIState, string> = {
  AVAILABLE: "start",
  STARTED: "continueText",
  SUBMITTED: "reviewProgress",
  UNDER_REVIEW: "reviewProgress",
  APPROVED: "done",
  REJECTED: "resubmit",
  LOCKED: "lockedTooltip",
};

/**
 * Mission card used on /missions, dashboard and landing teasers.
 * `layoutId` props enable the shared-element open transition (B6-E).
 */
export function MissionCard({
  mission,
  t,
  tc,
  onClick,
  cta,
  compact,
}: {
  mission: MissionWithState;
  /** translations for missions namespace */
  t: (key: string, values?: Record<string, string | number>) => string;
  tc: (key: string) => string;
  onClick?: () => void;
  cta?: React.ReactNode;
  compact?: boolean;
}) {
  const locale = useLocale();
  const locked = mission.uiState === "LOCKED";
  const title = locale === "ta" ? mission.titleTa : mission.title;
  const description = locale === "ta" ? mission.descriptionTa : mission.description;

  return (
    <motion.article
      layoutId={layoutIds.missionCard(mission.id)}
      whileHover={locked ? undefined : { y: -4 }}
      transition={{ ...ease.spring }}
      onClick={locked ? undefined : onClick}
      role={locked ? undefined : "button"}
      tabIndex={locked ? -1 : 0}
      onKeyDown={(e) => {
        if (!locked && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-disabled={locked}
      className={cn(
        "group relative flex flex-col rounded-[20px] border bg-surface p-5 text-left shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        locked
          ? "cursor-default border-border opacity-70"
          : "cursor-pointer border-border hover:shadow-lg",
        compact && "p-4",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <motion.div layoutId={layoutIds.missionIcon(mission.id)}>
          <BrandIcon brand={mission.brand} />
        </motion.div>
        <motion.span layoutId={layoutIds.missionPoints(mission.id)}>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary tabular-nums ring-1 ring-inset ring-primary/25">
            +{mission.points} {tc("pointsUnit")}
          </span>
        </motion.span>
      </div>

      <motion.h3
        layoutId={layoutIds.missionTitle(mission.id)}
        className="text-base font-bold leading-snug tracking-[-0.01em] text-foreground"
      >
        {title}
      </motion.h3>
      {!compact && (
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Timer className="size-3.5" />
          {t("minutes", { count: mission.estimatedMinutes })}
        </span>
        <span className="inline-flex items-center gap-1 capitalize">
          {t(`difficulty${mission.difficulty[0].toUpperCase()}${mission.difficulty.slice(1)}`)}
        </span>
        {mission.deadline && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            {formatDate(mission.deadline, locale)}
          </span>
        )}
      </div>

      {locked && (
        <span className="pointer-events-none absolute right-4 top-4 text-[10px] font-bold uppercase tracking-wide text-muted">
          🔒 {tc("comingSoon")}
        </span>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        {cta ?? null}
        {!locked && (
          <span aria-hidden className="ml-auto text-primary opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
            →
          </span>
        )}
      </div>
      {/* keep CTA key referenced for state-aware buttons in parent screens */}
      <span className="sr-only">{t(stateCtaKey[mission.uiState])}</span>
    </motion.article>
  );
}
