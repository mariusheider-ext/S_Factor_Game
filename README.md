# S-Factor Game — project preparation

**Status:** Documentation updated 27 October 2026 after visual review. **A playable demo (v0.1.0, provisional mechanics) is implemented: run `npm install` then `npm run dev`; see [docs/IMPLEMENTATION_NOTES.md](docs/IMPLEMENTATION_NOTES.md).** Work chat maintains specs/prompts; Claude handles implementation.

Read [docs/DECISIONS.md](docs/DECISIONS.md) first: latest user feedback and explicit provisional defaults override earlier wording and reference images. The user-supplied old-chat reconstruction is reconciled in [docs/RECOVERED_CONTEXT.md](docs/RECOVERED_CONTEXT.md). Historical concepts do not automatically become requirements. Claude is already implementing; this update does not restart or expand that assignment.

**Goal:** Four short, touch-first, browser-based challenges (Sharpness → Stability → Stamina → Stillness) culminating in a shareable S-Factor Result Card. This is a demonstration of the proposed experience, not a validated psychological test.

**Deadline context:** Internal demo targeted for the landing-page-team meeting on 27/28 October 2026; estimated campaign launch around 15 November 2026. A stated ~10-day implementation window is to be confirmed with the team.

## Read these first

1. [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) — gameplay rules, flow, visuals, scoring.
2. [`docs/TECHNICAL_REQUIREMENTS.md`](docs/TECHNICAL_REQUIREMENTS.md) — architecture, integration, hosting, analytics.
3. [`docs/ACCEPTANCE_CRITERIA.md`](docs/ACCEPTANCE_CRITERIA.md) — checkable demo and production acceptance tests.
4. [`docs/AI_IMPLEMENTATION_PROMPT.md`](docs/AI_IMPLEMENTATION_PROMPT.md) — instruction to hand to Claude Code / Codex.
5. [`docs/GITHUB_SETUP_WINDOWS.md`](docs/GITHUB_SETUP_WINDOWS.md) — safe setup for a separate work GitHub account.

## Proposed structure

```text
S_Factor_Game/
├── README.md
├── .gitignore
├── docs/
│   ├── GAME_DESIGN.md
│   ├── TECHNICAL_REQUIREMENTS.md
│   ├── ACCEPTANCE_CRITERIA.md
│   ├── AI_IMPLEMENTATION_PROMPT.md
│   └── GITHUB_SETUP_WINDOWS.md
├── references/               # Six v1 mood references; not binding UI/copy
├── src/
│   ├── scenes/               # Four playable Phaser challenge scenes
│   ├── ui/                   # Navigation, timer, accessibility, results
│   ├── analytics/            # Typed event interface + optional adapters
│   └── results/              # Score normalization and result card rendering
├── public/assets/           # Exported runtime graphics and sounds
└── .github/workflows/       # Pages build workflow after application setup
```

The `src` and `public` directories are placeholders; the AI coding agent should initialize a proper Phaser + Vite + TypeScript project **inside this existing root**, preserving docs and references.

## Local location (Windows)

`C:\Users\heide\Documents\Sadhanapada 2026\Karma Sadhana\S_Factor_Game`

## Decisions / current scope

- **Agreed planning baseline:** Sharpness as a dynamic 4×4 symbol challenge; touch-controlled digital balance for Stability; rhythm-based Pace Runner for Stamina; passive water/notification challenge for Stillness.
- These are *proposed alternatives*, not approved team requirements. The four PowerPoint slides remain the baseline concepts.
- A full vertical-slice demo should include all four challenges and a result card calculated from the actual playthrough; no real contacts, WhatsApp messages, camera capture, or backend are needed for the initial demo.
- The landing-page team owns the already-prepared landing-page draft **subject to explicit confirmation of integration ownership**.

## Deployment

Suggested: GitHub repository under the **authorized work account** and GitHub Pages via Actions *once the game builds*. GitHub Pages availability and source-code visibility depend on the account plan and repo privacy settings; a published Pages site is usually public. Do not upload sensitive material, personal data, or internal credentials. Do not treat GitHub Pages as a database.

**Do not enable deployment until:** (1) the work-account owner approves repo visibility, (2) the app has a working `npm run build`, and (3) the configured repository name and Vite `base` path match.

## Next step

The folder already exists. Give Claude `docs/AI_IMPLEMENTATION_PROMPT.md`; read `docs/DECISIONS.md` first. Use the six existing references only for mood and color, not as pixel-perfect targets. Confirm unresolved Stamina, duration and funnel requirements. Test on a real smartphone and coordinate the integration contract with the landing-page team.
