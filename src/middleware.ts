import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE } from "@/lib/i18n";

const intl = createMiddleware({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "never",
});

export default function middleware(request: NextRequest) {
  const response = intl(request);
  // Forward the cookie locale to the server via a header so next-intl's
  // request config can read it without mutating the request itself.
  const locale = request.cookies.get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE;
  const headers = new Headers(request.headers);
  headers.set("x-zyven-locale", (LOCALES as readonly string[]).includes(locale) ? locale : DEFAULT_LOCALE);
  return NextResponse.next({ request: { headers }, cookies: response.cookies });
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
