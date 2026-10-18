"use client";

import * as React from "react";
import { animate, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ease, dur } from "@/lib/motion";

/** Count-tween number animation (0.8s ease.out) for points / rank changes. */
export function AnimatedNumber({
  value,
  className,
  prefix = "",
  suffix = "",
}: {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = React.useState(value);
  const prev = React.useRef(value);

  React.useEffect(() => {
    if (reduced) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration: dur.slow + 0.2,
      ease: ease.out,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduced]);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
