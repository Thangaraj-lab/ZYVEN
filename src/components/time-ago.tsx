"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { timeAgo } from "@/lib/timeAgo";

/** Renders a relative timestamp via next-intl message keys (no hardcoded strings). */
export function TimeAgo({ iso, className }: { iso: string; className?: string }) {
  const tc = useTranslations("common");
  void useLocale();
  const r = timeAgo(iso);
  return (
    <span className={className}>
      {r.key === "justNow" ? tc("justNow") : tc(r.key, { count: r.count })}
    </span>
  );
}
