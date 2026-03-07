# Nobody's Keeping Score — Project Setup Guide
*Angular 21 · Tailwind CSS v4 · Firebase Firestore · PWA*

---

## Prerequisites

Check the following are installed before proceeding. If a command returns a version number, you're good — skip the install step.

```bash
# Node.js — 20.x or higher required
node --version
# If missing: https://nodejs.org or via nvm / Homebrew (brew install node)

# npm — 10.x or higher
npm --version
# Comes bundled with Node — no separate install needed

# Angular CLI
ng version
# If missing:
npm install -g @angular/cli@latest

# Git
git --version
# If missing: https://git-scm.com or brew install git

# GitHub CLI
gh --version
# If missing: brew install gh  (macOS)
# or: https://cli.github.com for other platforms
# After install: gh auth login
```

---

## Before You Start — Folder Structure

The git repo root is `nobody-keeps-score/`, not `nks-app/`. This lets `docs/`, `design/`, and a top-level `README.md` live alongside the Angular app inside the same repo.

```
~/Development/
  └── nobody-keeps-score/     ← git repo root, trust this in Claude Code
        ├── nks-app/          ← Angular project (created by ng new)
        ├── docs/             ← setup guide + project brief
        ├── design/           ← colour palette, mockups
        └── README.md         ← top-level GitHub readme
```

Create this structure before running any other commands:

```bash
cd ~/Development
mkdir nobody-keeps-score
cd nobody-keeps-score
mkdir docs design
# Drop your nks-setup-guide.md and nks-project-brief.docx into docs/ now
```

All subsequent steps assume you are inside `nobody-keeps-score/` unless stated otherwise.

---

## Step 1 — Create the Angular Project

```bash
# Verify Angular CLI is available and check version
ng version

# If not installed:
# npm install -g @angular/cli@latest

# Run from nobody-keeps-score/ — ng new creates the nks-app/ subfolder
# --ai-config=claude automatically generates CLAUDE.md in the right place
ng new nks-app \
  --routing=true \
  --style=css \
  --ssr=false \
  --ai-config=claude \
  --skip-git

cd nks-app
```

When prompted:
- ✅ Add Angular routing: **Yes**
- ✅ Stylesheet format: **CSS**
- ✅ SSR: **No** (PWA doesn't need it)

---

## Step 2 — Add Tailwind CSS v4

The Angular CLI handles everything for you with a single command:

```bash
ng add tailwindcss
```

This automatically installs `tailwindcss` and its peer dependencies (`@tailwindcss/postcss`, `postcss`), creates the `.postcssrc.json` config file, and adds the `@import "tailwindcss"` statement to your `styles.css`. No Vite config or manual PostCSS setup required.

> ℹ️ If you ever need to do it manually (e.g. in a monorepo or CI environment), the correct approach is `npm install tailwindcss @tailwindcss/postcss postcss` and a `.postcssrc.json` file — **not** the Vite plugin approach used in Tailwind's standalone docs.

Now replace the entire contents of **`src/styles.css`** with your NKS theme:
```css
@import "tailwindcss";

@theme {
  /* ── Felt Green (Primary) ─────────────────── */
  --color-felt-50:  #f0faf3;
  --color-felt-100: #d9f2e1;
  --color-felt-200: #b3e5c5;
  --color-felt-300: #7dd0a0;
  --color-felt-400: #48b87a;
  --color-felt-500: #279e5e;
  --color-felt-600: #1a7f4b;
  --color-felt-700: #16643c;
  --color-felt-800: #144f30;
  --color-felt-900: #103f26;
  --color-felt-950: #082518;

  /* ── Card Cream (Surface / Warm Neutral) ─── */
  --color-cream-50:  #fdfcf8;
  --color-cream-100: #f8f4ec;
  --color-cream-200: #f0e8d4;
  --color-cream-300: #e4d5b4;
  --color-cream-400: #d4ba8a;
  --color-cream-500: #c09a62;
  --color-cream-600: #a67d48;
  --color-cream-700: #896337;
  --color-cream-800: #6e4e2d;
  --color-cream-900: #573d24;
  --color-cream-950: #311f10;

  /* ── Royal Ruby (Accent / Alerts) ────────── */
  --color-ruby-50:  #fff1f2;
  --color-ruby-100: #ffe0e2;
  --color-ruby-200: #ffc7ca;
  --color-ruby-300: #ffa0a5;
  --color-ruby-400: #ff6470;
  --color-ruby-500: #f83b48;
  --color-ruby-600: #e51d2b;
  --color-ruby-700: #c01422;
  --color-ruby-800: #9f1420;
  --color-ruby-900: #84151f;
  --color-ruby-950: #48060c;

  /* ── Ink (Cool Dark Neutral) ─────────────── */
  --color-ink-50:  #f6f6f7;
  --color-ink-100: #e2e3e6;
  --color-ink-200: #c5c7ce;
  --color-ink-300: #9fa3af;
  --color-ink-400: #797f8e;
  --color-ink-500: #5e6474;
  --color-ink-600: #4c515f;
  --color-ink-700: #3e4250;
  --color-ink-800: #353843;
  --color-ink-900: #22242d;
  --color-ink-950: #14151c;

  /* ── Gold (Winner / Trophy / Highlight) ──── */
  --color-gold-50:  #fefce8;
  --color-gold-100: #fef9c3;
  --color-gold-200: #fef08a;
  --color-gold-300: #fde047;
  --color-gold-400: #facc15;
  --color-gold-500: #eab308;
  --color-gold-600: #ca8a04;
  --color-gold-700: #a16207;
  --color-gold-800: #854d0e;
  --color-gold-900: #713f12;
  --color-gold-950: #3f2006;

  /* ── Typography ───────────────────────────── */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body:    'DM Sans', sans-serif;
}

/* Dark mode variant */
@variant dark (&:where(.dark, .dark *));

/* Base styles */
body {
  font-family: var(--font-body);
  @apply bg-cream-50 text-ink-900;
}

.dark body {
  @apply bg-ink-950 text-cream-100;
}
```

---

## Step 3 — Add Google Fonts

In **`src/index.html`**, add inside `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
```

---

## Step 4 — Add PWA Support

```bash
ng add @angular/pwa
```

This auto-generates `manifest.webmanifest` and `ngsw-config.json`. Then update **`src/manifest.webmanifest`**:

```json
{
  "name": "Nobody's Keeping Score",
  "short_name": "NKS",
  "description": "Not that anyone's counting",
  "theme_color": "#1a7f4b",
  "background_color": "#f8f4ec",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "orientation": "portrait",
  "icons": [
    {
      "src": "assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

---

## Step 5 — Set Up Firebase

### ⚠️ Before you start — Console vs CLI

Firebase setup is split across two tools. Knowing which to use when will save confusion:

**Firebase Console (website) — one-time project setup:**
The following tasks can only be done in the browser. Do these once before writing any code:

| Task | Where |
|---|---|
| Create the Firebase project | Console |
| Register your web app (gets you `firebaseConfig`) | Console |
| Enable Firestore and choose region | Console |
| Enable Anonymous Authentication | Console |

**Firebase CLI (terminal) — everything from here on:**
Once the project exists, the CLI handles all day-to-day work:

| Task | Command |
|---|---|
| Link your local project to Firebase | `firebase init emulators` |
| Run local dev database | `firebase emulators:start` |
| Deploy security rules to live Firestore | `firebase deploy --only firestore:rules` |
| Check which project is active | `firebase projects:list` |
| Switch between projects (dev/prod) | `firebase use --add` |

**The practical order for NKS:**
```
1. Console  → Create project
2. Console  → Register web app → copy firebaseConfig → paste into environment.ts
3. Console  → Enable Firestore (pick region)
4. Console  → Enable Anonymous Auth
5. Terminal → firebase init emulators  (links CLI to your new project)
6. Terminal → firebase emulators:start (all dev work from here on)
7. Terminal → firebase deploy --only firestore:rules (when ready for production)
```

After the initial Console setup (~10 minutes) you should rarely need to return to the website during development.

> 📍 **Region tip for Toronto:** Choose `northamerica-northeast1` (Montreal) for the closest Canadian option, or `us-east1` (South Carolina) for the nearest US region. **You cannot change the region after creation** — pick deliberately.

---

### 5a — Create your Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `nks-app`
3. Disable Google Analytics (not needed)
4. Once created, click **Web** (`</>`) to add a web app
5. Register app as `nks-app`
6. Copy the `firebaseConfig` object — you'll need it shortly

### 5b — Enable Firestore

1. In Firebase Console → **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll lock it down with rules later)
4. Pick your region — `northamerica-northeast1` (Montreal) recommended for Toronto

### 5c — Enable Anonymous Authentication

1. In Firebase Console → **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in providers** → enable **Anonymous**

### 5d — Install Firebase SDK

```bash
npm install firebase @angular/fire
```

---

## Step 5e — Set Up Firestore Emulator

The emulator lets you develop and test security rules safely without touching live data. It resets cleanly between runs and includes a browser UI for inspecting data and testing rules.

### Install Firebase CLI

```bash
# Check if already installed (via npm, Homebrew, or any other method)
firebase --version

# If missing — choose ONE of:
npm install -g firebase-tools   # via npm
# brew install firebase-cli     # via Homebrew (if you prefer)

firebase login
```

### Initialise emulators in your project

```bash
firebase init emulators
```

When prompted:
- ✅ Select **Firestore** and **Authentication** emulators
- ✅ Accept default ports: **8080** (Firestore), **9099** (Auth)
- ✅ Enable the Emulator UI: **Yes** (runs at `http://localhost:4000`)
- ✅ Download emulators now: **Yes**

This creates `firebase.json` and `.firebaserc` in your project root.

### Add `firebase.json` entries to `.gitignore`

`.firebaserc` contains your project ID which is fine to commit. But add the emulator data export folder to `.gitignore` to avoid committing local test data:

```
# Firebase emulator data
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log
```

### Start the emulators

```bash
firebase emulators:start
```

Visit `http://localhost:4000` to open the Emulator UI — you can browse Firestore documents, inspect Auth users, and use the **Rules Playground** to simulate reads/writes as different anonymous UIDs to verify your permission model.

> ℹ️ The emulator is **ephemeral by default** — all data is wiped when you stop it. To persist data between runs use `firebase emulators:start --export-on-exit=./emulator-data` and `--import=./emulator-data`.

### Create environment files

> ⚠️ **Important:** `environment.ts` contains sensitive values (Firebase keys and the admin code hash) and **must be git ignored**. Commit only the template file below so the shape is documented without exposing real values.

Add to **`.gitignore`**:
```
src/environments/environment.ts
src/environments/environment.prod.ts
```

Commit this safe placeholder as **`src/environments/environment.template.ts`**:
```typescript
export const environment = {
  production: false,
  adminCode: 'REPLACE_WITH_SHA256_HASH_OF_YOUR_ADMIN_CODE',
  firebase: {
    apiKey: 'REPLACE_ME',
    authDomain: 'REPLACE_ME',
    projectId: 'REPLACE_ME',
    storageBucket: 'REPLACE_ME',
    messagingSenderId: 'REPLACE_ME',
    appId: 'REPLACE_ME'
  }
};
```

Your real **`src/environments/environment.ts`** (git ignored, never committed):
```typescript
export const environment = {
  production: false,
  adminCode: 'YOUR_SHA256_HASH_HERE',  // see note below on generating this
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

**`src/environments/environment.prod.ts`** (git ignored):
```typescript
export const environment = {
  production: true,
  adminCode: 'YOUR_SHA256_HASH_HERE',  // same hash as dev
  firebase: {
    // same values — or use a separate prod Firebase project
  }
};
```

#### Generating your admin code hash

Pick a memorable passphrase (e.g. `feltgreen2025` or an inside joke). Run this once in your browser console or Node to get the SHA-256 hash to put in `environment.ts`:

```javascript
// Paste into browser console to generate your hash
const code = 'your-chosen-admin-code';
const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
console.log(Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
```

Copy the output — that string goes into `adminCode` in your environment files. Store your actual passphrase somewhere safe (password manager, etc.) — it is never written to any file.

### Wire up Angular Fire in `app.config.ts`

**`src/app/app.config.ts`**:
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (!environment.production) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    }),
    provideAuth(() => {
      const auth = getAuth();
      if (!environment.production) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
  ]
};
```

> ℹ️ The `!environment.production` guard means your production build always points at live Firestore — the emulator connection is development-only and can never leak into prod.

---

## Step 7 — Core Services Scaffold

### Anonymous Auth Service
**`src/app/core/services/auth.service.ts`**:
```typescript
import { Injectable, inject } from '@angular/core';
import { Auth, signInAnonymously, user } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  readonly currentUser$ = user(this.auth);

  signInAnonymously() {
    return from(signInAnonymously(this.auth));
  }

  get uid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}
```

### Session Service
**`src/app/core/services/session.service.ts`**:
```typescript
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc, collection,
  setDoc, getDoc, updateDoc,
  collectionData, docData
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Session } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  /** Generate a random 4-digit room code */
  generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /** Create a new night session */
  async createSession(playerNames: string[]): Promise<string> {
    const code = this.generateCode();
    const hostId = this.auth.uid!;

    const sessionRef = doc(this.firestore, `sessions/${code}`);
    await setDoc(sessionRef, {
      hostId,
      createdAt: new Date(),
      status: 'active'
    });

    // Add players
    for (const name of playerNames) {
      const playerRef = doc(collection(this.firestore, `sessions/${code}/players`));
      await setDoc(playerRef, { name, claimedBy: null });
    }

    return code;
  }

  /** Join an existing session by code */
  async joinSession(code: string): Promise<boolean> {
    const sessionRef = doc(this.firestore, `sessions/${code}`);
    const snap = await getDoc(sessionRef);
    return snap.exists();
  }

  /** Live session stream */
  getSession$(code: string) {
    return docData(
      doc(this.firestore, `sessions/${code}`),
      { idField: 'id' }
    ) as Observable<Session>;
  }

  /** Claim a player slot */
  async claimPlayer(code: string, playerId: string): Promise<void> {
    const uid = this.auth.uid!;
    const playerRef = doc(this.firestore, `sessions/${code}/players/${playerId}`);
    await updateDoc(playerRef, { claimedBy: uid });
  }

  /** Archive a completed session */
  async archiveSession(code: string): Promise<void> {
    const sessionRef = doc(this.firestore, `sessions/${code}`);
    await updateDoc(sessionRef, { status: 'archived' });
  }
}
```

---

## Step 8 — Data Models

**`src/app/core/models/session.model.ts`**:
```typescript
export interface Session {
  id: string;
  hostId: string;
  createdAt: Date;
  status: 'active' | 'archived';
}
```

**`src/app/core/models/player.model.ts`**:
```typescript
export interface Player {
  id: string;
  name: string;
  claimedBy: string | null;  // anonymous UID or null
}
```

**`src/app/core/models/game.model.ts`**:
```typescript
export type GameType = 'rummy' | 'whist' | 'open';

export interface Game {
  id: string;
  gameType: GameType;
  status: 'active' | 'complete';
  startedAt: Date;
}
```

**`src/app/core/models/round.model.ts`**:
```typescript
export interface Round {
  id: string;
  roundNumber: number;
  scores: Record<string, number>;  // playerId → score
}
```

---

## Step 9 — Theme Toggle Service

**`src/app/core/services/theme.service.ts`**:
```typescript
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _dark = signal<boolean>(
    localStorage.getItem('nks-theme') === 'dark' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  readonly isDark = this._dark.asReadonly();

  toggle(): void {
    const next = !this._dark();
    this._dark.set(next);
    localStorage.setItem('nks-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  }

  init(): void {
    document.documentElement.classList.toggle('dark', this._dark());
  }
}
```

Call `themeService.init()` in your root `AppComponent` `ngOnInit`.

---

## Step 10 — Firestore Security Rules

In Firebase Console → **Firestore → Rules**, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /sessions/{code} {
      // Anyone can read a session by code
      allow read: if true;

      // Only authenticated users can create
      allow create: if request.auth != null;

      // Only the host can update the session itself
      allow update: if request.auth.uid == resource.data.hostId;

      match /players/{playerId} {
        allow read: if true;

        // Host can write any player
        allow write: if request.auth.uid ==
          get(/databases/$(database)/documents/sessions/$(code)).data.hostId;

        // Player can claim their own slot (set claimedBy to their UID)
        allow update: if request.auth != null
          && resource.data.claimedBy == null
          && request.resource.data.claimedBy == request.auth.uid;
      }

      match /games/{gameId} {
        allow read: if true;

        // Only host can create/manage games
        allow write: if request.auth.uid ==
          get(/databases/$(database)/documents/sessions/$(code)).data.hostId;

        match /rounds/{roundId} {
          allow read: if true;

          // Host can write any round
          allow write: if request.auth.uid ==
            get(/databases/$(database)/documents/sessions/$(code)).data.hostId;

          // A claimed player can write only their own score
          allow update: if request.auth != null
            && exists(/databases/$(database)/documents/sessions/$(code)/players/$(request.auth.uid));
        }
      }
    }
  }
}
```

---

## Step 11 — Verify Everything Works

```bash
ng serve
```

You should see the default Angular app running at `http://localhost:4200` with no errors. Then confirm:

```bash
# Check Tailwind is compiling
# Add a test class to app.component.html:
# <div class="bg-felt-500 text-cream-50 p-4">NKS Test</div>
# You should see a green box with light text
```

---

## Step 12 — Add ESLint & Prettier

### 12a — Add ESLint

```bash
ng add @angular-eslint/schematics
```

This generates `eslint.config.js` in your project root. You will replace its contents in step 12c.

### 12b — Install Prettier and ESLint integrations

```bash
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier pretty-quick
```

Create **`.prettierrc`** in your project root:
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "tabs": false,
  "singleQuote": true,
  "semicolon": true,
  "quoteProps": "preserve",
  "bracketSpacing": true
}
```

Create **`.prettierignore`** in your project root:
```
package.json
package-lock.json
dist
node_modules
```

### 12c — Replace `eslint.config.js`

> ⚠️ The `ng add` default config has no Prettier integration. Replace the entire file with the following:

```javascript
// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      prettierConfig,              // disables ESLint rules that conflict with Prettier
    ],
    plugins: {
      prettier: prettierPlugin,    // runs Prettier as an ESLint rule
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      'prettier/prettier': 'error',               // Prettier violations = ESLint errors
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
```

**What changed vs the `ng add` default:**
- Added `prettierConfig` to the `extends` array
- Added `plugins: { prettier: prettierPlugin }`
- Added `'prettier/prettier': 'error'` rule
- Added `'@typescript-eslint/no-explicit-any': 'error'` rule

### 12d — Update `package.json` scripts

Add these two entries to the `scripts` block:
```json
"pretty-quick": "pretty-quick --staged",
"lint": "ng lint --fix"
```

### 12e — Update `.vscode/settings.json`

Create or update this file (you already have the Prettier VS Code extension installed):

```json
{
  "eslint.useFlatConfig": true,
  "eslint.validate": ["typescript", "html"],
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  },
  "editor.bracketPairColorization.enabled": true,
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 12f — Test the setup

```bash
# Run lint to verify everything is wired up
ng lint

# Run Prettier check
npx prettier --check "src/**/*.ts"
```

### Files touched in this step

| File | Action |
|---|---|
| `eslint.config.js` | Replace entirely with Prettier-integrated version |
| `.prettierrc` | Create new |
| `.prettierignore` | Create new |
| `.vscode/settings.json` | Create or update |
| `package.json` | Add `pretty-quick` and `lint` scripts |

---

## Step 13 — Admin Access

The app uses a two-code system to keep session creation private without requiring full authentication:

- **Room Code** (4-digit) — joins an existing session, shared at the table on the night
- **Admin Code** — unlocks the ability to *create* a session, shared only with trusted people

The admin code is never stored in plaintext. Only its SHA-256 hash lives in `environment.ts`. The real code is hashed at runtime using the browser's built-in Web Crypto API and compared against the stored hash — so even if someone inspects the compiled bundle they cannot reverse-engineer the original code.

Admin access is remembered in `localStorage` for 30 days with an expiry timestamp. Anyone who knows the code can become a host — there is no single-host restriction.

### Admin Service

**`src/app/core/services/admin.service.ts`**:
```typescript
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'nks-admin';
const EXPIRY_DAYS = 30;

@Injectable({ providedIn: 'root' })
export class AdminService {
  private _isAdmin = signal<boolean>(false);
  readonly isAdmin = this._isAdmin.asReadonly();

  /** Call in AppComponent.ngOnInit alongside themeService.init() */
  init(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const { expiry } = JSON.parse(raw);
      if (Date.now() < expiry) {
        this._isAdmin.set(true);  // still within 30-day window
      } else {
        localStorage.removeItem(STORAGE_KEY);  // expired, clean up silently
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /** Hash the entered code and compare against the stored hash */
  async unlock(code: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex !== environment.adminCode) return false;

    const expiry = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiry }));
    this._isAdmin.set(true);
    return true;
  }

  /** Manually revoke admin access (e.g. sign out) */
  revoke(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._isAdmin.set(false);
  }
}
```

### Home Screen Pattern

The admin entry point is a subtle link below the join field — not prominent enough to invite curiosity but accessible to anyone who knows it's there:

```html
<!-- home.component.html -->

<!-- Always visible to everyone -->
<input placeholder="Enter room code" />
<button>Join Game</button>

<!-- Subtle link — visible but not prominent -->
@if (!isAdmin()) {
  <button class="text-ink-400 text-sm mt-6 underline-offset-2"
          (click)="showAdminInput.set(true)">
    Host access
  </button>
}

<!-- Revealed on tap, password input so code is masked -->
@if (showAdminInput() && !isAdmin()) {
  <input type="password" placeholder="Admin code"
         [(ngModel)]="adminCodeInput" />
  <button (click)="tryUnlock()">Unlock</button>
}

<!-- Only visible once unlocked — replaces the subtle link -->
@if (isAdmin()) {
  <button class="bg-felt-600 text-white rounded-lg px-6 py-3 mt-6">
    + Create Night
  </button>
}
```

```typescript
// home.component.ts
export class HomeComponent {
  private adminService = inject(AdminService);

  isAdmin = this.adminService.isAdmin;
  showAdminInput = signal(false);
  adminCodeInput = '';

  async tryUnlock() {
    const success = await this.adminService.unlock(this.adminCodeInput);
    this.adminCodeInput = '';           // always clear the input
    this.showAdminInput.set(false);     // hide regardless of outcome
    // no error message — silent failure discourages brute-forcing
  }
}
```

> ℹ️ **Security note:** This is social-layer protection, not cryptographic security. A determined attacker with time could brute-force the hash. For a personal game night PWA the realistic threat model is effectively zero — this is simply keeping casual visitors out of the host flow.

---

## Project Structure Summary

```
nks-app/
  ├── src/
  │   ├── app/
  │   │   ├── core/
  │   │   │   ├── models/
  │   │   │   │   ├── session.model.ts
  │   │   │   │   ├── player.model.ts
  │   │   │   │   ├── game.model.ts
  │   │   │   │   └── round.model.ts
  │   │   │   └── services/
  │   │   │       ├── auth.service.ts
  │   │   │       ├── session.service.ts
  │   │   │       ├── theme.service.ts
  │   │   │       └── admin.service.ts  ← host access + 30-day expiry
  │   │   ├── features/         ← screens go here (next steps)
  │   │   ├── shared/           ← reusable components
  │   │   ├── app.config.ts     ← Firebase providers wired here
  │   │   └── app.routes.ts
  │   ├── environments/
  │   │   ├── environment.template.ts   ← committed — safe placeholder
  │   │   ├── environment.ts            ← git ignored — real keys + hash
  │   │   └── environment.prod.ts       ← git ignored — real keys + hash
  │   ├── styles.css            ← Tailwind @theme lives here
  │   └── index.html            ← Google Fonts link here
  ├── .postcssrc.json           ← auto-created by ng add tailwindcss
  ├── eslint.config.js          ← custom Prettier-integrated ESLint config
  ├── .prettierrc               ← Prettier formatting rules
  ├── .prettierignore           ← files excluded from Prettier
  ├── .gitignore                ← excludes environment.ts, environment.prod.ts, emulator data
  ├── firebase.json             ← emulator ports + UI config
  ├── .firebaserc               ← Firebase project ID
  ├── .vscode/
  │   └── settings.json         ← format on save + ESLint flat config
  └── src/manifest.webmanifest  ← PWA config
```

---

## Quick Setup Command Reference

Run these in order from `~/Development/nobody-keeps-score/` unless noted. Each CLI tool includes a version check — skip the install if the version check passes.

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

# ── Create Angular project (run from nobody-keeps-score/)
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

# ── Prettier ─────────────────────────────────────────
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier pretty-quick

# ── Start dev environment (two terminals) ─────────────
firebase emulators:start     # terminal 1
ng serve                     # terminal 2
```

---

## Step 14 — GitHub Repository Setup

### 14a — Verify GitHub CLI is authenticated

```bash
gh auth status
# If not logged in:
# gh auth login
```

### 14b — Ensure .gitignore is correct before first commit

Before initialising the repo, confirm your `.gitignore` includes all sensitive and generated files. It should contain at minimum:

```
# Environment files — never commit real keys
src/environments/environment.ts
src/environments/environment.prod.ts

# Firebase emulator data
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log

# Dependencies
node_modules/

# Build output
dist/

# OS files
.DS_Store
```

### 14c — Create the repository

The repo root is `nobody-keeps-score/` — not `nks-app/`. Navigate up one level before initialising git.

> ℹ️ `ng new` was run with `--skip-git` in Step 1, so there is no nested `.git` folder inside `nks-app/`. This is intentional — git belongs at the `nobody-keeps-score/` level.

```bash
# Move to the repo root (one level above nks-app/)
cd ~/Development/nobody-keeps-score

# Initialise git here — NOT inside nks-app/
git init

# Add a top-level README
echo "# Nobody's Keeping Score\n*Not that anyone's counting*" > README.md

# Create environment.template.ts before first commit if not done already
# (copy nks-app/src/environments/environment.ts, replace real values with placeholders)

# Stage everything
git add .

# Verify nothing sensitive is staged — environment.ts should NOT appear
git status

# First commit
git commit -m "chore: initial project setup"

# Create public GitHub repo and push in one command
gh repo create nobody-keeps-score \
  --public \
  --source=. \
  --remote=origin \
  --push \
  --description "Nobody's Keeping Score — not that anyone's counting"
```

> ℹ️ Note the repo name is `nobody-keeps-score` (the outer folder), not `nks-app`.

### 14d — Add branch protection on main

```bash
# Require PRs before merging to main
gh api repos/{owner}/nobody-keeps-score/branches/main/protection \
  --method PUT \
  --field required_status_checks=null \
  --field enforce_admins=false \
  --field "required_pull_request_reviews[required_approving_review_count]=0" \
  --field "required_pull_request_reviews[dismiss_stale_reviews]=false" \
  --field restrictions=null
```

> ℹ️ `required_approving_review_count=0` means a PR is required but you don't need someone else to approve it — practical for a solo project. You can raise this to `1` if you ever collaborate.

### 14e — Feature branch workflow

This is the day-to-day pattern for every piece of work:

```bash
# Start a new feature
git checkout -b feature/home-screen

# ... build, commit as you go ...
git add .
git commit -m "feat: add home screen join flow"

# When the feature is complete — push the branch
git push -u origin feature/home-screen

# Open a PR via CLI
gh pr create \
  --title "feat: home screen" \
  --body "Adds the create/join flow for the home screen" \
  --base main

# Merge the PR (once happy)
gh pr merge --squash --delete-branch

# Pull the merged changes back to local main
git checkout main
git pull
```

### Suggested feature branch names for NKS

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

### 14f — Useful gh commands to know

```bash
gh repo view --web          # open the repo in browser
gh pr list                  # list open PRs
gh pr status                # show status of your current branch's PR
gh issue create             # log a bug or idea without leaving terminal
gh browse                   # open repo homepage in browser
```

---

## Step 15 — CLAUDE.md (Claude Code Project Memory)

### What it is

`CLAUDE.md` is the file Claude Code reads automatically at the start of every session. It gives Claude persistent context about NKS — the stack, conventions, colour tokens, permission model — so you never have to re-explain the project. Think of it as the project brief distilled into instructions Claude Code acts on.

### How it gets created

The `--ai-config=claude` flag in Step 1 generates a starter `CLAUDE.md` automatically when you run `ng new`. It will be seeded with Angular best practices from the Angular CLI.

```bash
# Verify it was created
cat nks-app/CLAUDE.md
```

### Customise it for NKS

The generated file covers Angular conventions. You need to extend it with NKS-specific context. Open `nks-app/CLAUDE.md` and append the following:

```markdown
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
```

> ℹ️ `CLAUDE.md` is committed to the repo — it's safe and intentional. It contains no secrets. Keep it updated as the project evolves.

---

## Step 16 — Angular AI Setup (VS Code + MCP Server)

### 16a — VS Code Copilot instructions

Angular provides an official `copilot-instructions.md` file for VS Code. This gives VS Code's AI features (and GitHub Copilot if you use it) the same Angular best practices context as CLAUDE.md.

```bash
# Create the .github folder if it doesn't exist
mkdir -p nks-app/.github

# Download Angular's official guidelines file directly
curl -o nks-app/.github/copilot-instructions.md \
  https://angular.dev/assets/context/guidelines.md
```

> ℹ️ This file is maintained by the Angular team and updated regularly. Re-run the `curl` command periodically to stay current, or check [angular.dev/ai/develop-with-ai](https://angular.dev/ai/develop-with-ai) for updates.

### 16b — Angular CLI MCP Server (Claude Code integration)

The Angular CLI ships with an experimental MCP server that lets Claude Code interact directly with the Angular CLI — generating components, running schematics, and checking build output from within the AI session. This is the most direct integration between Claude Code and Angular.

```bash
# From inside nks-app/
cd nks-app

# Start the Angular CLI MCP server
npx @angular/cli mcp
```

To configure it permanently in VS Code so Claude Code picks it up automatically, add this to `.vscode/settings.json` (merge with your existing settings):

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

> ⚠️ The Angular CLI MCP server is experimental as of Angular 21. Check [angular.dev/ai/mcp](https://angular.dev/ai/mcp) for the latest setup instructions before configuring.

### 16c — Angular best-practices context file

Angular publishes a standalone `best-practices.md` file you can download and keep in `docs/` as a reference. It's also worth including in Claude Code sessions when starting work on a new feature.

```bash
# Download into your docs folder (one level above nks-app/)
curl -o docs/angular-best-practices.md \
  https://angular.dev/assets/context/best-practices.md
```

When starting a Claude Code session for a new feature you can reference it directly:
> *"Follow the conventions in docs/angular-best-practices.md and CLAUDE.md when generating code."*

### 16d — Summary of AI context files

| File | Location | Purpose |
|---|---|---|
| `CLAUDE.md` | `nks-app/` | Claude Code project memory — auto-loaded every session |
| `copilot-instructions.md` | `nks-app/.github/` | VS Code AI + GitHub Copilot Angular rules |
| `angular-best-practices.md` | `docs/` | Reference copy of Angular's official LLM prompt file |

---

## What's Next

---

*Nobody's Keeping Score · Not that anyone's counting*
