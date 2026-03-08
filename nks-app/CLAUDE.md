## Project: Nobody's Keeping Score (NKS)
A personal PWA for tracking card game scores. Cozy, nostalgic tone.
Tagline: *Not that anyone's counting*

## Tech Stack
- Angular 21 — standalone components, signals, OnPush everywhere
- Tailwind CSS v4 — CSS-first @theme config in styles.css (no tailwind.config.js)
- Firebase Firestore — real-time database
- Firebase Authentication — Google Sign-In only (no anonymous access in v1)
- PWA — installable, offline-capable

## Colour Tokens (always use these, never raw hex)
- `felt-*`  — primary green (buttons, nav, scores)
- `cream-*` — warm backgrounds and surfaces
- `ruby-*`  — accents, alerts, ♥ ♦ suits
- `ink-*`   — dark neutral, text, dark mode
- `gold-*`  — winners, highlights, trophies
- Fonts: Fraunces (display headings) + DM Sans (body)

## Firestore Structure
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
        ├── currentRound: number        1-based across all game types
        ├── config                      null for 5 Crowns / Canasta / Dirty Clubs
        │                               open: { winDirection: 'high'|'low', gameName: string }
        └── rounds/{roundId}            shape varies by gameType (see below)

### Round document shapes

**5 Crowns** — roundNumber (1–11), roundIndex (0–10), scores: { [playerId]: number }
**Canasta** — roundNumber, scores: { [playerId]: { base, score, newTotal } }
**Dirty Clubs** — handNumber, moonWin: boolean, scores: { [playerId]: { outcome, tricksValue, scoreDelta, newScore, bumpsAdded, newBumpCount } }
**Open Scorer** — roundNumber, scores: { [playerId]: number }

## Permission Model (v1 — Host Only)
- Host (Google Auth UID, present in `authorisedUsers`): full control — view scores, enter any player's score, start/end games, add/remove players
- All other access is blocked — Firestore rules enforce allowlist
- No viewer role, no claimed player slots, no room codes in v1

## Authentication & Authorisation
- Auth provider: Google Sign-In via Firebase Auth
- Authorisation: Firestore `authorisedUsers` collection — one document per approved UID
- Unauthorised users: signed out immediately → routed to `/unauthorized`
- Adding hosts: manual — create `authorisedUsers/{uid}` doc in Firebase Console (fields: email, displayName, addedAt)
- Removing hosts: delete the document from Firebase Console
- No admin code, no room codes, no in-app user management in v1

## Key Conventions
- Always use inject() not constructor injection
- Always use input() and output() functions not decorators
- Always use native control flow: @if @for @switch — never *ngIf *ngFor
- Always use [class] bindings — never ngClass
- Always use [style] bindings — never ngStyle
- Signals for all local state, computed() for derived state
- Lazy load all feature routes
- OnPush change detection on every component

## Repository
- Repo root: nobody-keeps-score/ (one level above nks-app/)
- Branching: main + feature branches, PRs required to merge to main
- Branch naming: feature/screen-name (e.g. feature/home-screen)


## Reference Documents

Always consult the relevant spec and mockup before building any component.

### Project
- `docs/nks-project-brief.md` — architecture, data model, colour tokens, Firebase setup, branch strategy
- `docs/nks-setup-guide.md` — local development setup and Firebase configuration
- `docs/angular-best-practices.md` — Angular conventions and patterns for this project

### Game Specs
- `docs/nks-dirty-clubs-spec.md` — Dirty Clubs scoring rules, UI, component notes
- `docs/nks-canasta-spec.md` — Canasta scoring rules, UI, component notes
- `docs/nks-5crowns-spec.md` — 5 Crowns scoring rules, UI, component notes
- `docs/nks-open-scorer-spec.md` — Open Scorer config, UI, component notes
- `docs/nks-game-setup-spec.md` - Game Setup config, UI, component notes
- `docs/nks-home-spec.md` - Home Screen, Unuathorized config, UI, component notes

### Design Mockups
- `design/nks-home-mockup-v3.html` — home screen · visual language reference · colour tokens in use
- `design/nks-palette.html` — full colour palette
- `design/nks-5crowns-mockup.html` - scoring list and score entry screens for 5 Crowns
- `design/nks-canasta-mockup.html` - scoring list and score entry screens for Canasta
- `design/nks-dirty-clubs-mockup.html` - scoring list and score entry screens for Dirty Clubs
- `design/nks-game-setup-mockup.html` - game setup screens
- `design/nks-open-scorer-mockup.html` - scoring list and score entry screens for Open Scorer
