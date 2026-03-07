# Nobody's Keeping Score — Project Brief
*Not that anyone's counting*

---

## Change Log

| Date | Change |
|---|---|
| 2026-03-07 | Initial brief created |

---

## 1. Project Overview

**Nobody's Keeping Score (NKS)** is a personal PWA for tracking scores across card games played with friends and family. The tone is nostalgic, cozy, and tongue-in-cheek.

| | |
|---|---|
| **Full name** | Nobody's Keeping Score |
| **Abbreviation** | NKS |
| **Tagline** | *Not that anyone's counting* |
| **Type** | Progressive Web App (installable, offline-capable) |
| **Audience** | Personal use — friends and family card nights |

### Supported game types
- Rummy (with specific scoring rules)
- Whist (with specific scoring rules)
- Open generic scorer (any game)

---

## 2. Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Angular 21 | Standalone components, signals, modern patterns |
| Styling | Tailwind CSS v4 | CSS-first `@theme` config — no `tailwind.config.js` |
| Database | Firestore | Real-time shared scoring at the table |
| Dev database | Firestore Emulator | Safe rule testing; ephemeral; never touches live data |
| Authentication | Anonymous only | No login friction; host + player roles via UID |
| Room joining | 4-digit numeric code | Simple, fast to share verbally |
| Host access | Admin code (hashed) | Subtle link on home screen; SHA-256 hash in env |
| Admin code storage | SHA-256 hash only | Plaintext never in bundle; Web Crypto API at runtime |
| Admin persistence | 30-day localStorage expiry | Silently restored on return; lapses quietly |
| Multiple hosts | Yes — anyone with admin code | No single-host restriction |
| Score entry | Host or claimed player | Host always can; players opt-in by claiming slot |
| Session scope | Full night under one code | Multiple games, one session, one code |
| Session history | Archive completed sessions | Active = live, archived = past nights |
| Theme | Light + Dark, switchable | Respects OS preference, remembers user choice |
| Code quality | ESLint + Prettier + Husky | Flat config; format on save; pre-commit hooks |
| GitHub repo visibility | Public | Open source; `environment.ts` git ignored |
| Branch protection | Yes — PRs required | Nothing merges to main without a PR |
| Branching strategy | main + feature branches | One branch per feature; main always stable |

---

## 3. Colour Palette

All tokens are defined in `nks-app/src/styles.css` inside the Tailwind `@theme` block. Always use tokens — never raw hex values.

### Felt Green — primary
The dominant colour. Nav, buttons, scores, active states.

| Token | Usage |
|---|---|
| `felt-50` | Lightest tint — hover backgrounds |
| `felt-100` | Light surfaces |
| `felt-300` | Borders, dividers |
| `felt-600` | Primary buttons, active nav |
| `felt-800` | Dark pressed states |
| `felt-900` | Darkest — dark mode surfaces |

### Card Cream — warm backgrounds
Surfaces, cards, input backgrounds.

| Token | Usage |
|---|---|
| `cream-50` | Page background (light mode) |
| `cream-100` | Card surfaces |
| `cream-200` | Input backgrounds |
| `cream-400` | Muted text on cream |

### Royal Ruby — accents
Alerts, ♥ ♦ suits, destructive actions, warnings.

| Token | Usage |
|---|---|
| `ruby-400` | Suit icons, highlights |
| `ruby-600` | Alerts, destructive buttons |
| `ruby-800` | Dark accent |

### Ink — dark neutral
Text, dark mode backgrounds, cool shadows.

| Token | Usage |
|---|---|
| `ink-400` | Secondary text |
| `ink-600` | Body text |
| `ink-800` | Headings |
| `ink-950` | Dark mode background |

### Gold — winners
Trophy icons, leaderboard highlights, winning states.

| Token | Usage |
|---|---|
| `gold-400` | Trophy icons |
| `gold-500` | Winner highlights |
| `gold-700` | Dark gold text |

### Typography
- **Display / headings:** Fraunces (Google Fonts)
- **Body / UI:** DM Sans (Google Fonts)

---

## 4. Firebase Setup — Console vs CLI

### Must be done in the Firebase Console (website)

| Task | Where |
|---|---|
| Create the Firebase project | [console.firebase.google.com](https://console.firebase.google.com) |
| Register web app — gets you `firebaseConfig` | Console → Project Settings |
| Enable Firestore and choose region | Console → Build → Firestore |
| Enable Anonymous Authentication | Console → Build → Authentication |

### Handled by the CLI from that point on

| Task | Command |
|---|---|
| Link local project to Firebase | `firebase init emulators` |
| Run local dev database | `firebase emulators:start` |
| Deploy security rules to production | `firebase deploy --only firestore:rules` |
| Check which project is active | `firebase projects:list` |
| Switch between projects | `firebase use --add` |

### Recommended setup order

```
1. Console  → Create project
2. Console  → Register web app → copy firebaseConfig → paste into environment.ts
3. Console  → Enable Firestore (pick region)
4. Console  → Enable Anonymous Auth
5. Terminal → firebase init emulators
6. Terminal → firebase emulators:start  (all dev work from here on)
7. Terminal → firebase deploy --only firestore:rules  (when ready for production)
```

> **Region tip for Toronto:** choose `northamerica-northeast1` (Montreal) or `us-east1` (South Carolina). You cannot change the region after creation.

---

## 5. Firestore Data Structure

```
sessions/{roomCode}
  ├── hostId: string               anonymous UID of the host
  ├── createdAt: timestamp
  ├── status: 'active' | 'archived'
  ├── players/{playerId}
  │     ├── name: string
  │     └── claimedBy: string | null   UID of player who claimed this slot
  └── games/{gameId}
        ├── gameType: 'rummy' | 'whist' | 'open'
        ├── status: 'active' | 'complete'
        ├── startedAt: timestamp
        └── rounds/{roundId}
              ├── roundNumber: number
              └── scores: { [playerId]: number }
```

---

## 6. Permission Model

| Action | Host | Claimed Player | Viewer |
|---|---|---|---|
| View all scores | ✅ | ✅ | ✅ |
| Enter any player's score | ✅ | ❌ | ❌ |
| Enter own score | ✅ | ✅ | ❌ |
| Start new game | ✅ | ❌ | ❌ |
| Archive session | ✅ | ❌ | ❌ |
| Claim a player slot | n/a | ✅ done | ✅ |

---

## 7. App Screens

| Screen | Route | Access |
|---|---|---|
| Home | `/` | Everyone — create (admin) or join (anyone) |
| Lobby | `/session/:code` | Everyone — player list + claim slots |
| Game Setup | `/session/:code/setup` | Host only — pick game type |
| Scoreboard | `/session/:code/game/:id` | Everyone — live scores + round entry |
| Archive | `/archive` | Everyone — past completed sessions |

---

## 8. Angular Project Structure

```
nobody-keeps-score/               ← git repo root
  ├── nks-app/                    ← Angular project
  │   ├── src/
  │   │   ├── app/
  │   │   │   ├── core/
  │   │   │   │   ├── models/     session, player, game, round
  │   │   │   │   └── services/   auth, session, theme, admin
  │   │   │   ├── features/
  │   │   │   │   ├── home/
  │   │   │   │   ├── lobby/
  │   │   │   │   ├── game-setup/
  │   │   │   │   ├── scoreboard/
  │   │   │   │   │   ├── games/       rummy | whist | open
  │   │   │   │   │   └── components/  score-entry | leaderboard
  │   │   │   │   └── archive/
  │   │   │   └── shared/         room-code-display | theme-toggle
  │   │   ├── environments/
  │   │   │   ├── environment.template.ts   ← committed — safe placeholder
  │   │   │   ├── environment.ts            ← git ignored — real keys + hash
  │   │   │   └── environment.prod.ts       ← git ignored — real keys + hash
  │   │   ├── styles.css          ← Tailwind @theme palette lives here
  │   │   └── index.html          ← Google Fonts (Fraunces + DM Sans)
  │   ├── CLAUDE.md               ← Claude Code project memory
  │   ├── .github/
  │   │   └── copilot-instructions.md  ← VS Code AI + Copilot Angular rules
  │   ├── firebase.json           ← emulator ports + UI config
  │   ├── .firebaserc             ← Firebase project ID
  │   ├── .husky/                 ← pre-commit + pre-push hooks
  │   ├── .vscode/                ← format on save + ESLint + MCP settings
  │   └── src/manifest.webmanifest  ← PWA config
  ├── docs/
  │   ├── nks-project-brief.md         ← this file
  │   ├── nks-setup-guide.md           ← step-by-step build guide
  │   └── angular-best-practices.md    ← Angular's official LLM prompt file
  ├── design/
  │   └── card-game-palette.html       ← interactive colour explorer
  └── README.md                        ← top-level GitHub readme
```

---

## 9. Quick Setup Command Reference

```bash
# ── Create folder structure ───────────────────────────
cd ~/Development
mkdir nobody-keeps-score && cd nobody-keeps-score
mkdir docs design

# ── Check / install Git ───────────────────────────────
git --version || brew install git

# ── Check / install GitHub CLI ────────────────────────
gh --version || brew install gh
# After first install: gh auth login

# ── Check / install Angular CLI ──────────────────────
ng version || npm install -g @angular/cli@latest

# ── Create Angular project ────────────────────────────
# --skip-git prevents a nested .git inside nks-app/
# --ai-config=claude generates CLAUDE.md automatically
ng new nks-app --routing=true --style=css --ssr=false --ai-config=claude --skip-git
cd nks-app

# ── Tailwind CSS v4 ───────────────────────────────────
ng add tailwindcss

# ── PWA ───────────────────────────────────────────────
ng add @angular/pwa

# ── Firebase SDK ──────────────────────────────────────
npm install firebase @angular/fire

# ── Firebase CLI (check before installing) ────────────
firebase --version || npm install -g firebase-tools
firebase login
firebase init emulators

# ── ESLint ────────────────────────────────────────────
ng add @angular-eslint/schematics

# ── Prettier + Husky ──────────────────────────────────
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier pretty-quick
npx husky-init && npm install

# ── VS Code Copilot instructions ──────────────────────
mkdir -p .github
curl -o .github/copilot-instructions.md https://angular.dev/assets/context/guidelines.md

# ── Angular best-practices reference ─────────────────
curl -o ../docs/angular-best-practices.md https://angular.dev/assets/context/best-practices.md

# ── GitHub repo ───────────────────────────────────────
cd ..   # back to nobody-keeps-score/
git init
echo "# Nobody's Keeping Score\n*Not that anyone's counting*" > README.md
git add .
git status   # verify environment.ts is NOT listed
git commit -m "chore: initial project setup"
gh repo create nobody-keeps-score --public --source=. --remote=origin --push

# ── Branch protection ─────────────────────────────────
gh api repos/{owner}/nobody-keeps-score/branches/main/protection \
  --method PUT \
  --field required_status_checks=null \
  --field enforce_admins=false \
  --field "required_pull_request_reviews[required_approving_review_count]=0" \
  --field "required_pull_request_reviews[dismiss_stale_reviews]=false" \
  --field restrictions=null

# ── Start dev environment (two terminals) ─────────────
cd nks-app
firebase emulators:start     # terminal 1
ng serve                     # terminal 2
```

---

## 10. Admin Access

### Two-code system

| Code | Purpose | Stored as |
|---|---|---|
| 4-digit room code | Join a session | Plaintext in Firestore |
| Admin code | Create a session (host) | SHA-256 hash in `environment.ts` only |

### How it works
- Admin code is hashed once in the browser console using Web Crypto API
- The hash is stored in `environment.ts` (git ignored) — plaintext never enters the bundle
- On entry, the typed code is hashed at runtime and compared to the stored hash
- On match, unlocked state is written to localStorage with a 30-day expiry timestamp
- On return visits within 30 days, admin access is silently restored
- The entry point is a subtle "Host access" link below the join field — not prominent enough to invite curiosity

### Generating the hash (one-time setup)
```javascript
// Run once in browser console — store the output in environment.ts as adminCode
const encoder = new TextEncoder();
const data = encoder.encode('your-chosen-passphrase');
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
console.log(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''));
```

> **Security note:** This is social-layer protection, not cryptographic security. For a personal game night PWA the realistic threat model is effectively zero — this simply keeps casual visitors out of the host flow.

---

## 11. GitHub Repository & Workflow

| Setting | Value |
|---|---|
| Repo name | `nobody-keeps-score` |
| Visibility | Public |
| Default branch | `main` |
| Branch protection | PRs required to merge to main |
| Branching strategy | main + feature branches |

### Day-to-day feature branch workflow

```bash
git checkout -b feature/home-screen   # start work
git add . && git commit -m "feat: ..."  # Husky runs here
git push -u origin feature/home-screen
gh pr create --title "feat: home screen" --base main
gh pr merge --squash --delete-branch
git checkout main && git pull
```

### Planned feature branches

| Branch | Purpose |
|---|---|
| `feature/home-screen` | Create night + join by room code |
| `feature/lobby` | Player list + claim flow |
| `feature/game-setup` | Game type picker |
| `feature/scoreboard-core` | Shared scoreboard shell + leaderboard |
| `feature/scoring-rummy` | Rummy-specific score entry rules |
| `feature/scoring-whist` | Whist-specific score entry rules |
| `feature/scoring-open` | Generic open round scorer |
| `feature/archive` | Past sessions view |
| `feature/theme-toggle` | Light/dark switch component |
| `feature/admin-service` | Admin code + host access |
| `feature/pwa-icons` | App icons + manifest polish |

---

## 12. AI Context Files & Claude Code Setup

| File | Location | Purpose |
|---|---|---|
| `CLAUDE.md` | `nks-app/` | Claude Code project memory — auto-loaded every session |
| `copilot-instructions.md` | `nks-app/.github/` | VS Code AI + GitHub Copilot Angular rules |
| `angular-best-practices.md` | `docs/` | Angular's official LLM prompt file |

### CLAUDE.md
Generated automatically by `--ai-config=claude` on `ng new`, then extended with NKS-specific context. Contains colour tokens, Firestore structure, permission model, admin access pattern, and all coding conventions.

### Angular CLI MCP Server
Add to `nks-app/.vscode/settings.json` to enable Claude Code ↔ Angular CLI integration:

```json
{
  "mcp": {
    "servers": {
      "angular": {
        "type": "stdio",
        "command": "npx",
        "args": ["@angular/cli", "mcp"]
      }
    }
  }
}
```

> See [angular.dev/ai/mcp](https://angular.dev/ai/mcp) for the latest MCP setup instructions — this feature is experimental in Angular 21.

---

*Nobody's Keeping Score · Not that anyone's counting*
