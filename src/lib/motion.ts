/**
 * Central motion presets for Zyven Ambassador Portal.
 * All animation in the app must consume these tokens (CLAUDE.md rule 9).
 * Reduced motion: gate heavy effects with `useMotionOK`, and CSS-level
 * fallbacks live in globals.css.
 */
import { useReducedMotion } from "motion/react";

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: { type: "spring", stiffness: 380, damping: 30 } as const,
};

export const dur = {
  instant: 0.12,
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
  cinematic: 0.9,
};

export const stagger = {
  tight: 0.04,
  base: 0.07,
  loose: 0.12,
};

export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: dur.base, ease: ease.out } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: dur.base, ease: ease.out } },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { duration: dur.base, ease: ease.out } },
  },
  listContainer: {
    hidden: {},
    visible: { transition: { staggerChildren: stagger.base } },
  },
  listItem: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
  },
  popIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { ...ease.spring } },
  },
};

/** True when animations are OK to run (user has not requested reduced motion). */
export const useMotionOK = () => !useReducedMotion();

/** Shared layoutId namespaces so nav pills / card->detail transitions never collide. */
export const layoutIds = {
  navPill: "nav-active-pill",
  bottomTabPill: "bottom-tab-pill",
  missionCard: (id: string) => `mission-card-${id}`,
  missionIcon: (id: string) => `mission-icon-${id}`,
  missionTitle: (id: string) => `mission-title-${id}`,
  missionPoints: (id: string) => `mission-points-${id}`,
};
