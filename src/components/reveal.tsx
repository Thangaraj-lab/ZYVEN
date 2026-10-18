"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { variants } from "@/lib/motion";

/** Scroll-triggered reveal wrapper (fadeUp, once). Respects reduced motion via CSS + variants. */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div;
  return (
    <MotionTag
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        ...variants.fadeUp,
        visible: {
          opacity: 1,
          y: 0,
          transition: { ...variants.fadeUp.visible.transition, delay },
        },
      }}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}
