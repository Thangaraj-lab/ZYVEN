import Link from "next/link";
import { ZyvenMark } from "./zyven-mark";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 font-extrabold tracking-tight text-foreground",
        className,
      )}
      aria-label="Zyven home"
    >
      <ZyvenMark size={compact ? 24 : 28} />
      {!compact && <span className="text-lg">Zyven</span>}
    </Link>
  );
}
