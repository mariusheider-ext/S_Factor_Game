# Windows / GitHub setup — two GitHub accounts

Current status, 27 October 2026: repository already exists as mariusheider-ext/S_Factor_Game on main. Only use mariusheider-ext, never the personal GitHub account. Initial extraction, git init and repo creation instructions below are historical setup guidance; do not repeat them for this existing checkout.

Target folder:

```text
C:\Users\heide\Documents\Sadhanapada 2026\Karma Sadhana\S_Factor_Game
```

**Do not create or push a remote repo until the owner, repo visibility, and publishing approval are confirmed.** The separate **work** GitHub account is preferred for an official Isha campaign; if the organization requires ownership in its GitHub org, prefer that over a personal work account.

## Step 1: Copy the preparation package

Extract `S_Factor_Game` from the provided ZIP into `C:\Users\heide\Documents\Sadhanapada 2026\Karma Sadhana\`.

The root must contain `README.md`, `docs\` and `references\` directly, not a nested `S_Factor_Game\S_Factor_Game\`.

## Step 2: Inspect prerequisites in PowerShell

```powershell
cd 'C:\Users\heide\Documents\Sadhanapada 2026\Karma Sadhana\S_Factor_Game'
git --version
gh --version
node --version
npm --version
```

Install missing tools only from approved official installers and after confirming organizational policies. `gh` is the GitHub CLI.

## Step 3: Select the correct GitHub identity

```powershell
gh auth status
```

If the work identity is already authenticated but inactive:

```powershell
gh auth switch --hostname github.com --user <WORK_GITHUB_USERNAME>
gh auth status
```

If work identity is not authenticated, first do:

```powershell
gh auth login
```

Choose GitHub.com and your work identity. Then re-run `gh auth status`.

**Warning:** `gh auth` selection is not the same as the author stored in Git commits. Check both.

## Step 4: Initialize local repository and set local author only

```powershell
git init -b main
git config --local user.name "<WORK_COMMIT_DISPLAY_NAME>"
git config --local user.email "<WORK_COMMIT_EMAIL>"
git config --local user.name
git config --local user.email
git status
```

This changes only this repository's author settings. Make sure the email is permitted by the work account / organization; using GitHub's no-reply address may be appropriate.

Do not put tokens or passwords in project files. Do not copy `.env` containing secrets to Git.

## Step 5: Create a remote repo (only after approval)

Commit the prep package:

```powershell
git add .
git commit -m "docs: prepare S-Factor game design and technical requirements"
```

After approval for a work-owned repository, use an explicit OWNER in the create command:

```powershell
gh repo create <WORK_GITHUB_USERNAME_OR_ORG>/S_Factor_Game --private --source . --remote origin --push
```

`gh repo create` may need authorization for organization membership. If you are blocked, have the authorized owner create the repo and add you as a collaborator.

Verify immediately:

```powershell
git remote -v
gh repo view <WORK_GITHUB_USERNAME_OR_ORG>/S_Factor_Game --json name,owner,visibility,url
```

If the wrong owner appears, **do not push again** until corrected. For HTTPS push credentials, `gh auth setup-git` can configure Git to use the appropriate GitHub CLI authentication; confirm the identity first.

## Step 6: Let coding agent scaffold app (next step)

Give it `docs/AI_IMPLEMENTATION_PROMPT.md` plus all references. It must work inside the existing folder and preserve your docs. Do not create a second nested project folder.

## Step 7: GitHub Pages when the app builds

- The coding agent must implement `npm run build` (Vite) and produce `dist/`.
- If URL is `https://<WORK_GITHUB_USERNAME>.github.io/S_Factor_Game/`, set Vite `base: '/S_Factor_Game/'` (or an equivalent correct mode-aware configuration).
- Configure **Settings → Pages → Source: GitHub Actions**, then include a deployment workflow for `dist/` on main commits.
- After successful workflow, Pages URL typically follows `https://<OWNER>.github.io/S_Factor_Game/`.

**Privacy warning:** Under GitHub Free, Pages typically requires a **public repository**. Even when a paid account supports Pages from a private repository, the published Pages website is typically public. If the team requires private demo access, choose an approved private preview host instead; do not publish internal work just to obtain a URL.

## Why not host now?

This ZIP contains documentation/folders only; no game HTML or build output yet. Pages would have nothing useful to publish. Set up repository locally now, then deploy once the demo exists.
