# S-Factor — Game Design Document (draft v0.1)

Updated 27 Oct 2026 · Status: **Proposed demo design, pending Isha / campaign team confirmation**

Read `DECISIONS.md` first. It records current user feedback, provisional choices and recovered original-chat context; it overrides older assumptions.

## 1. Purpose and audience

The campaign aims to create curiosity about Sadhanapada among recent college graduates, approximately ages 19–23, many of whom have not heard of the program. Position Sadhanapada as an opportunity for personal development and building capabilities; avoid implying that this game measures spirituality or clinical attributes. The primary campaign conversion goal is voluntary contact-detail submission via the landing page, not leaderboard placement.

Player scenario: arrives from a mobile ad while at home, in public, on transport, or on a break. The **entire essential playthrough must work while seated, with one hand, without camera permission, standing up, sound, physical space or installing an app**.

Tone: energetic, contemporary, playful, respectful. Strong first impression and immediate feedback. Avoid shaming poor scores or deceptive claims.

## 2. Original slide concepts vs. demo alternatives

| Factor | Team's supplied four-slide concept | Proposed accessible demo implementation |
|---|---|---|
| Sharpness | 30s symbol search with fake alerts, target accuracy 8/10 illustration | Dynamic tile-search, unlimited targets within 30s, score from correct taps and errors |
| Stability | Self-paced Vrikshasana hold, player times/records own attempt | Touch-controlled balancing character; no camera, no physical pose |
| Stamina | Choose running / squats / pushups; record and share a clip | Short rhythm-based Pace Runner played entirely on-screen |
| Stillness | Do not touch while water ripples settle and four notifications appear | Keep water undisturbed; visible calm progression and gentle recovery on accidental touch |

**Important:** Stability and Stamina digital alternatives are design recommendations, not already approved replacements. Maintain the original concept descriptions for the stakeholder discussion. Physical challenges could be offered as **optional post-game activities** rather than prerequisites for completing the main funnel.

See RECOVERED_CONTEXT.md for earlier variants, 60s Stillness, notification-driven balance forces, energy management and lead-gated results. They are not automatic demo requirements.

## 3. Gameplay loop (provisional demo, not approved production funnel)

1. Intro/hero screen: *“Think you've got the S-Factor?”* with “4 challenges” Start immediately; no login.
2. 01 Sharpness (interactive, high energy) → factor result/short transition.
3. 02 Stability (interactive, controlled movement) → factor result/short transition.
4. 03 Stamina (interactive, consistency) → factor result/short transition.
5. 04 Stillness (quiet, non-reactive) → factor result.
6. Result Card: four playful challenge scores, a share/retry option, and a clear next step toward learning about Sadhanapada.
7. For **initial demo only**, “Continue” opens the local handoff panel defined in DECISIONS.md. Final CTA destination, form/result order and team ownership remain unverified. Do not invent a URL or collect contacts.

Timing is open after user review. The earlier 30/25/25/25-second proposal meant about two minutes TOTAL, not per challenge. Keep these only as configurable provisional defaults; review a 60-second Stillness option. Do not promise a duration on Home. Include **Skip intro**, **Replay** after finishing, and clear touch instructions before each challenge.

## 4. Challenge 1 — Sharpness: Focus Under Fire

**Fantasy:** Find the target under increasing visual distraction.

- Portrait-friendly 4×4 grid, with large, accessible tap targets and one highlighted target symbol above it.
- Populate grid with at least two distractor shapes/colors; ensure target is always present and distinguishable without color vision.
- Each valid target tap earns a point; replace/reposition targets and decoys so the player cannot memorize a static pattern. Avoid any unwinnable state.
- Use the noticeable but fair distraction component in DECISIONS.md: fixed lane outside the grid, conversational previews, unread badge, restrained coral accent and optional original chime. Never obscure valid targets, shift the grid or require dismissal. No flashing.
- Incorrect tile taps record an error; message taps are tracked separately. Explain simulated messages briefly before play, with a small consistent marker during play rather than a large repeated disclaimer.
- Timer: 30 seconds. **No limit of 10 correct taps.** The illustrated “8/10” in the source is not a necessary score cap.
- Result: correct hits, false taps, and derived Sharpness challenge score (0–100). Display a short friendly phrase, without claiming to measure real cognitive ability.
- Demo rule: score = min(100, round(100 × correct / max(1, correct + 2 × incorrect + 6))) is a **placeholder only**; it must be tuneable after playtesting.

## 5. Challenge 2 — Stability: Stay Balanced (proposed digital alternative)

**Fantasy:** Maintain a character's balance while external forces intervene.

- Simple stylized 2D figure standing in a balanced pose; do not require the real player to perform yoga.
- Left/right press-and-hold touch controls provide gentle corrective force against changing push forces. Support simultaneous release and avoid excessive tapping.
- On-screen meter indicates balance/lean and a broad green-safe zone, not a precise real-world posture assessment.
- Challenge length: ~25 seconds; if the character falls, pause briefly, restore balance, allow continuation to avoid blocking the funnel.
- Result: percentage of time inside a reasonable balance zone / falls; map to game-only Stability score (0–100).
- A tree-pose-inspired avatar would require team confirmation for branding and correct representation. An abstract figure is an acceptable fallback.
- **No camera, pose recognition, gyro permission or user-submitted performance rating in demo.**

## 6. Challenge 3 — Stamina: Pace Runner (proposed digital alternative)

**Fantasy:** Maintain a comfortable, steady pace under increasing demands.

**Open decision:** This existing rhythm baseline measures timing/consistency, not physical endurance. User raised an energy-management runner with a distance/time objective; it is NOT selected. See DECISIONS.md for comparison and provisional tuning. Keep Stamina modular and do not silently blend mechanics.

- A minimal character auto-runs across a simple lane/landscape. One large on-screen TAP area; each beat invites a tap at the visual cue.
- Player builds a consistency streak by tapping near beat windows. Tapping too quickly or randomly must not be optimal; missing a beat lowers the streak but does not block progress.
- Rhythm window should be generous for touch latency; initial prototype may use fixed beat timings (no adaptive soundtrack required).
- ~25 seconds; increase rhythm complexity slightly, not endlessly.
- Result: percentage of accurately timed beats and longest streak; normalized Stamina *game-challenge* score.
- Must work with muted audio; visible cues required. Avoid encouraging dangerous or breath-holding behavior.
- If runner graphics are too costly, use an abstract visual beat cue with the same rhythm logic. Do not call it Keep the Energy: that historical alternative is a distinct resource-management concept.

## 7. Challenge 4 — Stillness: Don't Disturb the Water

**Fantasy:** Allow water to settle while tempting distractions appear.

- A pond with concentric ripple animation settles visibly over ~25 seconds.
- Four or more simulated conversational notifications appear over the duration, using the shared distraction component in DECISIONS.md. Familiar styling and optional original chime are intended to tempt interaction; no real OS permission alert.
- Player need not tap; opening the level begins via a clear Start action; after that, the instruction is “Leave the water undisturbed.”
- Touching water or reacting to an in-game message creates new ripples and lowers calm progress; pause/exit/sound controls are exempt. It does not instantly end the challenge. A small setback is more approachable than restarting all four challenges.
- A change to a hidden/background tab should pause or flag the round; be conservative and do not claim to detect looking away from the phone.
- Complete after the fixed time; score based on time undisturbed and number of interventions. Do not pretend this objectively measures ability to meditate.
- This challenge serves as a calmer finale after the active games.

## 8. Scoring / result card

Recovered later team ideation placed contact opt-in BEFORE results, then a WhatsApp Adiyogi invitation. Result-first is the current demo/counterproposal. Story export, humorous lowest-score line, QR/shortlink and friend challenges are historical ideas in RECOVERED_CONTEXT.md, not newly mandatory demo features.

- Keep separate raw metrics for each game and derive **four scores from 0–100** using named, adjustable functions. During the prototype the algorithms can be simple; tune them after testing.
- Display four factor names and real session scores. Use concise 'Your S-Factor' copy; omit sample/demo labels and the prominent assessment disclaimer from image v1. Avoid scientific claims; optional help can explain scores reflect this playthrough.
- Result card portrait composition targeted to social story dimensions (1080×1920 exported PNG) when feasible; for the demo an onscreen card using actual session metrics is required.
- Allow replay and a clear action for the user to continue to the landing-page form / learn more. The initial demo must **not** impersonate a live registration form.
- Optional: share using Web Share API where supported and PNG download fallback. Do not require WhatsApp installed.
- **No live leaderboard** in demo. That feature requires persistent storage, moderation/anti-cheat design, and explicit approval.

## 9. Art direction and UX

- Visually coherent across all levels. Direction: modern, clean, dark/navy backdrop, warm accent for Sharpness, teal/green for Stability, electric blue for Stamina, blue-green for Stillness.
- Make all buttons readable in sunlight, one-thumb-friendly, with responsive touch targets and no reliance on hover.
- One shared minimal header: current factor, `01 / 04` and timer. No other-factor tabs/rows/meters during active play. Simple backgrounds and lightweight vector/procedural graphics; see DECISIONS.md for fixed provisional icons.
- Motion and sound are optional decoration. Respect reduced-motion preference; all mechanics must remain understandable without sound.
- Six existing v1 visual mood references (not binding layout or copy): `00_home`, `01_sharpness`, `02_stability`, `03_stamina`, `04_stillness`, `05_result_card` in `references/`.

## 10. Open decisions for the meeting

1. Are digital replacements for the physical Stability and Stamina challenges acceptable?
2. Should camera-based Vrikshasana or workout/video sharing become optional follow-up activations instead?
3. Which part of the landing-page flow owns the contact form, consent and WhatsApp follow-up?
4. What are the intended durations per challenge and total, especially Stillness around 60 seconds? Is Stamina rhythm or energy management?
5. Who supplies approved Sadhanapada visual branding, copy and legal/privacy notices?
6. Is the eventual result shown before the form, or only after contact submission? Test alternatives rather than assuming one is superior.

## 11. Non-goals for the first demo

- Real pose estimation, genuine yoga instruction, real-video recording/sharing.
- Persistent player accounts, leaderboard, server-side verified scores.
- Actual lead collection, WhatsApp automation, production analytics account setup.
- Scientifically validated assessments of focus/stability/stamina/stillness.
