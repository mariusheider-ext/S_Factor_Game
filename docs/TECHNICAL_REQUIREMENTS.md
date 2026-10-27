# S-Factor — Technical Requirements (draft v0.1)

Date: 26 Oct 2026 · Status: **Demo planning; integration subject to landing-page-team agreement**

## 1. Technology choice

**Recommended:** Phaser 3 or current compatible stable Phaser release, TypeScript, Vite, HTML5/CSS. Choose versions supported by the initial official scaffold; avoid adding unnecessary frameworks.

Rationale: all challenges are simple 2D games and will run inside or alongside an existing browser-based landing page. Prefer zero-install, fast load, mobile support, straightforward event interfaces. No backend is needed to demonstrate gameplay.

**Fallback:** Godot web export remains viable if integration constraints or developer workflow favor it; do not commit to a second engine without asking.

## 2. Implementation principles

- Target modern Android Chrome and iPhone Safari first; desktop mouse/keyboard fallback for internal review.
- Portrait UI, scalable for 360px–430px widths and wider screens; use device pixel ratio correctly. Support landscape gracefully without relying on screen-orientation locks.
- Use actual touch/pointer events; prevent accidental page scroll *inside the game area* but do not indiscriminately block scrolling on the landing page.
- Avoid permission prompts: no camera, microphone, motion sensors or geolocation in the initial demo.
- No user authentication, tracking cookie or PII in the demo.
- Respect reduced-motion settings, sufficient contrast and visible feedback independent of audio.
- Do not use copyrighted third-party art, notification sounds, logos or music unless appropriately licensed or authorized. Use original assets/placeholder vectors for prototype.
- Keep gameplay modules separated from UI, analytics, score normalization and landing-page integration.

## 3. Pages / scenes (same single browser app)

`Home → Sharpness → Stability → Stamina → Stillness → ResultCard`

Each challenge should expose a small common scene contract, e.g. `start`, `complete`, `cancel` plus score summary with `factor`, `rawMetrics`, `score`, `durationMs`. A central flow manager owns transitions and current progress.

The ResultCard must render even when the system has no analytics endpoint or external landing page.

## 4. External landing-page integration (proposal)

Default integration: host game under its own path/URL and embed using a responsive `<iframe>` on the landing page. Confirm that the landing-page team permits embedding and any Content Security Policy/frame restrictions.

Use an explicit, versioned `window.postMessage` contract. The landing-page team should agree to event names and allowed origins **before production**.

Suggested outgoing messages (from child game to parent):

```json
{"source":"s-factor-game","version":1,"type":"GAME_READY"}
{"source":"s-factor-game","version":1,"type":"GAME_COMPLETE","payload":{"scores":{"sharpness":75,"stability":68,"stamina":82,"stillness":90}}}
{"source":"s-factor-game","version":1,"type":"CONTINUE_TO_FORM"}
```

- For the standalone demo, no `postMessage` consumer is needed; a local result/CTA works.
- In production, restrict `targetOrigin` to the known landing-page origin. Parents must validate incoming `event.origin` and message schema; do **not** use a permissive wildcard for sensitive messaging.
- Consider a parent-controlled CTA/lead form after completion. Do not send phone numbers, email addresses or names via URL query parameters, analytics events or publicly visible logs.
- Domain, iframe height, route, exact form behavior and ownership **OPEN** until meeting.

## 5. Basic analytics contract

Analytics are important to diagnose gameplay drop-offs and campaign conversion. For the demo implement **one local typed function / adapter** (e.g. `track(event, properties)`) and `console.debug` or a no-op adapter; production provider will be selected with the landing-page team.

Suggested events:

- `landing_view` (owned by landing page)
- `game_view`, `game_start`
- `challenge_view`, `challenge_start`, `challenge_first_interaction`, `challenge_complete`
- `challenge_exit` only when the app observes an explicit exit/navigation; background/unload is not reliable evidence of an exit
- `game_complete`
- `result_view`, `replay_click`, `share_click`
- `form_view`, `form_submit_success` (**owned by landing page**, should not be emitted speculatively by the game)

For challenge events: `factor`, `attempt`, `elapsed_ms`, `result` and where appropriate non-sensitive raw gameplay counts. Never treat a started challenge as an interaction. Do not assert precise reasons for abandonment; infer drop-off from funnels in aggregated sessions, not from guessed motives.

Analytics consent, vendor selection, retention, pseudonymous session ID, cookie use and responsibility for campaign data require team/legal review before production. Do not include personally identifying information in events.

## 6. Scores and runtime state

- Keep the four independent challenge results in memory; optionally `sessionStorage` for recovery in a single browser tab only after testing / approval. No persistent user identity needed for demo.
- Use deterministic, pure score-conversion functions with a documented range 0–100; do not store personally identifying data.
- When the game reloads, it may safely restart at Home for the first demo.

## 7. Repo, building and deployment

Suggested repository name: `S_Factor_Game` under an **authorized work GitHub account or organization**. Private repository until explicit approval of public exposure. The deployed demo URL is separate from repository access.

Use a standard Vite project so these npm commands are supported after scaffold:

```powershell
npm install
npm run dev
npm run build
npm run preview
```

GitHub Pages via GitHub Actions is viable after build. On a project URL such as `https://<owner>.github.io/S_Factor_Game/`, set Vite base to `/S_Factor_Game/`. If using a custom domain, relative base rules differ. For automated publishing configure `Settings → Pages → Source: GitHub Actions` and a workflow that builds `dist/` on pushes to `main`.

**IMPORTANT:** This preparation package contains no running application, `package.json`, or ready-to-run Pages workflow. The AI developer should generate those at scaffold time and only enable the workflow after a successful local `npm run build`. Avoid a failing empty deployment now.

For a GitHub Free account, GitHub Pages on a repo generally requires a public repository; supported private-repo Pages plans still often publish a publicly accessible site. Confirm Isha's publication approval and relevant plan before enabling it. GitHub Pages is static hosting, not a secure lead/contact database.

## 8. Repo/account safety

Git author name/email **do not select GitHub authentication identity**. Prior to any `gh repo create` or push:

1. `gh auth status`
2. Switch to the approved work GitHub user using `gh auth switch --hostname github.com --user <WORK_USERNAME>` if required.
3. Verify local repo commit identity using `git config --local user.name` and `git config --local user.email`.
4. Verify remote points to **work** owner, e.g. `git remote -v`.
5. If credential manager may use a different GitHub login, explicitly authenticate with `gh auth setup-git` or an approved SSH key configuration, then test remote access. Never assume commit email alone is sufficient.
6. Before push, review `git status`, `.gitignore`, and absence of secrets/private assets.

Use `docs/GITHUB_SETUP_WINDOWS.md` for exact steps.

## 9. Integration hand-off / deliverables

- Link to working standalone browser demo, mobile tested.
- Git repository link and branch name.
- Exact game iframe embed instructions / integration API with example messages.
- List of event names for analytics and required landing-page events.
- Clear statement of what is demo-only versus production.

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Landing-page tech/CSP incompatible with iframe | Confirm early; offer standalone link or inline integration |
| Build works on desktop but not iOS Safari | Test on real iPhone early; CSS viewport/safe-area and pointer events |
| Interface not playable in public setting | No required camera, pose, sound, workout or sensor permission |
| Unclear physical exercise approval | Treat originals as optional separate activation pending Isha team sign-off |
| Game scores mistaken for psychological evaluation | Explicit 'game challenge' framing |
| Contact form/consent not aligned | Keep out of demo; landing-page team owns until specified |
| Wrong GitHub account or inadvertent publication | Check account, remote, repository visibility and permissions prior to push/deploy |
