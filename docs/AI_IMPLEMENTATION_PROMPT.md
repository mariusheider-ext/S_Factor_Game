# Implementation handoff for Claude

## Project language

All project documentation, player-facing UI copy, code comments and implementation handoff prompts for Claude must be in English. Conversation with the user may remain in German. This also applies to short Claude prompts supplied in chat.


Updated 27 October 2026. Implement a simple, complete mobile browser demo of S-Factor in this existing project. The Work chat maintains requirements/reference guidance; you implement and verify the game.

## Read first and precedence

1. README.md and docs/DECISIONS.md (latest user feedback, explicit provisional defaults and context gaps).
2. docs/RECOVERED_CONTEXT.md for historical variants and attribution, then docs/GAME_DESIGN.md, docs/TECHNICAL_REQUIREMENTS.md, docs/ACCEPTANCE_CRITERIA.md.
3. references/VISUAL_SPEC_v1.md and six v1 PNGs only as mood/color inspiration.

DECISIONS overrides older documents and image contents. Recovered historical statements must be reconciled with the latest user's directions, not blindly adopted. The supplied old-chat reconstruction is reconciled in RECOVERED_CONTEXT.md. A local team deck now exists; full primary-source verification and final landing-page decisions remain incomplete. Never invent team approvals.

Claude is already implementing. This update does not authorize a restart, new mechanics or extra scope; preserve completed work.

## Build scope

- Use Phaser + Vite + TypeScript with HTML/CSS in this root. Inspect existing code first; preserve docs, references and user changes. Do not create a nested project.
- Complete Home -> Sharpness -> Stability -> Stamina -> Stillness -> Result flow before extra visual polish.
- Simple navy/ivory design and factor accents. Gradients, SVG/simple shapes, basic avatar and runner, procedural water suffice. Do not recreate the cinematic scenery or use flattened UI screenshots.
- One shared active-round header: current factor, 1/4 and timer. No four-factor tabs, icon rows or decorative score meters.
- Consistent provisional icons: star, leaf, lightning bolt, lotus; central definitions reused on Home/Result. Active rounds may omit icons.
- Home: S-Factor, four themes and Start. No camera slogan and no unconfirmed total-duration claim.
- Large reachable controls, mobile safe areas, keyboard/mouse fallback, muted play, reduced motion. No camera, microphone, location, orientation sensors, required workout, installation or login.

## Mechanics and unresolved choices

- Sharpness: dynamic 4x4 symbol search, always a valid target, 30s provisional round, no cap of ten hits.
- Stability: press-and-hold left/right to balance a digital avatar, broad safe zone, recover after falls, 25s provisional.
- Stamina: EXISTING provisional rhythm baseline, 25s, visible timing cues and runner feedback tied to input. Extra taps must not help. DECISIONS contains tuning suggestions. Energy-management racing is under discussion but NOT selected. Do not silently replace/combine mechanics.
- Stillness: 25s provisional, configurable for a 60s review. Explicit start before no-touch play; water settles, messages tempt interaction. Water/message reactions cause recoverable ripples; pause/exit/sound controls are exempt. Hidden tab pauses the timer, does not grant free perfect progress.
- Durations are configurable in one place; no final two-minute total or per-challenge claim.
- Use DECISIONS distraction rules: fixed safe lane, no occlusion or layout shift, noticeable conversational previews/unread badge, optional original chime with toggle. Message expansion stays in its lane. No real messages, external navigation or copyrighted service sounds without supplied rights.

## Actual results and campaign handoff

Calculate all four scores from the just-finished run using documented adjustable functions. Never hard-code image values, fabricate missing challenge scores or label real results Sample scores. No prominent demo/assessment disclaimer in result UI; avoid scientific claims.
Show Your S-Factor, four named scores/bars, replay and a temporary Continue action. Continue opens the clearly described local handoff panel in DECISIONS, not an invented campaign URL or fake working form. Recovered later team ideation gated results behind contact opt-in, followed by a WhatsApp Adiyogi invitation. Result-first remains the provisional demo, not approved campaign ordering. Keep scoring separate from visibility; do not add a live gate or WhatsApp integration now. Final destination, selected order, consent and ownership remain open.
Sharing is optional after core flow; share actual scores and handle unsupported sharing/cancel gracefully. No leaderboard or backend.

## Analytics and integration

Implement one typed local debug/no-op adapter; no real third-party transmission for this demo.
Cover game/page view, game start, challenge view/start/first actual interaction/completion/explicit exit, game complete, result view, replay, share, continuation, distraction shown/tapped. Do not count challenge start as interaction. Stillness may complete without any interaction. Use ephemeral run/attempt IDs and durations, no personal data/message bodies.
Define parent integration separately. form_view and form_submit_success belong to actual form ownership and must not be emitted by the placeholder. Do not infer confirmed abandonment from every tab hide/unload.

## Verify and deliver

Run install/dev/build as appropriate and meaningful checks on scoring, reset, spam tapping, interruption/resume, distraction hit areas and one full run. Report what was actually tested, including device limitations. No acceptance boxes checked without evidence.
Provide startup/build steps, actual implementation choices and outstanding decisions. Preserve the documentation's distinction between proposal and team approval.
Repository is mariusheider-ext/S_Factor_Game, branch main; only mariusheider-ext, never the personal GitHub account. No remote repo creation, push, account switching or deployment without explicit authorization and identity verification. Do not add an auto-publishing workflow as part of this demo handoff.

## Reference update while implementation is underway

The team contact supplied landing-page samples for reference only. Read docs/LANDING_PAGE_REFERENCE_REVIEW.md. They contain differing visual styles, score scales and signup/timing promises, not approved requirements. Continue the existing demo; keep styling and result handoff adaptable. Do not rebuild the landing page, add a result gate/WhatsApp flow, change scores/timings or restart work based on these samples.

## Latest user direction and source verification

Keep the current dark near-black/navy background. Do not switch to light/white styling. Purple/violet may be considered later, not as an immediate redesign. Read docs/TEAM_SOURCE_REVIEW.md: original deck and local 11-page PDF have been checked. The recovered 24-page source is not the same verified pagination. Preserve current simple digital demo scope; no restart, mandatory physical exercises or new funnel features.
