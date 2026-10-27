# S-Factor — Current decisions and context audit

## Project language

All project documentation, player-facing UI copy, code comments and implementation handoff prompts for Claude must be in English. Conversation with the user may remain in German. This also applies to short Claude prompts supplied in chat.


Updated 27 October 2026 after the user's review of reference set v1.

## Authority and working arrangement

This file overrides conflicting older prose or image content. Read before the other specifications. Separate confirmed user directions, provisional defaults and open team decisions.
The Work chat maintains documents, prompts and reference guidance; Claude implements the application using work access. No game implementation is requested in this Work chat now.
Repository: mariusheider-ext/S_Factor_Game, main; use only mariusheider-ext, never the personal GitHub account. Do not recreate the repo. No push or deployment is implied.

## Confirmed user directions

- A simpler playable demo is sufficient: complete mechanics and real scores before detailed scenery.
- One shared minimal challenge header: current factor, compact 1/4 progress and timer. No other-factor tabs, icon rows, decorative score meters or inter-challenge navigation during rounds.
- One consistent icon per factor wherever needed.
- Remove "Play anywhere. No camera needed." from Home. No-camera/no-workout remains a technical requirement.
- Remove unconfirmed Home duration promises. Neither two minutes total nor two minutes per challenge is currently approved.
- Actual session scores even in the demo; never copy sample image values. Remove "Sample scores", prominent "Demo preview" and "Game challenge scores — not an assessment" from the result card. Internally retain the rule against scientific assessment claims. Optional small help text may explain scores reflect this playthrough.
- Distractions must attract attention without randomly hiding a Sharpness target or intercepting a grid tap.
- Stillness needs a simple water surface, not elaborate lamps, flowers or scenery.

## Provisional visual defaults

Reversible choices, not approved branding: Sharpness = four-point sparkle/star; Stability = leaf; Stamina = lightning bolt; Stillness = lotus. Define one SVG set centrally; reuse on Home and Result. Active rounds can omit icons.
Retain navy/ivory with amber/mint/blue/aqua. Flat fills, subtle gradients, simple avatar/runner silhouettes and procedural ripples suffice. Six v1 PNGs are mood references, not layout/copy/asset requirements. Do not build the app from flattened screenshots.

## Duration discrepancy

Original GDD proposed 30/25/25/25 seconds = 105 seconds plus transitions, hence about two minutes TOTAL. It did not mean two minutes per challenge.
The supplied reconstruction confirms 60s Stillness in early ideation (reported PDF p7); the later water slide has no duration. This establishes historical provenance, not a final timing decision.
Initial build may retain 30/25/25/25 as configurable provisional defaults, with no Home duration claim. A developer configuration can test Stillness at 60 seconds; no extra player settings needed. Record configured durations with results. Final duration awaits review; see RECOVERED_CONTEXT.md.

## Stamina: current baseline vs alternative

Current baseline is visual rhythm: a beat invites a tap; on-time taps sustain running pace and streak; early/late taps do not improve score. This represents sustained pacing, not physical endurance. Runner feedback must respond to input.
Energy management was discussed in the earlier chat and renewed in the user's latest alternative: faster tapping raises speed but drains energy; slower pacing recovers energy; cover a target distance within a deadline. This gives a clearer resource-management metaphor but needs extra tuning/tutorial/scoring. It has NOT been selected. Pure fastest tapping was also discussed, not selected.
Until selection, Claude may build the existing rhythm module and report it as provisional. Do not silently combine rhythm, sprinting, energy depletion and racing.
New tuning proposal, not recovered historical requirement: 1 beat/second, +/-200ms window, one credited tap per beat; extra taps count separately. Suggested score: clamp(round(100 * max(0, hits - 0.5 * extraTaps) / scheduledBeats), 0, 100). Record misses and best streak. Test and adjust.

## Fair but noticeable distractions

Sharpness: reserve a fixed lane above the grid from the start. Never overlay tiles, target cue, timer or controls or shift layout. Use a short slide inside the lane, restrained coral/red accent, unread badge and conversational text; no flashing. Reduced motion uses static appearance.
New placeholder examples, NOT recovered quotes or real contacts: "Alex: Are you joining us?", "Study group: 3 new messages".
Briefly explain before relevant play that messages are simulated. A small in-game marker suffices; avoid a huge repeated IN-GAME DISTRACTION label. Use familiar message styling, never real OS permission prompts/contact access/external chat navigation.
A message tap may expand within its reserved lane, while the timer keeps running, then collapse automatically or via close. The cost is attention/time. Track distraction_tap separately from incorrect grid taps to avoid double penalties. Never require dismissal to continue.
Stillness reuses the component in a separate message area. During the active round, reacting to a message or touching water is a disturbance with recoverable ripples. Pause/exit/sound controls are exempt. No real messages are sent or opened. Playtest effectiveness.
User recalls familiar notification audio, but no particular approved sound asset is present. Temporary implementation: original short notification-like chime, after a user gesture with an explicit sound toggle; muted play fully works. A particular service sound remains an unresolved asset request.

## Result CTA and funnel

Known objective: engage college graduates and lead toward Sadhanapada information/contact flow. Separate team owns the landing page; its draft reportedly exists.
Recovered later team ideation: games -> contact opt-in to unlock results -> WhatsApp result and Adiyogi invitation -> reply YES for details. Earlier ideation placed a lead quiz/form before the game. Result-first voluntary registration was an assistant counterproposal. Final selected order, URL, required fields, consent and ownership remain open. See RECOVERED_CONTEXT.md.
Temporary demo: "Continue" opens a local handoff panel: "The proposed campaign follow-up is an Adiyogi invitation via WhatsApp after opt-in. This step is not connected in this demo." Provide return action. No invented URL, actual contact collection or fake submission success. Final label/destination follow confirmed campaign requirements.
Separate game_complete from continuation intent. With an approved integration, CONTINUE_TO_FORM goes to the known parent origin. Only actual form visibility/submission can emit form_view/form_submit_success.

## Context audit

The user supplied the old-chat reconstruction on 27 October; it has been read and reconciled in RECOVERED_CONTEXT.md. No need to request the same summary again. Historical source claims are attributed, not treated as fresh approvals.
A local team PowerPoint now exists in docs/Documents from team/; presence verified, contents not independently checked in this reconciliation. Original PDF, actual landing-page designs and approved audio assets have not been located here.
Recovered: historical gated-result funnel, 60s Stillness source, energy alternatives, notification wording and campaign invitation goal.
Still open: selected production flow, CTA URL/event details, form/consent owner and fields, Stamina mechanic, final timing/interruption rules, branding, audio rights/assets and integration.
Claude has already been commissioned. Preserve current simple demo scope and code; this documentation update does not restart implementation.

## Team contact's landing-page samples — 27 October

Read LANDING_PAGE_REFERENCE_REVIEW.md for the supplied Claude artifact. Thirty-one artboard entries were inspected as references, including hero and post-result variants; no final selection or integration contract is established. Earlier statements that no landing-page samples have been seen are superseded. The sender is the user's team contact; exact approval authority is unconfirmed. Do not restart Claude or change mechanics, timing, score scale, gating or palette automatically.

## Direct source review and dark-theme preference — 27 October

Keep the current dark near-black/navy theme. Light landing-page samples do not authorize a recolor. Purple/violet and vivid accents are optional future inspiration, not a requested palette change. This records personal preference, not a universal eye-health claim.

TEAM_SOURCE_REVIEW.md now verifies the four-slide deck and the local 11-page PDF. The old reconstruction cited 24 pages; its later variants are not all established by this local file. Stillness 60s is directly present on local PDF page 6; deck slide 4 has no duration. Deck numbering supports the current challenge order. Keep current demo scope; no restart.
