# Nobody's Keeping Score — Project Brief
*Not that anyone's counting*

---

## Change Log

| Date | Version | Change |
|---|---|---|
| 2026-03-07 | 1.0 | Initial brief created |
| 2026-03-08 | 2.0 | Pivot to host-only v1 · Google Auth replaces anonymous + admin code · Firestore allowlist · room code and lobby deferred · games list updated · screens list updated · data structure updated |
| 2026-03-08 | 2.1 | Firestore data structure expanded to reflect all four game specs · per-game round document shapes defined · game config shape defined · currentRound standardised to 1-based across all game types |

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

### Supported game types (v1)
- Dirty Clubs
- Canasta
- 5 Crowns
- Open Scoring (generic — any game)

> **Deferred to future releases:** Rummy (original), Whist

---

## 2. v1 Scope — Host Only

Version 1 is intentionally scoped to a **single host** managing the entire game night. There are no viewers, no room codes, and no lobby. This simplifies the POC significantly and allows the core scoring experience to be built and validated first.

| Feature | v1 | Future |
|---|---|---|
| Host manages game night | ✅ | ✅ |
| Google Auth for host | ✅ | ✅ |
| Room code / lobby | ❌ | ✅ |
| Player claiming (join flow) | ❌ | ✅ |
| Viewer access | ❌ | ✅ |
| Archive UI | ❌ | ✅ |
| Session history on Home | ❌ | ✅ |

---

## 3. Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Angular 21 | Standalone components, signals, modern patterns |
| Styling | Tailwind CSS v4 | CSS-first `@theme` config — no `tailwind.config.js` |
| Database | Firestore | Real-time shared scoring; future multiplayer foundation |
| Dev database | Firestore Emulator | Safe rule testing; ephemeral; never touches live data |
| Authentication | Google Sign-In (Firebase Auth) | Single known host; no anonymous access in v1 |
| Authorisation | Firestore allowlist (`authorisedUsers` collection) | Host UIDs added manually in Firebase Console; no in-app user management needed |
| User management | Manual via Firebase Console | Single host setup; no self-registration |
| Admin code / hashed passphrase | ❌ Removed | Replaced by Google Auth + allowlist |
| Room code | ❌ Deferred | Not needed for host-only v1 |
| Lobby / player claiming | ❌ Deferred | Not needed for host-only v1 |
| Score entry | Host only (v1) | No claimed player slots in v1 |
| Session scope | Full night under one game session | Multiple games within one session |
| Session history | Stored in Firestore; no UI in v1 | Archive screen deferred |
| Theme | Light + Dark, switchable | Respects OS preference; remembers user choice |
| Code quality | ESLint + Prettier + Husky | Flat config; format on save; pre-commit hooks |
| GitHub repo visibility | Public | Open source; `environment.ts` git ignored |
| Branch protection | Yes — PRs required | Nothing merges to main without a PR |
| Branching strategy | main + feature branches | One branch per feature; main always stable |

---

## 4. Colour Palette

All tokens defined in `nks-app/src/styles.css` inside the Tailwind `@theme` block. Always use tokens — never raw hex values.

### Felt Green — primary
The dominant colour. Nav, buttons, scores, active states.

| Token | Usage |
|---|---|
| `felt-50` | Lightest tint — hover backgrounds |
| `felt-100` | Light surfaces |
| `felt-300` | Borders, dividers |
| `felt-600` | Primary buttons, active nav, app bar (light) |
| `felt-800` | Dark pressed states |
| `felt-900` | Darkest — dark mode surfaces |

### Card Cream — warm backgrounds
Surfaces, cards, input backgrounds.

| Token | Usage |
|---|---|
| `cream-50` | Page background (light mode) |
| `cream-100` | Card surfaces, app bar text |
| `cream-200` | Input backgrounds, borders |
| `cream-400` | Muted text on cream |

### Royal Ruby — accents
Alerts, ♥ ♦ suits, destructive actions, warnings, unauthorised state glow.

| Token | Usage |
|---|---|
| `ruby-400` | Suit icons, highlights |
| `ruby-600` | Alerts, destructive buttons |
| `ruby-800` | Unauthorised screen background glow |

### Ink — dark neutral
Text, dark mode backgrounds, cool shadows.

| Token | Usage |
|---|---|
| `ink-400` | Secondary text |
| `ink-600` | Body text |
| `ink-800` | Headings |
| `ink-950` | Dark mode background |

### Gold — winners
Trophy icons, leaderboard highlights, winning states, host avatar.

| Token | Usage |
|---|---|
| `gold-400` | Trophy icons, host avatar (dark) |
| `gold-500` | Winner highlights |
| `gold-700` | Dark gold text, host avatar (light) |

### Typography
- **Display / headings:** Fraunces (Google Fonts)
- **Body / UI:** DM Sans (Google Fonts)

---

## 5. Firebase Setup — Console vs CLI

### Must be done in the Firebase Console (website)

| Task | Where |
|---|---|
| Create the Firebase project | [console.firebase.google.com](https://console.firebase.google.com) |
| Register web app — gets you `firebaseConfig` | Console → Project Settings |
| Enable Firestore and choose region | Console → Build → Firestore |
| Enable Google Authentication | Console → Build → Authentication → Sign-in method |
| Add authorised host(s) to `authorisedUsers` collection | Console → Firestore → `authorisedUsers/{uid}` |

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
4. Console  → Enable Google Authentication
5. Console  → Sign in once with your Google account to get your UID
             (Firebase Console → Auth → Users tab will show it after first sign-in)
6. Console  → Firestore → Create authorisedUsers/{your-uid} document
             Fields: email, displayName, addedAt
7. Terminal → firebase init emulators
8. Terminal → firebase emulators:start  (all dev work from here on)
9. Terminal → firebase deploy --only firestore:rules  (when ready for production)
```

> **Region tip for Toronto:** choose `northamerica-northeast1` (Montreal) or `us-east1` (South Carolina). You cannot change the region after creation.

---

## 6. Firestore Data Structure

```
authorisedUsers/{uid}
  ├── email: string
  ├── displayName: string
  └── addedAt: timestamp

sessions/{sessionId}
  ├── hostId: string                   Firebase Auth UID of the host
  ├── createdAt: timestamp
  ├── status: 'active' | 'archived'
  ├── players/{playerId}
  │     └── name: string               Host-entered name (no claiming in v1)
  └── games/{gameId}
        ├── gameType: 'dirty-clubs' | 'canasta' | '5-crowns' | 'open'
        ├── status: 'active' | 'complete'
        ├── startedAt: timestamp
        ├── currentRound: number        1-based across all game types · always means "current round/hand number"
        │                               Components convert to 0-based index when needed (e.g. ROUNDS[currentRound - 1] in 5 Crowns)
        ├── config                      Shape varies by gameType — see below · null/omitted for 5 Crowns, Canasta, Dirty Clubs
        └── rounds/{roundId}
              └── (shape varies by gameType — see below)
```

> **Note:** The `players/{playerId}/claimedBy` field from v1 planning is removed — no player claiming in v1. Player names are entered by the host at game setup.

### Game configs (`games/{gameId}/config`)

```
// 5 Crowns — all round structure is static (baked into ROUNDS[] constant)
config: null

// Canasta — no game-level config required
config: null

// Dirty Clubs — no game-level config required
config: null

// Open Scorer
config: {
  winDirection: 'high' | 'low'
  gameName: string                 // displayed in app bar · defaults to 'Open Game' if blank
}
```

### Round document shapes (`games/{gameId}/rounds/{roundId}`)

**5 Crowns**
```
roundId (auto)
  ├── roundNumber: number            1-based (1–11)
  ├── roundIndex: number             0-based (0–10) · index into ROUNDS[] constant for label/cards/wild
  └── scores: { [playerId]: number } round score entered by player (≥ 0; negative permitted as edge case)
```

> `roundIndex` is stored alongside `roundNumber` for convenient `ROUNDS[]` lookups without requiring components to subtract 1 at every call site. `getRoundDef()` uses `roundIndex` directly.

**Canasta**
```
roundId (auto)
  ├── roundNumber: number            1-based · no upper limit
  └── scores: {
        [playerId]: {
          base: number               ≥ 0 · default 0
          score: number              may be negative
          newTotal: number           prev + base + score · stored for fast scoreboard reads
        }
      }
```

> `newTotal` is stored (not purely derived) so the scoreboard renders without walking the full round history on every load. Still re-derivable from round history as a consistency check.

**Dirty Clubs**
```
roundId (auto)
  ├── handNumber: number             1-based · increments each hand
  ├── moonWin: boolean               true if Shoot the Moon succeeded this hand
  └── scores: {
        [playerId]: {
          outcome: 'dnp' | 'tricks' | 'bump' | 'double_bump' | 'moon'
          tricksValue: number | null  tricks taken · null unless outcome === 'tricks'
          scoreDelta: number          change applied this hand (may be negative · floor 0 applied)
          newScore: number            running score total after this hand
          bumpsAdded: number          0, 1, or 2
          newBumpCount: number        running bump total after this hand
        }
      }
```

> `newScore` and `newBumpCount` are stored for fast scoreboard reads. Re-deriving them requires replaying the floor logic at each step — storing is safer and avoids that complexity on every read.

**Open Scorer**
```
roundId (auto)
  ├── roundNumber: number            1-based · no upper limit
  └── scores: { [playerId]: number } turn score entered (positive or negative)
```

---

## 7. Permission Model (v1 — Host Only)

| Action | Host |
|---|---|
| View all scores | ✅ |
| Enter any player's score | ✅ |
| Start new game | ✅ |
| End session | ✅ |
| Add/remove players | ✅ |

All other access is blocked. Firestore security rules enforce that only authenticated, allowlisted UIDs can read or write session data.

---

## 8. Authentication & Authorisation Model

| Concern | Approach |
|---|---|
| Auth provider | Google Sign-In via Firebase Auth |
| Authorisation | Firestore `authorisedUsers` collection — document per approved UID |
| Unauthorised users | Signed out immediately; routed to `/unauthorized` |
| Adding new hosts | Manual — add document to `authorisedUsers` in Firebase Console |
| Removing access | Delete document from `authorisedUsers` in Firebase Console |
| Session persistence | Firebase Auth handles token refresh automatically |

---

## 9. App Screens (v1)

| Screen | Route | Access |
|---|---|---|
| Home — unauthenticated | `/` | Everyone — shows app description + Google sign-in |
| Home — authenticated | `/` | Authorised host — shows Start Game Night CTA |
| Unauthorised | `/unauthorized` | Redirected here after failed allowlist check |
| Game Setup | `/game-setup` | Host only — pick game type + enter player names |
| Scoreboard | `/game/:id` | Host only — live scores + round entry |

**Deferred to future releases:**

| Screen | Route | Notes |
|---|---|---|
| Lobby | `/session/:code` | Requires room code + player claiming |
| Archive | `/archive` | Session history UI |

---

## 10. Angular Project Structure

```
nobody-keeps-score/               ← git repo root
  ├── nks-app/                    ← Angular project
  │   ├── src/
  │   │   ├── app/
  │   │   │   ├── core/
  │   │   │   │   ├── models/     session, player, game, round
  │   │   │   │   ├── services/   auth, session, theme
  │   │   │   │   └── guards/     auth.guard.ts
  │   │   │   ├── features/
  │   │   │   │   ├── home/
  │   │   │   │   ├── unauthorised/
  │   │   │   │   ├── game-setup/
  │   │   │   │   └── scoreboard/
  │   │   │   │       ├── games/       dirty-clubs | canasta | 5-crowns | open
  │   │   │   │       └── components/  score-entry | leaderboard
  │   │   │   └── shared/         theme-toggle
  │   │   ├── environments/
  │   │   │   ├── environment.template.ts   ← committed — safe placeholder
  │   │   │   ├── environment.ts            ← git ignored — real Firebase config
  │   │   │   └── environment.prod.ts       ← git ignored — real Firebase config
  │   │   ├── styles.css          ← Tailwind @theme palette lives here
  │   │   └── index.html          ← Google Fonts (Fraunces + DM Sans)
  │   ├── CLAUDE.md               ← Claude Code project memory
  │   ├── .github/
  │   │   └── copilot-instructions.md
  │   ├── firebase.json
  │   ├── .firebaserc
  │   ├── .husky/
  │   ├── .vscode/
  │   └── src/manifest.webmanifest
  ├── docs/
  │   ├── nks-project-brief.md
  │   ├── nks-home-spec.md
  │   ├── nks-dirty-clubs-spec.md
  │   └── angular-best-practices.md
  ├── design/
  │   ├── nks-home-mockup-v3.html
  │   └── card-game-palette.html
  └── README.md
```

---

## 11. Quick Setup Command Reference

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
cd ..
git init
echo "# Nobody's Keeping Score\n*Not that anyone's counting*" > README.md
git add .
git status   # verify environment.ts is NOT listed
git commit -m "chore: initial project setup"
gh repo create nobody-keeps-score --public --source=. --remote=origin --push

# ── Start dev environment (two terminals) ─────────────
cd nks-app
firebase emulators:start     # terminal 1
ng serve                     # terminal 2
```

---

## 12. GitHub Repository & Workflow

| Setting | Value |
|---|---|
| Repo name | `nobody-keeps-score` |
| Visibility | Public |
| Default branch | `main` |
| Branch protection | PRs required to merge to main |
| Branching strategy | main + feature branches |

### Planned feature branches (v1)

| Branch | Purpose |
|---|---|
| `feature/home-screen` | Unauthenticated + authenticated Home + /unauthorized |
| `feature/auth-service` | Google Sign-In + Firestore allowlist check + AuthGuard |
| `feature/game-setup` | Game type picker + player name entry |
| `feature/scoreboard-core` | Shared scoreboard shell |
| `feature/scoring-dirty-clubs` | Dirty Clubs scoring rules + entry UI |
| `feature/scoring-canasta` | Canasta scoring rules + entry UI |
| `feature/scoring-5-crowns` | 5 Crowns scoring rules + entry UI |
| `feature/scoring-open` | Generic open round scorer |
| `feature/theme-toggle` | Light/dark switch component |
| `feature/pwa-icons` | App icons + manifest polish |

---

## 13. AI Context Files & Claude Code Setup

| File | Location | Purpose |
|---|---|---|
| `CLAUDE.md` | `nks-app/` | Claude Code project memory — auto-loaded every session |
| `copilot-instructions.md` | `nks-app/.github/` | VS Code AI + GitHub Copilot Angular rules |
| `angular-best-practices.md` | `docs/` | Angular's official LLM prompt file |

### Angular CLI MCP Server

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

---

*Nobody's Keeping Score · Not that anyone's counting*
