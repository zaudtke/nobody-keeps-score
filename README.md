# Nobody's Keeping Score
*Not that anyone's counting*

A personal PWA for tracking card game scores across a game night. Fast to start, simple to track, satisfying to settle.

---

## Games

| Game | Type | Win condition |
|---|---|---|
| **Dirty Clubs** | Trump trick-taking | Lowest score wins |
| **Canasta** | Meld & draw | First to 5,000 pts wins |
| **5 Crowns** | Rummy variant | Lowest score after 11 rounds wins |
| **Open Scorer** | Any game | Host-configurable (high or low) |

---

## Tech Stack

| | |
|---|---|
| **Framework** | Angular 21 — standalone components, signals, OnPush |
| **Styling** | Tailwind CSS v4 — CSS-first `@theme` config |
| **Database** | Firebase Firestore — real-time |
| **Auth** | Firebase Authentication — Google Sign-In |
| **PWA** | Angular Service Worker — installable, offline-capable |

---

## Project Structure

```
nobody-keeps-score/
├── nks-app/               Angular project
│   ├── src/app/
│   │   ├── core/          Models, services (auth, session, theme), guards
│   │   └── features/
│   │       ├── home/
│   │       ├── unauthorized/
│   │       ├── game-setup/
│   │       ├── scoreboard/        Route shell — dispatches to game scoreboards
│   │       ├── dirty-clubs/
│   │       ├── canasta/
│   │       ├── five-crowns/
│   │       └── open-scorer/
│   └── public/            PWA icons, manifest
├── docs/                  Specs for each game and screen
└── design/                HTML mockups and SVG icon source
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Angular CLI — `npm install -g @angular/cli`
- Firebase CLI — `npm install -g firebase-tools`

### Setup

```bash
# 1. Install dependencies
cd nks-app
npm install

# 2. Copy the environment template and fill in your Firebase config
cp src/environments/environment.template.ts src/environments/environment.ts

# 3. Start the Firestore emulator (terminal 1)
firebase emulators:start

# 4. Start the dev server (terminal 2)
ng serve
```

Open [http://localhost:4200](http://localhost:4200).

> The app connects to the Firestore emulator automatically in development. Your `environment.ts` is git-ignored — never commit real Firebase credentials.

---

## Firebase Setup

Auth and Firestore must be configured in the [Firebase Console](https://console.firebase.google.com) before the app can run against a real backend:

1. Create a Firebase project and register a web app — copy the config into `environment.ts`
2. Enable **Firestore** and **Google Authentication**
3. Sign in once to get your UID, then create `authorizedUsers/{uid}` in Firestore (fields: `email`, `displayName`, `addedAt`)
4. Deploy security rules: `firebase deploy --only firestore:rules`

Access is allowlist-only — only UIDs present in `authorizedUsers` can sign in.

---

## Deployment

```bash
ng build --configuration=production
firebase deploy
```

---

## Contributing

Main branch is protected — all changes go through a PR. Branch naming: `feature/description` or `chore/description`.
