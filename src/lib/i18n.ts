import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export const LOCALES = ["en", "ta"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Resolve locale: explicit header (set by client toggle) > cookie > default. */
async function resolveLocale(): Promise<Locale> {
  try {
    const h = await headers();
    const fromHeader = h.get("x-zyven-locale");
    if (fromHeader && (LOCALES as readonly string[]).includes(fromHeader)) {
      return fromHeader as Locale;
    }
  } catch {
    /* not in a request context (tests) */
  }
  try {
    const c = await cookies();
    const fromCookie = c.get(LOCALE_COOKIE)?.value;
    if (fromCookie && (LOCALES as readonly string[]).includes(fromCookie)) {
      return fromCookie as Locale;
    }
  } catch {
    /* no cookie store (static generation edge) */
  }
  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default as Record<
      string,
      unknown
    >,
  };
});
