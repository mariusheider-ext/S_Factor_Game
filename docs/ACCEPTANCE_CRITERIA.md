# S-Factor — Acceptance Criteria (draft v0.1)

Status: **Proposed**, to guide an AI coding agent and objective demo review. Use `[x]` only after testing a running app.

## A. Must-have for first playable demo

- [ ] **A01** Project installs and runs from project root using `npm install` / `npm run dev`, without unstated local prerequisites beyond Node/npm.
- [ ] **A02** `npm run build` succeeds and produces `dist/` with no broken relative asset paths.
- [ ] **A03** Home screen shows “S-Factor”, the four challenge themes, Start button, and demo-friendly purpose statement.
- [ ] **A04** One contiguous flow exists: Home → Sharpness → Stability → Stamina → Stillness → Result Card.
- [ ] **A05** Progress indicator shows challenge number 1/4 through 4/4; transition between levels is short and clear.
- [ ] **A06** All four challenge scenes have actual player-interactive rules (except intentional no-touch Stillness), not placeholder static illustrations.
- [ ] **A07** Sharpness: 4×4 grid shows target and decoys; player can earn more than ten valid hits within 30 seconds; hits/incorrect taps are counted; tiles change positions/content.
- [ ] **A08** Sharpness: notifications increase distraction without preventing the user from identifying/clicking valid targets; round ends at 30s and yields numeric score.
- [ ] **A09** Stability: user controls tilt/lean with touch left/right; visible balance state responds; score derives from stable time; failure does not permanently prevent progression.
- [ ] **A10** Stamina: clearly visible rhythmic cue supports timed taps; arbitrary rapid tapping is not optimal; game records timed hits/misses and ends automatically.
- [ ] **A11** Stillness: animation visibly settles over fixed duration; in-game notifications occur; touches make ripples without trapping the user; game finishes even if user is imperfect.
- [ ] **A12** Each challenge stores separate raw metrics and a normalized 0–100 game score.
- [ ] **A13** Result Card visibly shows all four named scores; score values match the just-finished session.
- [ ] **A14** Replay restarts a clean new run, resetting timers, input states, and scores.
- [ ] **A15** No camera, microphone, location, orientation sensor, video-recording or login permission is requested.
- [ ] **A16** Main flow functions with sound muted and does not depend on audio for correct play.
- [ ] **A17** Console has no uncaught JavaScript errors during a complete demo run.
- [ ] **A18** No real phone/email/name collection or external messages are sent by the demo.

## B. Mobile and UX acceptance

- [ ] **B01** Game is readable and playable at approximately 360×800 and 390×844 CSS pixel viewports.
- [ ] **B02** Tested in a real Android Chrome browser; all taps work and no accidental page scroll prevents play.
- [ ] **B03** Tested in a real iPhone Safari browser; viewport/safe-area/gestures handled reasonably.
- [ ] **B04** No gameplay element relies solely on hovering or narrowly accurate pixel-perfect taps.
- [ ] **B05** Text and icons remain legible; distinguish targets by shape as well as color.
- [ ] **B06** Reduced-motion preference does not make gameplay impossible; avoid aggressive flashing.
- [ ] **B07** Player understands each challenge from one short instruction and on-screen feedback.
- [ ] **B08** A person can complete the entire experience while seated without other equipment.
- [ ] **B09** Inactive/background tab does not silently grant perfect Stillness score; timer/resume behavior is explicit.
- [ ] **B10** End-to-end duration is recorded and reasonably near the campaign target (about two minutes), with exact target pending sign-off.

## C. Landing-page handoff / analytics readiness

- [ ] **C01** Game can be opened using a standalone browser URL without a developer environment.
- [ ] **C02** Responsive iframe integration is demonstrated or clearly documented, pending landing-page-team approval.
- [ ] **C03** The game exposes an explicit completion payload with four factors and version, without any PII.
- [ ] **C04** A single analytics adapter is present; `challenge_view`, `challenge_start`, `challenge_first_interaction`, `challenge_complete`, `game_complete`, `result_view` are triggered at the intended points.
- [ ] **C05** Analytics adapter works without a backend, i.e. no hard network dependency for running the demo.
- [ ] **C06** Demo identifies where the landing-page form starts and **does not falsely record** `form_submit_success`.
- [ ] **C07** Repo URL, hosting URL, owner, visibility, deployment responsibility and integration owner are known and shared with authorized stakeholders.

## D. Later production checks (not required for first demo)

- [ ] **P01** Final art, branding, Sadhanapada wording, and approved UX copy reviewed by team.
- [ ] **P02** Live lead form works and includes privacy notice and valid contact opt-in.
- [ ] **P03** Analytics provider integrated without transmitting unnecessary personal data; events and retention reviewed.
- [ ] **P04** All links, image-sharing fallbacks and browser compatibility checked in campaign environment.
- [ ] **P05** Hosted build tested from actual landing-page origin (CSP, frame permissions and sizing verified).
- [ ] **P06** All external services and assets have appropriate rights and security review.
- [ ] **P07** Explicit public deployment approval, especially if GitHub Pages makes demo public.

## Review protocol

Record a short end-to-end screen capture and test on at least one Android and one iPhone device. For each defect record browser/device, reproduction steps, expected behavior and actual behavior. Mark untested items honestly; do not state all acceptance criteria pass based only on a successful desktop run.
