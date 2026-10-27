# Implementation prompt for Claude Code / Codex

You are the lead developer for a short, mobile-first browser demo named **S-Factor**. Work in this existing repository root and read **README.md** and all three project specifications first:

- `docs/GAME_DESIGN.md`
- `docs/TECHNICAL_REQUIREMENTS.md`
- `docs/ACCEPTANCE_CRITERIA.md`

Treat those as the implementation contract. The `references/` folder may initially be empty; build with original vector/CSS/Phaser graphics if needed. **Do not invent unrelated features or assume we are implementing the physical Vrikshasana/workout versions.** The digital alternatives are the *current demo baseline*, pending stakeholder feedback.

## Deliverables, in strict priority

1. Initialize a clean **Phaser + Vite + TypeScript** project in this same root (do not overwrite/delete the existing `docs`, `references`, `README.md`). Keep the code modular and understandable.
2. Build a polished mobile-first Home → Sharpness → Stability → Stamina → Stillness → Result Card flow.
3. Implement each minigame as a working playable mechanic with proper timers, input, feedback, scoring, and scene transitions.
4. Make the Result Card display the four scores, with replay. No real lead form or third-party integrations in the demo.
5. Provide an internal analytics event adapter with debug output, but no external data transmission.
6. Verify `npm run build` succeeds and run accessible automated checks where practicable. If the environment allows, test full browser flow, particularly pointer input and timing.
7. Document startup, build, deployment, and integration notes in README. Add GitHub Actions Pages workflow **only after the build is verified**, using Vite base path for eventual repo `S_Factor_Game`.
8. Make one clear Git commit at a time if local Git is initialized. **Do not create remote repositories or push without explicit authorization and verified work-account credentials.** Never switch accounts implicitly.

## Visual requirements

- Strong demo impression even with original placeholder art: modern dark UI, restrained accent palette (warm Sharpness, teal Stability, electric blue Stamina, blue-green Stillness), clean typography, smooth but lightweight motion, excellent readable touch controls.
- Fit modern smartphone portrait with one-thumb usability; ensure desktop demo also works.
- Use scalable shapes and animations, not licensed/copyrighted brand sounds or images.
- Keep overall run near 2 minutes (not including extended intro/reading), but prioritize a smooth, comprehensible demo.

## Hard guardrails

- Do not ask for camera, microphone, geolocation, physical workout, or orientation sensor access.
- No hidden tracking, no real phone/email collection, no WhatsApp automation, no backend or leaderboard.
- Do not claim the scores scientifically assess inner qualities. Label results as game challenge scores.
- Never claim success without actually running build/tests.
- For any unclear requirement, choose a minimal reversible implementation and leave a short TODO in `docs/DECISIONS.md`.

## Deliver work clearly

At the end, report:

1. Features implemented vs. still missing.
2. Exact commands to run locally and build.
3. Tests actually run, with outcomes and limitations.
4. Any needed additions from the landing-page team (embed/origin/form/analytics).
5. The path of the demo build and (if authorized) the deployment URL.

Start with the full vertical-slice experience, then polish Sharpness. Do not start by spending all available time on visual effects for the first game.
