import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Noto_Sans_Tamil, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Zyven Student Ambassador Portal", template: "%s | Zyven" },
  description:
    "Represent. Create. Influence. Grow. Join the founding cohort of Zyven Student Ambassadors — complete missions, earn points, climb the leaderboard.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#070A16" },
  ],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale?: string }> }>) {
  const { locale: raw } = await params;
  const locale = hasLocale(LOCALES, raw ?? DEFAULT_LOCALE) ? (raw ?? DEFAULT_LOCALE) : DEFAULT_LOCALE;
  if (!hasLocale(LOCALES, locale)) notFound();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${jakarta.variable} ${notoTamil.variable}`}
    >
      <body className="min-h-dvh bg-bg font-sans text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
