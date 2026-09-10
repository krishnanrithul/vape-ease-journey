# VapeWise — Things To Do

Prioritised backlog. The app is deliberately small; the goal is to finish it, not grow it.
Status legend: [ ] todo · [~] partial · [x] done

## 1. Must-have before calling it "v1"

- [x] **Settings page** — there is none. Needs: edit daily goal, theme toggle (move it here from the header), export data (JSON), clear all data, re-run onboarding. `resetOnboarding()` already exists in `useOnboarding.ts` but is never wired up.
- [x] **Log history with edit/delete** — a simple reverse-chronological list of entries (time, count) with swipe-to-delete. Right now the only recovery path is the 5-second Undo toast.
- [x] **Day rollover on app open** — streak and daily/weekly goals are only recalculated when a puff is logged. Opening the app after a missed day still shows the old streak. Add a mount-time check against `streakData.lastActiveDate` and reset goal `current` for a new period.
- [x] **Set a baseline during onboarding** — ask "roughly how many puffs a day now?" and derive the first daily goal (e.g. 90% of baseline). Fixes the "10% reduction" and "Reduction Hero" milestone math, which currently compare against a 7-day average padded with zero days.
- [x] **PWA install** — `manifest.json` + icons + a minimal service worker so it can be added to a phone home screen and work offline. Cheaper than an App Store build and covers most users. (Capacitor iOS/Android later, config is already cleaned up.)

## 2. Should-have

- [ ] **Daily reminder notification** — one optional local notification (e.g. 9pm: "Log today?"). Web Notifications API for PWA; Capacitor LocalNotifications for native.
- [ ] **Unobtainable badges** — `reduction-champion`, `insight-seeker`, `goal-crusher` have no progress path. Either implement (insight-seeker needs a view counter; goal-crusher needs more goal-type achievements) or remove them.
- [ ] **Streak multipliers actually apply** — `calculateTotalMultiplier()` exists in `useAdvancedGamification` but XP is awarded in `useAdvancedGoals` at 1×. Wire them together or drop the multiplier UI copy.
- [ ] **Lock BottomNav/Header during onboarding** — they render outside `<Routes>` so a first-time user can tap into Goals/Insights before finishing onboarding.
- [~] **Loading skeletons** — hooks now expose `hydrated` and no longer write before load; skeleton UI still todo. — hooks return `[]` for one render before localStorage hydrates; pages flash their empty state. A tiny `isHydrated` flag per hook + skeleton fixes it.

## 3. Only if you want multi-device / backup

- [ ] **Account + sync (Supabase)** — a login screen on its own adds friction and nothing else while data lives in localStorage. Do it only as "sign in to back up & sync", keep guest mode as the default, and migrate local data on first sign-in. Same stack as strum-smart, so auth/RLS patterns can be copied.

## 4. Housekeeping

- [ ] Delete dead code: `src/pages/Index.tsx`, `src/App.css`, `src/hooks/use-toast.ts` + shadcn `<Toaster />` (app uses sonner), `next-themes` import in `ui/sonner.tsx` (use the app's `useTheme`), unused `trigger`/`mood` fields on `PuffEntry`.
- [ ] Fix the 3 pre-existing `any` types in `CreateGoalDialog.tsx` Select handlers.
- [ ] `NotFound.tsx` — off-brand styling, uses `<a href="/">` (full reload) instead of `<Link>`.
- [ ] Code-split routes (`React.lazy`) — main chunk is ~975 kB; Recharts alone is a big share.
- [ ] Add a few tests around `usePuffData` streak/rollover logic before touching it again.

## Done in this pass (for reference)

- [x] v1 must-haves: Settings (/settings, gear in header), History (/history) with edit/delete + undo, baseline step in onboarding → first goal = 90% of baseline, streak algorithm rewritten (old one capped at 2) + recompute on foreground, PWA (manifest, icons, autoUpdate SW, font caching)

- [x] Goals infinite render loop, unguarded `JSON.parse`, ErrorBoundary
- [x] Limit-vs-target goal direction; custom goals get progress; CravingDelay completion screen
- [x] Design tokens: amber accent, 3 surface tiers, Sora / JetBrains Mono / Inter
- [x] Ring gauge on Home; log drawer; undo toast; +/- cap
- [x] Route transitions (reduced-motion aware); focus-mode breathing timer; Insights stats carousel
- [x] Glassmorphism sweep; emoji → lucide icons; SPA navigation in Insights
- [x] CreateGoalDialog validation; Capacitor no longer loads the Lovable preview URL
