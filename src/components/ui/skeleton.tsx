import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-shimmer rounded-xl bg-surface-2 [background-image:linear-gradient(90deg,transparent_25%,rgba(139,92,246,0.08)_50%,transparent_75%)] [background-size:200%_100%]",
        className,
      )}
    />
  );
}
