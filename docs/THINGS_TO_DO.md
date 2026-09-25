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

- [x] **Daily reminder notification** — Settings → Reminders: toggle + hour picker. Web Notifications API via the service worker, so it works for the PWA and while a tab is open; catch-up check on foreground if the hour passed and nothing was logged. Native follow-up: `npm i @capacitor/local-notifications` and swap `src/lib/reminders.ts` to schedule through it so it fires with the app closed (iOS WKWebView does not support web notifications).
- [x] **Unobtainable badges** — all three now have real progress sources: `reduction-champion` = % below baseline (tracked-day week average), `goal-crusher` = completed days with logs that stayed under the daily limit, `insight-seeker` = Insights page visit counter (`vape-insights-views`).
- [x] **Streak multipliers actually apply** — tiers live in `src/lib/streakMultipliers.ts`; `useAdvancedGoals(streak)` applies them to goal + milestone XP, `useAdvancedGamification` applies them to badge points. Both hooks read the same table so the UI copy is now true.
- [x] **Lock BottomNav/Header during onboarding** — onboarding state moved to `OnboardingProvider` (context) and `App.tsx` renders `OnboardingFlow` *instead of* the shell until it's done. Settings → Restart flips the same state.
- [x] **Loading skeletons** — `PageSkeleton` on Home, Insights, Goals, Gamification; `useAdvancedGoals` / `useAdvancedGamification` now expose `hydrated` and no longer write to storage before load.

## 3. Only if you want multi-device / backup

- [ ] **Account + sync (Supabase)** — a login screen on its own adds friction and nothing else while data lives in localStorage. Do it only as "sign in to back up & sync", keep guest mode as the default, and migrate local data on first sign-in. Same stack as strum-smart, so auth/RLS patterns can be copied.

## 4. Housekeeping

- [ ] Delete dead code: `src/pages/Index.tsx`, `src/App.css`, `src/hooks/use-toast.ts` + shadcn `<Toaster />` (app uses sonner), `next-themes` import in `ui/sonner.tsx` (use the app's `useTheme`), unused `trigger`/`mood` fields on `PuffEntry`.
- [ ] Fix the 3 pre-existing `any` types in `CreateGoalDialog.tsx` Select handlers.
- [ ] `NotFound.tsx` — off-brand styling, uses `<a href="/">` (full reload) instead of `<Link>`.
- [ ] Code-split routes (`React.lazy`) — main chunk is ~975 kB; Recharts alone is a big share.
- [ ] Add a few tests around `usePuffData` streak/rollover logic before touching it again.
- [ ] Two point systems coexist: goal/milestone XP (`user-progress`, Goals page) and badge points (`total-gamification-points`, Rewards page). Merge into one or label them distinctly.

## 5. App Store release checklist

- [ ] Section 4 cleanup (dead code, `any` types) — reviewers flag console noise.
- [ ] `@capacitor/local-notifications` for the reminder on iOS (see Section 2 note).
- [ ] `npm run build && npx cap add ios && npx cap sync ios`, open `ios/App/App.xcworkspace`, set bundle ID + signing team.
- [ ] Assets: 1024×1024 icon (no alpha), 6.7" + 6.1" screenshots, privacy policy URL ("all data stored on device"), age rating questionnaire, description/keywords.
- [ ] TestFlight build → real-device pass on iOS 16+ → submit.

## Done in this pass (for reference)

- [x] Section 2 complete: reminders, badge sources, applied multipliers, onboarding gate, skeletons + hydration guards on goals/gamification hooks

- [x] v1 must-haves: Settings (/settings, gear in header), History (/history) with edit/delete + undo, baseline step in onboarding → first goal = 90% of baseline, streak algorithm rewritten (old one capped at 2) + recompute on foreground, PWA (manifest, icons, autoUpdate SW, font caching)

- [x] Goals infinite render loop, unguarded `JSON.parse`, ErrorBoundary
- [x] Limit-vs-target goal direction; custom goals get progress; CravingDelay completion screen
- [x] Design tokens: amber accent, 3 surface tiers, Sora / JetBrains Mono / Inter
- [x] Ring gauge on Home; log drawer; undo toast; +/- cap
- [x] Route transitions (reduced-motion aware); focus-mode breathing timer; Insights stats carousel
- [x] Glassmorphism sweep; emoji → lucide icons; SPA navigation in Insights
- [x] CreateGoalDialog validation; Capacitor no longer loads the Lovable preview URL
