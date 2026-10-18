import { cn } from "@/lib/utils";

/** Flat 2D Z-ribbon mark, violet-to-blue gradient. Works at 24px and 120px. */
export function ZyvenMark({
  size = 28,
  className,
  idSuffix = "default",
}: {
  size?: number;
  className?: string;
  idSuffix?: string;
}) {
  const gid = `zyven-grad-${idSuffix}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Zyven"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={gid} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="0.55" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      {/* Ribbon Z: flat stroke with rounded caps */}
      <path
        d="M10 12h28L14 36h26"
        stroke={`url(#${gid})`}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* ribbon fold accent */}
      <path d="M31 27l7 9h-9l-3-6z" fill={`url(#${gid})`} opacity="0.35" />
    </svg>
  );
}
