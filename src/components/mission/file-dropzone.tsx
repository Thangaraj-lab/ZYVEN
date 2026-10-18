"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ImageUp, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { dur, ease } from "@/lib/motion";
import { bytesLabel, compressImage, HARD_MAX_BYTES } from "@/lib/proof";

export interface DroppedImage {
  dataUrl: string;
  name: string;
  originalSize: number;
  finalSize: number;
}

/** Drag & drop screenshot upload with client-side compression + preview (B6-E7). */
export function FileDropzone({
  value,
  onChange,
}: {
  value: DroppedImage | null;
  onChange: (v: DroppedImage | null) => void;
}) {
  const t = useTranslations("missionDetail");
  const [dragOver, setDragOver] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError(t("notAnImage"));
      return;
    }
    if (file.size > HARD_MAX_BYTES) {
      setError(`${t("fileTooLarge")} (${bytesLabel(file.size)})`);
      return;
    }
    setBusy(true);
    try {
      const res = await compressImage(file);
      onChange({
        dataUrl: res.dataUrl,
        name: file.name,
        originalSize: res.originalSize,
        finalSize: res.finalSize,
      });
    } catch (e) {
      setError(e instanceof Error && e.message === "too-large" ? t("fileTooLarge") : t("compressing"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: dur.fast, ease: ease.out }}
            className="relative overflow-hidden rounded-2xl border border-border bg-surface-2 p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
            <img src={value.dataUrl} alt={value.name} className="max-h-56 w-full rounded-xl object-contain" />
            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted">
              <span className="truncate">
                {value.name} · {bytesLabel(value.originalSize)} → {bytesLabel(value.finalSize)}
              </span>
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label={t("remove")}
                className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 font-semibold text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-3.5" /> {t("remove")}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="drop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: dragOver ? 1.02 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur.fast, ease: ease.out }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            aria-label={t("uploadScreenshot")}
            className={cn(
              "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border bg-surface/60 hover:border-primary/50",
            )}
          >
            {busy ? (
              <>
                <Loader2 className="size-6 animate-spin text-primary" />
                <p className="text-sm font-semibold text-muted">{t("compressing")}…</p>
              </>
            ) : (
              <>
                <ImageUp className="size-6 text-primary" />
                <p className="text-sm font-bold text-foreground">{t("uploadScreenshot")}</p>
                <p className="text-xs text-muted">{t("screenshotHint")}</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-2 text-xs font-semibold text-danger"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
