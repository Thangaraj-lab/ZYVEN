"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  Clock,
  Eye,
  Lock,
  Play,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MissionUIState } from "@/lib/data/types";

const config: Record<
  MissionUIState,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  AVAILABLE: { icon: Play, className: "bg-info/10 text-info ring-info/25" },
  STARTED: { icon: Clock, className: "bg-warning/10 text-warning ring-warning/25" },
  SUBMITTED: { icon: Send, className: "bg-primary/10 text-primary ring-primary/25" },
  UNDER_REVIEW: { icon: Eye, className: "bg-info/10 text-info ring-info/25" },
  APPROVED: { icon: Check, className: "bg-success/10 text-success ring-success/25" },
  REJECTED: { icon: X, className: "bg-danger/10 text-danger ring-danger/25" },
  LOCKED: { icon: Lock, className: "bg-surface-2 text-muted ring-border" },
};

/** Status badge for all 7 mission UI states. Labels come from next-intl. */
export function StatusBadge({
  state,
  className,
}: {
  state: MissionUIState;
  className?: string;
}) {
  const t = useTranslations("states");
  const c = config[state];
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset",
        c.className,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {t(state)}
    </span>
  );
}

/** Small pill showing points, e.g. "+50 pts". */
export function PointsPill({
  points,
  className,
}: {
  points: number;
  className?: string;
}) {
  const t = useTranslations("common");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary tabular-nums ring-1 ring-inset ring-primary/25",
        className,
      )}
    >
      +{points} {t("pointsUnit")}
    </span>
  );
}

/** Tier badge with tier colors. */
export function TierBadge({
  tier,
  label,
  className,
}: {
  tier: "bronze" | "silver" | "gold" | "champion" | null;
  label?: string;
  className?: string;
}) {
  if (!tier) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-muted ring-1 ring-inset ring-border",
          className,
        )}
      >
        <RotateCcw className="size-3.5" />
        {label ?? "—"}
      </span>
    );
  }
  const styles: Record<string, string> = {
    bronze: "bg-tier-bronze/15 text-tier-bronze ring-tier-bronze/30",
    silver: "bg-tier-silver/15 text-tier-silver ring-tier-silver/30",
    gold: "bg-tier-gold/15 text-tier-gold ring-tier-gold/30",
    champion: "brand-gradient text-white ring-transparent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset",
        styles[tier],
        className,
      )}
    >
      {label ?? tier}
    </span>
  );
}
