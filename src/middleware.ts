import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE } from "@/lib/i18n";

const intl = createMiddleware({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "never",
});

export default function middleware(request: NextRequest) {
  // Forward the cookie locale to the server via a header so next-intl's
  // request config can read it without mutating the request itself.
  const locale = request.cookies.get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE;
  const headers = new Headers(request.headers);
  headers.set(
    "x-zyven-locale",
    (LOCALES as readonly string[]).includes(locale) ? locale : DEFAULT_LOCALE,
  );
  const rewritten = new Request(new URL(request.url), {
    method: request.method,
    headers,
    body: request.body,
  });
  return intl(rewritten as NextRequest);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
