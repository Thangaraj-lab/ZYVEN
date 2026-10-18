# Zyven Student Ambassador Portal (Frontend, mock-data phase)

## Product
Premium student ambassador platform. Loop: Discover -> Act -> Submit -> Verify -> Earn -> Rank -> Reward -> Return.
Two roles only: AMBASSADOR and ADMIN. Two live missions at launch:
 1. LinkedIn Follow + Post (50 pts, proof: post URL + optional screenshot)
 2. Join Zyven WhatsApp Community (30 pts, proof: screenshot required)
Everything else is "Coming soon" (locked, clearly labeled).

## Stack (do not add or swap libraries without asking)
Next.js (App Router) + TypeScript strict + Tailwind CSS + shadcn-style components (hand-rolled on Radix primitives)
+ Motion (`motion/react`) + GSAP (landing hero ONLY) + next-themes + next-intl (cookie locale, no URL prefix; en + ta)
+ React Hook Form + Zod + TanStack Query + TanStack Table + Sonner + Lucide + simple-icons
+ canvas-confetti + browser-image-compression + normalize-url.
Fonts: Plus Jakarta Sans (en), Noto Sans Tamil (ta) via next/font.

## Hard rules
1. ALL data goes through `src/lib/data/repository.ts` interface. Components never import mock files directly.
2. Points are NEVER stored. Points = sum of `PointTransaction[]`. Rank and tier are derived.
3. Only the repository's `approveSubmission()` may create a PointTransaction (simulates a server function). No UI code writes points.
4. Zero hardcoded user-facing strings. Everything via next-intl (`en.json` + `ta.json`).
5. Zero hardcoded colors. CSS variables / Tailwind tokens only. Every screen must work in light AND dark.
6. Flat 2D icons only (Lucide for UI, simple-icons for brand logos). No 3D, no WebGL, no glossy cubes.
7. Every mission state has a designed UI: AVAILABLE, STARTED, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED. Plus LOCKED (coming soon).
8. No fake stats (no "10K+ ambassadors"). Use founding-cohort counter. Demo data must be labeled "Demo data".
9. All animation uses presets from `src/lib/motion.ts`. Respect `prefers-reduced-motion` everywhere.
10. Mobile-first. Test at 375px, 768px, 1280px, 1536px. Bottom nav on mobile, top nav on desktop. NO sidebar for ambassadors.
11. TypeScript strict. No `any`. No unused code. Run `npm run lint && npm run typecheck` before every commit.
12. Accessibility: visible focus rings, aria labels, keyboard operable dialogs, contrast AA, tap targets >= 44px.
13. Do not ask me clarifying questions. Make the best decision, state it in one line, continue. Commit at the end of each phase with a clear message.
14. Never put secrets in the repo. `.env.local` is gitignored. `.env.example` is committed.
