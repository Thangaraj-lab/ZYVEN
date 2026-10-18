"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ease, dur } from "@/lib/motion";
import { useMarkAllRead, useMarkNotificationRead, useNotifications } from "@/lib/data/hooks";
import { TimeAgo } from "@/components/time-ago";


/** Bell with unread dot + wiggle on new notifications; dropdown quick view (last 5). */
export function NotificationBell({ className }: { className?: string }) {
  const t = useTranslations("notifications");
    const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();
  const [open, setOpen] = React.useState(false);
  const prevUnread = React.useRef<number | null>(null);
  const [wiggle, setWiggle] = React.useState(false);

  const unread = (notifications ?? []).filter((n) => !n.readAt);
  const count = unread.length;

  React.useEffect(() => {
    if (prevUnread.current !== null && count > prevUnread.current) {
      setWiggle(true);
      const id = setTimeout(() => setWiggle(false), 900);
      return () => clearTimeout(id);
    }
    prevUnread.current = count;
  }, [count]);

  const items = unread.slice(0, 5);

  return (
    <div className={cn("relative", className)}>
      <motion.button
        type="button"
        aria-label={t("title")}
        animate={wiggle ? { rotate: [0, -12, 12, -8, 8, 0] } : { rotate: 0 }}
        transition={{ duration: dur.base }}
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-11 items-center justify-center rounded-full text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="size-5" />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            <span className="absolute inset-0 animate-ping rounded-full bg-danger/40" aria-hidden />
            {count}
          </span>
        )}
      </motion.button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: dur.fast, ease: ease.out }}
            className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface p-2 shadow-lg"
            role="dialog"
            aria-label={t("quickView")}
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-bold">{t("quickView")}</span>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {markAll.isPending ? <Loader2 className="size-3 animate-spin" /> : <CheckCheck className="size-3.5" />}
                  {t("markAll")}
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted">{t("empty")}</p>
            ) : (
              <ul className="max-h-80 space-y-1 overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href ?? "/notifications"}
                      onClick={() => markRead.mutate(n.id)}
                      className="block rounded-xl px-3 py-2 hover:bg-surface-2"
                    >
                      <p className="text-sm font-semibold leading-snug">{n.title}</p>
                      <p className="line-clamp-2 text-xs text-muted">{n.body}</p>
                      <p className="mt-1 text-[11px] text-muted"><TimeAgo iso={n.createdAt} /></p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl px-3 py-2 text-center text-sm font-semibold text-primary hover:bg-surface-2"
            >
              {t("viewAll")}
            </Link>
          </motion.div>
        </>
      )}
    </div>
  );
}
