# Accounts, signature onboarding, profile card, progress heatmap, content audit

The new upload matches the content already loaded: same 128 files, no differences. The audit below checks it again against the database.

## 1. Sign up / sign in

- New `/auth` page with Sign in and Create account tabs. Fields: name, email, password. Includes "Forgot password" and a `/reset-password` page.
- Turn on email/password sign-in. Email confirmation stays on, so after signing up you see a "check your inbox" message.
- Header shows "Sign in" when you're signed out. When you're signed in, it shows your initials avatar, which opens the profile card.
- Protected pages (`/me`, `/me/calibration`, lessons) move behind sign-in. The library, sources and home page stay public.

## 2. Fault-tolerant foundation

- One shared error boundary for every route, with friendly retry screens. The 404 page stays.
- Every server call returns a typed `{ data, error }` result. Inputs are checked with zod. Lessons, the library and the profile get loading and empty states.
- Clear auth error messages: wrong password, unconfirmed email, rate limited, offline.
- Small vitest tests for signature generation, streak calculation and heatmap bucketing.

## 3. Signature onboarding popup

- The first time you open a lesson, a small popup appears: "Sign your commitment."
- It draws an animated ASCII signature built only from your initials, in the style of bencho's ascii-wake signature. Your cursor disturbs it, and you press and hold to "sign."
- Signing saves your signature and a learning goal you type in. The popup won't show again.

## 4. Home-only particle backdrop

- An ASCII particle field that reacts to the cursor (ascii-wake particles style) sits behind the home hero only. It runs only in the browser, pauses when the tab is hidden, and respects reduced-motion settings.

## 5. Profile spotlight card

- Clicking your avatar opens a compact SpotlightCard (reactbits style) with your initials signature, name, up to 3 learning goals, current streak, lessons done and a mini heatmap.
- It links to `/me` for full details and has a sign-out button.

## 6. GitHub-style daily progress chart

- A 52-week contribution grid on `/me` showing lessons, labs and articles finished each day. It has 5 intensity levels, tooltips and current and longest streak. It scrolls sideways on mobile, the contribution of learning proceeds to the addtions for the **Discipline scores**
  Systems ThinkingSystem DesignEngineering
  - 0
    Systems Thinking
  - 0
    System Design
  - 0
    Engineering sections.

## 7. Content audit and full-stack completion

- Re-check all 128 files against the database: row counts per table, every article body, and every source, prompt, role and coverage row. Any gaps get re-imported.
- Report what didn't fully render, such as broken internal links and tables.
- Responsive pass at 360, 768, 1024 and 1440 px on every page.

## Technical details

- Database tables (added to the backend; the content tables stay as they are). All are owner-only and RLS-scoped to the signed-in user:
  - `profiles`: name, initials, signature seed, signed_at.
  - `learning_goals`: up to 3 per user, enforced by a trigger.
  - `progress_events`: user, kind, ref, occurred_on date. This feeds the heatmap and streaks.
  - A trigger on signup creates each profile.
- Server functions in `src/lib/neet/account.functions.ts` use `requireSupabaseAuth`. Lessons you completed earlier and saved in this browser are uploaded once after your first sign-in.
- New components: `AsciiSignature`, `AsciiParticles` (canvas, client-only), `SignatureGate`, `ProfileCard`, `ProgressHeatmap`.
- The Apple-style system UI from memory stays unchanged.
