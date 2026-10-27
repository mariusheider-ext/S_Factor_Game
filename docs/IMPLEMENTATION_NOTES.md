# S-Factor — Implementation notes (demo v0.1.0)

27 October 2026. Describes what is actually built. Requirements remain in DECISIONS.md and the other specs; nothing here is a team approval.

## Run

```powershell
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests for game logic and scoring
npm run build      # type-check + static build in dist/
npm run preview    # serve the built dist/
```

Requires Node.js (tested with Node 24.21 / npm 11.19). Production builds use the Vite `base` `/S_Factor_Game/` for the GitHub Pages project URL. `.github/workflows/pages.yml` runs the tests, builds and deploys `dist/` to GitHub Pages on every push to `main`.

Developer-only URL options (no player settings):

- `?stillness=60` (also `sharpness`, `stability`, `stamina`; 5–180 s) overrides a round duration, e.g. for the 60-second Stillness review.
- `?debug` logs analytics events to the console (always on in `npm run dev`). Events are also kept in memory as `window.__sFactorEvents`.

## Architecture

| Area | Files |
|---|---|
| Config (durations, parent origin) | `src/config.ts` |
| Flow manager: Home → 4 rounds → Result, shared header, pause/exit, hidden-tab pause | `src/flow/app.ts`, `src/flow/challenge.ts` |
| Pure gameplay logic (unit-tested) | `src/scenes/*/logic.ts` |
| Challenge views | `src/scenes/*/<factor>.ts` |
| Score functions (0–100, adjustable) | `src/results/scoring.ts` |
| Result card, Continue panel, share | `src/results/resultView.ts` |
| Icons (one central SVG set), message lane, sound, Phaser stage | `src/ui/` |
| Analytics adapter | `src/analytics/analytics.ts` |
| postMessage contract (disabled) | `src/integration/parent.ts` |

Phaser 3.90 renders the animated playfields (Stability, Stamina, Stillness). UI chrome, the Sharpness grid and all input use HTML/DOM pointer events. Phaser input is disabled, so page gestures outside the game area are not blocked. Logic advances only on the pausable round clock (`src/core/roundClock.ts`).

## Mechanics as built (all provisional)

Default durations are 30/25/25/25 s. Home makes no duration claim.

- **Sharpness**: a 4×4 grid with exactly one target among decoys. Every hit reshuffles the grid, and the target symbol changes every 4 hits. Hits are unlimited. Shape alone identifies the target (all tiles share one colour). Wrong taps count as `incorrect`. Message taps are counted separately as `distractionTaps` and carry no score penalty. Taps are locked for 150 ms after a reshuffle so a double tap is not judged against the new grid.
- **Stability**: a simplified inverted pendulum with changing push forces that get stronger over the round. Hold ◀/▶ (or the arrow keys or A/D). The safe zone is ±12°, and the figure falls at ±32°. After a fall it pauses for 1.2 s, then recovers. The figure is abstract and tree-pose-inspired.
- **Stamina**: the provisional rhythm baseline only: 1 beat/s, a ±200 ms window, the first beat at 1.5 s, one credited tap per beat. Every other tap counts as an extra tap and breaks the streak. Markers move toward a ring. The runner's speed follows the streak, and it stumbles on misses and off-beat taps. An optional soft tick plays on each beat. Energy management is not implemented.
- **Stillness**: an explicit "Start the calm" button, then no input is needed. The water's energy decays visibly over the round. A water touch or a message tap creates ripples and opens a 3 s recovery window. A finger held on the water keeps the window open. Pause, exit and sound controls do not count. The round has at least four messages, scaled up for longer rounds.
- **Messages**: a fixed-height lane is reserved from the start and sits outside the grid and water. Messages slide in, have an unread badge and a small "simulated" tag. A tap expands the message inside the lane. Messages auto-hide and never need to be dismissed. The texts are placeholder examples (`src/ui/messageLane.ts`), not the recovered historical texts. The chime is an original synthesized tone with a sound toggle on Home and in the pause menu.
- **Hidden tab / pause**: the clock stops, and the round resumes only via Resume. Hidden-tab pauses are counted as `interruptions`.

## Score functions (`src/results/scoring.ts`)

| Factor | Formula |
|---|---|
| Sharpness | `min(100, round(100·correct / max(1, correct + 2·incorrect + 6)))` (GDD placeholder) |
| Stability | `clamp(round(100·inZoneMs/totalMs − 5·falls))` |
| Stamina | `clamp(round(100·max(0, hits − 0.5·extraTaps) / scheduledBeats))` (DECISIONS proposal) |
| Stillness | `clamp(round(100·undisturbedMs/totalMs))` with a 3 s recovery window per disturbance |

The flow computes scores before the result view renders. Result visibility, or any later agreed gate, does not affect scoring. The result card shows real scores, "These scores reflect this playthrough." and a collapsed "Round details" section with raw metrics and configured durations.

## Result actions

- **Continue** opens a local panel that uses the DECISIONS wording and a "Back to results" button. There is no URL and no form. It emits `continue_click` and, only if `PARENT_ORIGIN` is configured, `CONTINUE_TO_FORM`.
- **Share** shares text with the four actual scores via the Web Share API. The fallback copies to the clipboard. If neither works, the text is shown on screen.
- **Play again** starts a clean new run with a new run id and attempt number.

## Analytics

The game emits these events: `game_view`, `game_start`, `challenge_view`, `challenge_start`, `challenge_first_interaction` (once per round, on real input only), `challenge_complete` (score, raw metrics, configured and wall duration, interruptions), `challenge_exit` (only via "Exit to start"), `game_complete` (scores and durations), `result_view`, `replay_click`, `share_click`, `continue_click`, and `distraction_shown` / `distraction_tap` (template id only). It never emits `form_view` or `form_submit_success`. All ids are ephemeral, and no personal data is collected.

## Parent integration

`PARENT_ORIGIN` in `src/config.ts` is `null`, so nothing is posted. Once it is set to the agreed origin, the game sends `GAME_READY`, `GAME_COMPLETE` (scores + durations) and `CONTINUE_TO_FORM` with `{source: 's-factor-game', version: 1}` to that origin only.
