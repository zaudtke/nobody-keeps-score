## Project: Nobody's Keeping Score (NKS)
A personal PWA for tracking card game scores. Cozy, nostalgic tone.
Tagline: *Not that anyone's counting*

## Tech Stack
- Angular 21 — standalone components, signals, OnPush everywhere
- Tailwind CSS v4 — CSS-first @theme config in styles.css (no tailwind.config.js)
- Firebase Firestore — real-time database
- Firebase Anonymous Authentication
- PWA — installable, offline-capable

## Colour Tokens (always use these, never raw hex)
- `felt-*`  — primary green (buttons, nav, scores)
- `cream-*` — warm backgrounds and surfaces
- `ruby-*`  — accents, alerts, ♥ ♦ suits
- `ink-*`   — dark neutral, text, dark mode
- `gold-*`  — winners, highlights, trophies
- Fonts: Fraunces (display headings) + DM Sans (body)

## Firestore Structure
sessions/{roomCode}
  players/{playerId}  — name, claimedBy
  games/{gameId}      — gameType, status, startedAt
    rounds/{roundId}  — roundNumber, scores: {[playerId]: number}

## Permission Model
- Host (anonymous UID that created session): full control
- Claimed player (UID matched to a slot): can enter own scores only
- Viewer: read-only

## Admin Access
- Two-code system: 4-digit room code (join) + admin code (create)
- Admin code stored as SHA-256 hash in environment.ts only — never plaintext
- Unlocked state in localStorage with 30-day expiry
- Entry point: subtle "Host access" link on home screen

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
