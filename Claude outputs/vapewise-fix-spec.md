# VapeWise — Fix Spec: Top 5 Priority Items

Feed this whole file to Claude Code (`claude "read vapewise-fix-spec.md and implement it"`) or work through it top to bottom. Each item has: the bug, the root cause, and the exact fix to implement. Do them in order — #1 and #2 are blocking, the rest build on stable state.

---

## 1. Goals page infinite render loop

**Files:** `src/pages/Goals.tsx` (lines 40-57), `src/hooks/useAdvancedGoals.ts` (`updateGoalProgress`, lines ~173-213), `src/hooks/usePuffData.ts` (`getWeeklyData`, line ~200)

**Root cause:** `getWeeklyData()` returns a brand-new array every call. The `Goals.tsx` effect depends on `weeklyData` (a fresh reference every render) and calls `updateGoalProgress()`, which calls `setGoals` unconditionally — even when `current` hasn't changed. New state → re-render → new `weeklyData` → effect fires again → infinite loop → "Maximum update depth exceeded."

**Fix:**
1. In `useAdvancedGoals.ts`, make `updateGoalProgress` a no-op when progress hasn't changed:
   ```ts
   const updateGoalProgress = (goalId: string, progress: number) => {
     setGoals(prev => {
       const goal = prev.find(g => g.id === goalId);
       if (!goal || goal.current === progress) return prev; // bail out, same reference
       return prev.map(g => g.id === goalId ? { ...g, current: progress, /* ...completion logic */ } : g);
     });
   };
   ```
2. In `Goals.tsx`, memoize `weeklyData` so its reference is stable across renders when the underlying puff data hasn't changed:
   ```ts
   const weeklyData = useMemo(() => getWeeklyData(), [puffs]); // expose `puffs` from usePuffData
   ```
   (Add `puffs` to the `usePuffData()` destructure if not already exposed — it already is.)
3. Tighten the effect's dependency array to primitives only, not the array reference:
   ```ts
   }, [todaysPuffs, weekAvg, streakData.current]); // drop weeklyData, derive weeklyTotal inside
   ```
4. Add a top-level `ErrorBoundary` (see item #2) as a safety net regardless.

**Acceptance:** Open `/goals` in a fresh browser profile (no localStorage). Page loads without console errors, no "Maximum update depth exceeded" warning, React DevTools Profiler shows the effect firing once (not looping) per genuine data change.

---

## 2. Unguarded `JSON.parse` + no error boundary

**Files:** `src/hooks/usePuffData.ts` (lines 41, 52, 61), `src/hooks/useAdvancedGoals.ts` (lines 42, 86, 130), `src/hooks/useAdvancedGamification.ts` (lines 245, 256, 263)

**Root cause:** Every `localStorage.getItem(...)` result is passed straight to `JSON.parse` with no try/catch. Any corrupted, truncated, or schema-mismatched value throws synchronously during a mount effect, and with no `ErrorBoundary` in the tree, the whole app white-screens.

**Fix:**
1. Add a small shared helper, e.g. `src/lib/safeStorage.ts`:
   ```ts
   export function safeParse<T>(key: string, fallback: T): T {
     try {
       const raw = localStorage.getItem(key);
       if (!raw) return fallback;
       return JSON.parse(raw) as T;
     } catch (err) {
       console.error(`Corrupted localStorage key "${key}", resetting to default.`, err);
       localStorage.removeItem(key);
       return fallback;
     }
   }
   ```
2. Replace every raw `JSON.parse(localStorage.getItem(...))` call in the three hooks with `safeParse(key, fallbackValue)`.
3. Add a top-level `ErrorBoundary` component (class component, standard `getDerivedStateFromError`/`componentDidCatch`) and wrap the router output in `App.tsx`, so any *other* unexpected render error shows a recoverable "Something went wrong — Reload" screen instead of a blank page.

**Acceptance:** Manually corrupt a key (`localStorage.setItem('vape-puffs', '{not json')`) and reload — app loads with defaults instead of crashing, and a console error is logged (not thrown uncaught).

---

## 3. Exceeding your limit is rewarded as success

**Files:** `src/hooks/useAdvancedGoals.ts` (`updateGoalProgress`, lines ~179-207), `src/hooks/usePuffData.ts` (`checkAchievements`, "goal-met" case, lines ~113-115)

**Root cause:** The default goals (`daily-reduction` target 20, `weekly-reduction` target 120) represent **limits not to exceed**, but the code treats `current >= target` as completion — awarding XP and firing "Goal Completed!" the moment you hit or exceed your daily puff limit. Similarly the "Goal Getter" achievement (`getTodaysPuffs() + newPuffCount <= dailyGoal`) unlocks on puff #1 since `1 <= 20` is trivially true.

**Fix:**
1. Add a `direction` field to the `Goal` type distinguishing "at-least" goals (e.g. streak length) from "at-most" goals (reduction/limit goals):
   ```ts
   direction: 'increase' | 'decrease'; // 'decrease' = stay under target, 'increase' = reach/exceed target
   ```
   Set `direction: 'decrease'` on `daily-reduction` and `weekly-reduction`.
2. In `updateGoalProgress`, branch completion logic on direction:
   ```ts
   const isComplete = goal.direction === 'decrease'
     ? progress <= goal.target && /* only at end of period, see below */ periodEnded
     : progress >= goal.target;
   ```
   For "decrease" goals specifically: completion should only be evaluated **at the end of the goal's period** (end of day for daily, end of week for weekly), not on every intermediate log — otherwise logging your very first puff (1 ≤ 20) instantly "succeeds." Practically: track `current` throughout the period for display, but only stamp `completedAt` from a periodic check (e.g. a date-rollover effect) that evaluates whether the period's total stayed under target.
3. Rework `checkAchievements`'s `goal-met` condition in `usePuffData.ts` to only unlock at end-of-day evaluation (once the day is over and total stayed within the goal), not on every `addPuff` call. Simplest correct version: move this check into the same date-rollover logic as #4 below, comparing *yesterday's* total to the goal.
4. Add a daily/weekly rollover: when the app detects the date has changed since `lastActiveDate`, evaluate the previous period's goals (completed/failed) and reset `current` to 0 for the new period, rather than leaving a goal permanently "completed" after one over-limit day.

**Acceptance:** Log 25 puffs in one day against a daily goal of 20 — no "Goal Completed" toast, no XP awarded, goal shows as "over limit" not "completed." Stay under 20 puffs through a full day — goal is marked complete only after the day rolls over, not mid-day.

---

## 4. Custom goals never make progress

**Files:** `src/pages/Goals.tsx` (lines 42-52), `src/hooks/useAdvancedGoals.ts` (`createCustomGoal`, `updateGoalProgress`)

**Root cause:** The progress-sync effect in `Goals.tsx` only calls `updateGoalProgress` for the two hard-coded IDs `daily-reduction` and `weekly-reduction`. Any goal created via `CreateGoalDialog` stays at `current: 0` forever.

**Fix:**
1. Generalize the sync effect to iterate over **all active goals**, computing the right progress source per goal `category`/`period` instead of hard-coded IDs:
   ```ts
   useEffect(() => {
     goals.forEach(goal => {
       if (!goal.isActive || goal.completedAt) return;
       const progress = goal.period === 'day' ? todaysPuffs
         : goal.period === 'week' ? weeklyTotal
         : goal.current; // custom/month periods: leave to manual or future logic, don't silently zero
       updateGoalProgress(goal.id, progress);
     });
   }, [todaysPuffs, weekAvg, streakData.current]);
   ```
2. For goals whose `category` isn't `'reduction'` (e.g. `'mindfulness'`, `'streak'`), decide and document an explicit progress source — at minimum, wire `'streak'` category goals to `streakData.current` so they're not silently frozen either. Anything genuinely unsupported (e.g. free-text mindfulness goals) should say so in the UI (see `GoalCard` — show "manual tracking" instead of a 0% bar that looks broken).

**Acceptance:** Create a custom goal via "Create Custom Goal" with period=week, category=reduction, target=50. Log puffs — the custom goal's progress bar advances alongside the built-in weekly goal.

---

## 5. CravingDelay completion screen is unreachable

**File:** `src/pages/CravingDelay.tsx` (lines ~39-48 and ~129-179)

**Root cause:** The "Delay Complete!" block is nested inside `{(isActive || timeLeft > 0) && ...}`. When the countdown finishes, the interval callback sets `isActive` to `false` and `timeLeft` to `0` in the same tick — so the parent condition is false and the whole card (including the completion message) unmounts immediately. Users only see a fleeting toast.

**Fix:**
1. Add an explicit `isComplete` state instead of overloading `isActive`/`timeLeft === 0` (which also means "never started"):
   ```ts
   const [isComplete, setIsComplete] = useState(false);
   ```
2. In the interval callback, set `isComplete` to `true` on finish instead of relying on the `timeLeft === 0` sentinel:
   ```ts
   setTimeLeft(time => {
     if (time <= 1) {
       setIsActive(false);
       setIsComplete(true); // move this out of the updater below in step 3
       return 0;
     }
     return time - 1;
   });
   ```
3. Move the `setIsActive`/`toast` side effects out of the `setTimeLeft` updater (updaters must stay pure) — use a separate `useEffect` keyed on `timeLeft === 0 && isActive` transitioning, or a ref-based guard, so `setIsActive`/`setIsComplete`/`toast.success` run once as a genuine side effect, not inside React's state-update reducer.
4. Update the render conditions:
   ```tsx
   {!isActive && !isComplete && timeLeft === 0 && ( /* duration picker */ )}
   {(isActive || (timeLeft > 0 && !isComplete)) && ( /* timer UI, no completion block inside */ )}
   {isComplete && ( /* the "Delay Complete!" card, with a way to reset back to the picker */ )}
   ```
5. Give the completion screen a clear next action (e.g. "Log how you feel" / "Start another delay" button that resets `isComplete` and `timeLeft`), since right now there's no way back to the picker either.

**Acceptance:** Start a 1-minute delay, let it run out. The "Delay Complete!" card with the checkmark and "How are you feeling now?" is visible and stays visible (not a flash) until the user dismisses it or starts a new delay.

---

## Suggested order of work

1. Fix #1 (infinite loop) and #2 (safe JSON parse + ErrorBoundary) together — both are stability blockers and touch the same hooks.
2. Fix #3 (limit-vs-target direction) since it's the core product-logic bug.
3. Fix #4 (custom goals), which depends on the generalized progress-sync effect touched in #1.
4. Fix #5 (CravingDelay) — independent, can be done any time, good candidate to parallelize.

Run `npm run build` and manually smoke-test `/goals`, `/`, and `/craving-delay` after each item before moving to the next.
