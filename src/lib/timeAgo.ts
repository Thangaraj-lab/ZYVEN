/** Relative time helper — keys map to common.justNow/minutesAgo/hoursAgo/daysAgo. */
export type TimeAgoKey = "justNow" | "minutesAgo" | "hoursAgo" | "daysAgo";

export function timeAgo(iso: string, now: number = Date.now()): { key: TimeAgoKey; count: number } {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return { key: "justNow", count: 0 };
  if (min < 60) return { key: "minutesAgo", count: min };
  const h = Math.floor(min / 60);
  if (h < 24) return { key: "hoursAgo", count: h };
  return { key: "daysAgo", count: Math.floor(h / 24) };
}

export function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "ta" ? "ta-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function greetingKey(date = new Date()): "dashboard.greetingMorning" | "dashboard.greetingAfternoon" | "dashboard.greetingEvening" {
  const h = date.getHours();
  if (h < 12) return "dashboard.greetingMorning";
  if (h < 17) return "dashboard.greetingAfternoon";
  return "dashboard.greetingEvening";
}
