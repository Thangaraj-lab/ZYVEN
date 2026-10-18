import * as React from "react";

/** Avatar with graceful initials fallback when the remote image fails (offline demo envs). */
export function AvatarWithFallback({
  src,
  name,
  className,
  imgClassName,
  size = 40,
}: {
  src?: string | null;
  name: string;
  className?: string;
  imgClassName?: string;
  size?: number;
}) {
  const [failed, setFailed] = React.useState(false);
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!src || failed) {
    return (
      <span
        aria-hidden
        className={className ?? "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary"}
        style={{ width: size, height: size, fontSize: Math.max(10, size / 3) }}
      >
        {initials || "?"}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote avatar URLs, no static optimization needed
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={imgClassName ?? "shrink-0 rounded-full object-cover"}
      style={{ width: size, height: size }}
    />
  );
}
