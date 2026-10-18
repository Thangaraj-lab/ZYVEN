"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMockLiveUpdates } from "@/lib/data/hooks";

function LiveBridge() {
  useMockLiveUpdates();
  return null;
}

export function Providers({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const [qc] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem transitions={false}>
        <QueryClientProvider client={qc}>
          <TooltipProvider delayDuration={300}>
            <LiveBridge />
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                },
              }}
            />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
