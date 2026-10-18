# Supabase repository (future)

This folder will contain `supabaseRepository.ts` implementing the exact same
`Repository` interface from `src/lib/data/repository.ts`.

Swap plan (no UI changes required):

1. Implement every method against Supabase (Postgres + Storage + Edge Functions).
2. `approveSubmission()` becomes a `SECURITY DEFINER` Postgres function — keep the
   same name and return shape. Atomicity + idempotency live in the DB then.
3. Leaderboards become SQL views (`leaderboard_individual`, `leaderboard_college`).
4. Screenshots move from data URLs to Supabase Storage with signed URLs.
5. Replace mock Google login with real OAuth; replace Turnstile placeholder.
6. Flip `NEXT_PUBLIC_USE_MOCK=false` in `.env.local`.

Until then, `getRepository()` throws if the flag is false.
