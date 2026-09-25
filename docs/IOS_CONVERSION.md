# VapeWise — iOS Conversion Checklist

Order matters roughly top to bottom. Steps marked **(Mac)** must run on your actual Mac (Xcode/Capacitor build tooling), not this session's Linux VM.

## 1. Housekeeping first (THINGS_TO_DO.md Section 4)
Do this before generating the native project so dead code doesn't ship — App Store review flags console noise.

- [x] Fix `NotFound.tsx` — now uses `<Link>` instead of `<a href="/">`.
- [x] Fix the 3 `any` types in `CreateGoalDialog.tsx` Select handlers — now typed as `Goal['period']` / `Goal['category']` / `Goal['difficulty']`.
- [x] Remove unused `trigger`/`mood` fields on `PuffEntry` (confirmed unused anywhere in the app before removing).
- [x] Remove the dead shadcn toast stack — `<Toaster />` (from `ui/toaster.tsx`) taken out of `App.tsx`; the app only ever called `toast` from `sonner` directly, never `useToast` from the shadcn hook.
- [x] `ui/sonner.tsx` no longer imports `next-themes` — reads theme from the app's own `useTheme` hook instead.
- [x] Deleted the dead files: `src/pages/Index.tsx`, `src/App.css`, `src/hooks/use-toast.ts`, `src/components/ui/toaster.tsx`, `src/components/ui/use-toast.ts` (confirmed gone).
- [ ] `src/components/ui/toast.tsx` (the underlying shadcn Toast primitive) is now orphaned too, since it was only ever used by the `toaster.tsx` just deleted. Not on the original list — optional follow-on cleanup.
- [ ] Code-split routes (`React.lazy`) — main chunk is ~975 kB; Recharts alone is a big share. Not a hard blocker, not done yet.

## 2. Swap web notifications for native — done
`src/lib/reminders.ts` now branches on `Capacitor.isNativePlatform()`: native builds schedule a real recurring OS notification via `@capacitor/local-notifications` (fires with the app closed/killed), web/PWA keeps the old foreground-timer + Web Notifications fallback. `useReminderScheduler.ts` needed no changes — same function signatures.

- [x] Added `"@capacitor/local-notifications": "^7.0.0"` to `package.json` dependencies.
- [x] `npm install` run — confirmed `@capacitor/local-notifications` present in `node_modules`.

## 3. Generate the native project — done **(Mac)**
- [x] `npm run build`
- [x] `npx cap add ios` — `ios/` project generated.
- [x] `npx cap sync ios` — CocoaPods installed (`ios/App/Pods/`, `Podfile.lock` present).
- [x] `ios/App/App.xcworkspace` exists and is ready to open in Xcode.

## 4. Xcode configuration
- [x] Bundle ID — already `com.vapewise.app` (from `capacitor.config.ts`, propagated automatically by `cap add ios`). No action needed.
- [x] App icon — replaced Capacitor's generic placeholder with your actual VapeWise mark (the amber ring/dot from `public/pwa-512.png`), resized to 1024×1024 and flattened to remove alpha (App Store requirement). Written to `Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`.
- [x] Launch screen — replaced the generic placeholder with a matching branded splash (same mark, centered on a seamless black background) across all three scale files in `Assets.xcassets/Splash.imageset/`.
- [x] ~~Add `NSUserNotificationsUsageDescription`~~ — correction: this isn't actually a real Info.plist key. Unlike camera/location, iOS local/push notification permission is requested purely in code (`UNUserNotificationCenter`/`LocalNotifications.requestPermissions()`) and shows a standard system dialog — no usage-description string needed. Removing this from the checklist.
- [x] Signing team set — confirmed `DEVELOPMENT_TEAM = 58Z9XK6U84` in both Debug/Release build configs.
- [ ] Min iOS deployment target: currently `14.0` (Capacitor 7's default) — left as-is since there's no feature here that needs 16+. The original checklist wording ("iOS 16+") was about which real device to test on before submitting, not the deployment target. Raise it only if you want to drop pre-iOS-16 device support intentionally.

## 5. Store listing assets
- [x] 1024×1024 app icon (no alpha channel) — done above, same file usable for the App Store Connect listing.
- [ ] Screenshots: 6.7" and 6.1" device sizes.
- [ ] Privacy policy URL — straightforward here: "all data stored on device, nothing leaves your phone."
- [ ] Age rating questionnaire.
- [ ] App Store description + keywords.

## 6. Test and submit **(Mac)**
- [x] First Simulator run surfaced a real bug: `AppHeader.tsx` (sticky top bar) and `BottomNav.tsx` (fixed bottom bar) had no iOS safe-area handling, so the header — including the Settings icon — rendered underneath the status bar/notch and was untappable. Web/PWA never showed this because the browser chrome absorbed that space. Fixed: `index.html` already had `viewport-fit=cover`, so `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` just needed to be added — `pt-[env(safe-area-inset-top)]` on the header, `pb-[env(safe-area-inset-bottom)]` on the bottom nav. Pages already had `pb-32` reserving enough room above the nav, so no other layout changes needed.
- [x] Re-ran in Simulator to confirm the header/Settings icon and bottom nav are clear of the status bar and home indicator — confirmed.
- [x] Automated testing added:
  - Unit tests (Vitest) for pure logic — `vitest.config.ts`, `src/hooks/usePuffData.test.ts` (streak computation, 9 cases), `src/lib/progressTone.test.ts` (limit-color thresholds, 8 cases). `npm test` — **17/17 passing** on your machine.
  - Simulator walkthrough (computer-use) driving the real running app: settings icon tap, theme toggle (Light/Dark), Log Puffs flow (sheet → increments → toast/Undo), achievement unlocks firing live (First Step, Goal Getter), all 5 bottom-nav tabs (Home/Insights/Goals/Rewards/Delay) navigate cleanly. No bugs found.
- [ ] TestFlight build.
- [ ] Real-device pass on iOS 16+ (check reminder notifications fire with app killed, data persists, onboarding/settings/history all work natively).
- [ ] Submit for review.

---
*Everything else — data model, goals, streaks, achievements — is already local-first (localStorage) and needs no changes to run inside WKWebView. This file supersedes the App Store section of `THINGS_TO_DO.md`; keep both in sync if either changes.*
