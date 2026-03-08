# Home Screen — UI Design Spec
*Nobody's Keeping Score · Not that anyone's counting*

---

| | |
|---|---|
| **Project** | Nobody's Keeping Score (NKS) |
| **Screen** | Home (`/`) + Unauthorised (`/unauthorized`) |
| **Stack** | Angular 21 · Tailwind CSS v4 · PWA |
| **Primary device** | iPhone SE / iPhone 17e · iPad |
| **Branch** | `feature/home-screen` |
| **Version** | 2.0 |
| **Date** | 2026-03-08 |

---

## Change Log

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-03-08 | Initial spec — room code + admin code approach |
| 2.0 | 2026-03-08 | Pivot to host-only · Google Auth · Firestore allowlist · /unauthorized screen added |

---

## 1. Overview

The Home screen is the app's entry point at `/`. The app is **host-only for v1** — there are no viewers, no room codes, and no lobby. A single authenticated and authorised host starts and manages all game nights.

Authentication is handled via **Google Sign-In** (Firebase Auth). After a successful Google OAuth flow, the app performs a **Firestore allowlist check** before granting access. Users not present in the allowlist are signed out and routed to `/unauthorized`.

The Home screen has two states on the same route and component. The `/unauthorized` route is a separate standalone screen.

| State / Route | Trigger | Who sees it |
|---|---|---|
| **Unauthenticated** · `/` | Default on load; no Firebase session | Anyone who opens the URL |
| **Authenticated** · `/` | Google sign-in succeeded + Firestore allowlist check passed | Authorised host only |
| **Unauthorised** · `/unauthorized` | Google sign-in succeeded but Firestore allowlist check failed | Anyone signing in with a non-authorised Google account |

---

## 2. Authentication & Authorisation Flow

```
User taps "Sign in with Google"
        ↓
Firebase Google OAuth popup
        ↓
  Success?
  ├── No  → Firebase error toast → stay on unauthenticated Home
  └── Yes → Query Firestore: authorisedUsers/{uid}
                ↓
          Document exists?
          ├── No  → signOut() → router.navigate(['/unauthorized'])
          └── Yes → router.navigate(['/'])  ← authenticated Home state renders
```

### Firestore Allowlist Collection

| Property | Value |
|---|---|
| Collection | `authorisedUsers` |
| Document ID | Firebase Auth UID |
| Fields | `email: string` · `displayName: string` · `addedAt: timestamp` |
| Management | Manually via Firebase Console — no in-app UI for adding users in v1 |

### AuthService Responsibilities

| Method | Behaviour |
|---|---|
| `signInWithGoogle()` | Triggers Firebase Google OAuth popup |
| `checkAllowlist(uid)` | Reads `authorisedUsers/{uid}` — returns `true` if document exists |
| `signOut()` | Firebase `signOut()` — clears session |
| `currentUser` | `Signal<User \| null>` — drives home state; updated by `onAuthStateChanged` |

---

## 3. Layout Structure

### Home — Unauthenticated

```
┌─────────────────────────┐
│  Status Bar (28px)      │
├─────────────────────────┤
│  App Bar                │
│  NKS wordmark · ☾ toggle│
├─────────────────────────┤
│  Hero                   │
│  ♠ ♥ ♦ ♣               │
│  Nobody's Keeping Score │
│  Not that anyone's...   │
├─────────────────────────┤
│  Description blurb      │
│  (one sentence)         │
├─────────────────────────┤
│  Supported Games grid   │
│  2 × 2 chips            │
├─────────────────────────┤
│  Hairline divider       │
├─────────────────────────┤
│  Sign in with Google    │
│  Hint text              │
└─────────────────────────┘
```

### Home — Authenticated

```
┌─────────────────────────┐
│  Status Bar (28px)      │
├─────────────────────────┤
│  App Bar                │
│  NKS wordmark · avatar  │
├─────────────────────────┤
│  Personal greeting hero │
│  "Good evening"         │
│  Host first name        │
├─────────────────────────┤
│  Start Game Night CTA   │
├─────────────────────────┤
│  Available games pills  │
├─────────────────────────┤
│  Sign out (muted)       │
└─────────────────────────┘
```

### /unauthorized

```
┌─────────────────────────┐
│  Status Bar (28px)      │
├─────────────────────────┤
│  App Bar (minimal)      │
│  NKS wordmark · ☾ toggle│
├─────────────────────────┤
│                         │
│  [vertically centred]   │
│  🃏                      │
│  "This app is for       │
│   private use"          │
│  Body copy              │
│  Try a different account│
│                         │
│  NKS italic signature   │
└─────────────────────────┘
```

No tab bar on any of these screens — the tab bar appears only once a game is active (future release).

---

## 4. App Bar

| State | Left | Right |
|---|---|---|
| Unauthenticated | NKS wordmark | Theme toggle (☾/☀) · 32px circular |
| Authenticated | NKS wordmark | Host avatar (first initial · gold ring) · 30px circular |
| /unauthorized | NKS wordmark | Theme toggle (☾/☀) · 32px circular |

### Wordmark Detail

| Element | Value |
|---|---|
| "NKS" | Fraunces 700, 1rem, `-0.01em` tracking |
| Sub-label | "Nobody's Keeping Score" — DM Sans 300, 0.58rem, `0.04em` tracking, `0.65` opacity |

### App Bar Theme

| Theme | Background | Text |
|---|---|---|
| Light | `felt-600` | `cream-100` |
| Dark | `ink-900` | `cream-100` |

### Host Avatar (Authenticated only)

| Property | Value |
|---|---|
| Size | 30px circular |
| Content | First initial of Google display name |
| Font | DM Sans 700, 0.75rem |
| Light | `gold-100` bg · `gold-300` border · `gold-700` text |
| Dark | `rgba(161,98,7,0.2)` bg · `rgba(234,179,8,0.4)` border · `gold-400` text |
| Purpose | Signals authenticated state — replaces theme toggle in app bar |

---

## 5. Unauthenticated State

### 5.1 Hero

Centred, decorative. Full-width, no tap behaviour. Subtle radial green glow from centre evokes a felt table atmosphere.

| Element | Value |
|---|---|
| Suits motif | ♠ ♥ ♦ ♣ — 1.1rem, `0.18em` letter-spacing |
| Title | "Nobody's Keeping Score" — Fraunces 700, 1.55rem, `line-height: 1.05`, `-0.025em` tracking |
| "Score" | Wrapped in `<em>` → italic Fraunces 400, `gold-400` |
| Tagline | "Not that anyone's counting" — DM Sans 300, 0.72rem, `0.03em` tracking |
| Padding | `28px 20px 22px` |
| Background glow | Radial ellipse centred · `felt-600` at ~18% opacity dark / ~10% light |

| Element | Light | Dark |
|---|---|---|
| Suits | `rgba(26,127,75,0.35)` | `rgba(71,184,122,0.45)` |
| Title | `ink-900` | `cream-100` |
| Tagline | `ink-400` | `ink-500` |

### 5.2 Description Blurb

| Property | Value |
|---|---|
| Text | "A personal scorekeeper for card game nights — fast to start, simple to track, satisfying to settle." |
| Font | DM Sans 400, 0.75rem, `line-height: 1.55` |
| Alignment | Centred |
| Padding | `0 18px` |
| Light | `ink-500` |
| Dark | `ink-400` |

### 5.3 Supported Games Grid

2×2 grid. Informational only — not tappable on this screen.

| Game | Icon | Genre descriptor |
|---|---|---|
| Dirty Clubs | ♣ | Trump trick-taking |
| Canasta | 🃏 | Meld & draw |
| 5 Crowns | 👑 | Rummy variant |
| Open Scoring | ✏️ | Any game |

**Game chip detail:**

| Property | Value |
|---|---|
| Border-radius | `10px` |
| Padding | `9px 10px` |
| Icon | 1rem |
| Name | DM Sans 600, 0.72rem |
| Genre tag | DM Sans 400, 0.58rem · block below name |
| Light | white bg · `cream-200` border · subtle shadow |
| Dark | `ink-800` bg · `rgba(255,255,255,0.05)` border |
| Name light / dark | `ink-700` / `ink-200` |
| Tag light / dark | `ink-400` / `ink-600` |

### 5.4 Hairline Divider

`height: 1px` · `margin: 0 16px 16px` · light: `cream-200` · dark: `rgba(255,255,255,0.06)`

### 5.5 Google Sign-In Button

| Property | Value |
|---|---|
| Label | "Sign in with Google" |
| Icon | Official Google G logo SVG (4-colour) · 16px |
| Style | Full-width outlined · `border-radius: 10px` · `padding: 11px 16px` |
| Font | DM Sans 600, 0.88rem |
| Light | white bg · `cream-300` border · `ink-800` text · subtle shadow |
| Dark | transparent bg · `ink-600` border · `ink-100` text |

**Hint text below:**

| Property | Value |
|---|---|
| Text | "Host access only · Private use" |
| Font | DM Sans, 0.62rem · centred |
| Light | `ink-400` · Dark: `ink-700` |

---

## 6. Authenticated State

### 6.1 Personal Greeting Hero

| Element | Value |
|---|---|
| Greeting | Time-aware: "Good morning" / "Good afternoon" / "Good evening" — DM Sans 500, 0.68rem, uppercase, `0.06em` tracking |
| Host name | First name from `user.displayName` — Fraunces 700, 1.45rem, `-0.02em` tracking |
| Decorative suits | ♠♣ · absolute top-right · 1.6rem · ghosted |
| Background glow | Radial from left edge · `felt-600` ~12% opacity (dark only) |
| Padding | `20px 18px 16px` |

| Element | Light | Dark |
|---|---|---|
| Greeting | `felt-600` | `felt-400` |
| Host name | `ink-900` | `cream-100` |
| Suits | `rgba(26,127,75,0.12)` | `rgba(71,184,122,0.2)` |

### 6.2 Start Game Night CTA

| Property | Value |
|---|---|
| Label | "🃏 Start Game Night" |
| Font | Fraunces 600, 1.05rem, `-0.01em` tracking |
| Style | Full-width · `border-radius: 12px` · `padding: 15px 16px` |
| Background | `linear-gradient(135deg, felt-600 0%, felt-700 100%)` |
| Text | white |
| Box shadow dark | `0 4px 20px rgba(26,127,75,0.35)` |
| Box shadow light | `0 4px 16px rgba(26,127,75,0.25)` |
| Watermark | ♣ absolute right inside button · `2rem` · `0.12` opacity |
| Action | `router.navigate(['/game-setup'])` |

**Hint text:** "Routes to Game Setup" — DM Sans 0.63rem · centred · light: `ink-400` · dark: `ink-700`

### 6.3 Available Games Pills

Compact secondary reference. Informational only.

| Property | Value |
|---|---|
| Games | ♣ Dirty Clubs · 🃏 Canasta · 👑 5 Crowns · ✏️ Open |
| Style | `border-radius: 999px` · `padding: 4px 9px` · DM Sans 500, 0.65rem |
| Light | `felt-50` bg · `felt-100` border · `felt-700` text |
| Dark | `ink-800` bg · `rgba(255,255,255,0.05)` border · `felt-300` text |

### 6.4 Sign Out

DM Sans 500, 0.68rem · transparent bg · no border · centred · below the fold on iPhone SE (intentional). Action: `authService.signOut()` → `currentUser` signal returns `null` → unauthenticated state renders.

---

## 7. Unauthorised Screen (`/unauthorized`)

A separate route and standalone component. The user's Firebase session is signed out **before** this screen renders.

### 7.1 Content

| Element | Value |
|---|---|
| Icon | 🃏 · 2.8rem · maintains app personality, not an error symbol |
| Title | "This app is for private use" — Fraunces 700, 1.25rem, `-0.02em` tracking |
| Body | "You've signed in with a Google account that doesn't have access to this app." — DM Sans 400, 0.78rem, `line-height: 1.6` · `max-width: 240px` · centred |
| Button | "Try a different account" — outlined · Google G logo · `border-radius: 10px` · `max-width: 220px` |
| NKS signature | "Nobody's Keeping Score" — Fraunces 300 italic, 0.68rem · absolute bottom |

| Element | Light | Dark |
|---|---|---|
| Title | `ink-900` | `cream-100` |
| Body | `ink-500` | `ink-400` |
| Button border | `cream-300` | `ink-600` |
| Button text | `ink-600` | `ink-300` |
| Button bg | white | transparent |
| Signature | `ink-300` | `ink-700` |

### 7.2 Background Glow

Subtle ruby-toned radial glow — signals "wrong place" without being alarming. Consistent with the app's glow convention: felt-green = home, ruby = something is off.

`radial-gradient(ellipse 70% 50% at 50% 40%, ruby-800 at 12% opacity dark / 6% light, transparent)`

### 7.3 "Try a Different Account" Flow

| Step | Detail |
|---|---|
| 1 | `authService.signOut()` — ensures previous failed session is fully cleared |
| 2 | `authService.signInWithGoogle()` — re-triggers Google OAuth popup |
| 3 | Firestore allowlist check — authorised → `/` · unauthorised → stay on `/unauthorized` |

---

## 8. Angular Components

### 8.1 HomeComponent

| Property | Value |
|---|---|
| Name | `HomeComponent` |
| Path | `src/app/features/home/home.component.ts` |
| Type | Standalone · `ChangeDetectionStrategy.OnPush` |
| Route | `/` |

```typescript
private authService = inject(AuthService);
private router = inject(Router);

isAuthenticated = computed(() => this.authService.currentUser() !== null);

hostName = computed(() => {
  const name = this.authService.currentUser()?.displayName ?? '';
  return name.split(' ')[0];
});

greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
});

async signIn(): Promise<void> {
  const user = await this.authService.signInWithGoogle();
  if (!user) return;
  const allowed = await this.authService.checkAllowlist(user.uid);
  if (!allowed) {
    await this.authService.signOut();
    this.router.navigate(['/unauthorized']);
  }
  // allowed: currentUser signal updates → template re-renders automatically
}

startGameNight(): void {
  this.router.navigate(['/game-setup']);
}

signOut(): void {
  this.authService.signOut();
}
```

```html
@if (isAuthenticated()) {
  <!-- authenticated hero + start CTA + games pills + sign out -->
} @else {
  <!-- branding hero + description + games grid + Google sign-in -->
}
```

### 8.2 UnauthorisedComponent

| Property | Value |
|---|---|
| Name | `UnauthorisedComponent` |
| Path | `src/app/features/unauthorised/unauthorised.component.ts` |
| Type | Standalone |
| Route | `/unauthorized` |

```typescript
async tryAgain(): Promise<void> {
  await this.authService.signOut();
  const user = await this.authService.signInWithGoogle();
  if (!user) return;
  const allowed = await this.authService.checkAllowlist(user.uid);
  if (allowed) {
    this.router.navigate(['/']);
  } else {
    await this.authService.signOut();
    // already on /unauthorized — no navigation needed
  }
}
```

### 8.3 AuthService

| Property | Value |
|---|---|
| Name | `AuthService` |
| Path | `src/app/core/services/auth.service.ts` |
| Type | Injectable · `providedIn: 'root'` |

```typescript
currentUser = signal<User | null>(null); // updated by onAuthStateChanged

signInWithGoogle(): Promise<User | null>
checkAllowlist(uid: string): Promise<boolean>   // reads authorisedUsers/{uid}
signOut(): Promise<void>
```

---

## 9. Route Guard

A functional `canActivate` guard protects all routes beyond `/` and `/unauthorized`.

| Property | Value |
|---|---|
| Name | `authGuard` |
| Path | `src/app/core/guards/auth.guard.ts` |
| Behaviour | Unauthenticated → redirect `/` · Authenticated but not allowlisted → redirect `/unauthorized` |

---

## 10. Theme Toggle

Appears in the app bar on the **unauthenticated** and **/unauthorized** screens. Replaced by the host avatar on the authenticated screen.

| Property | Value |
|---|---|
| Component | `ThemeToggleComponent` |
| Path | `src/app/shared/theme-toggle/` |
| Persistence | `localStorage['nks-theme']` |
| Default | Follows OS preference (`prefers-color-scheme`) |
| Button style | 32px circular · semi-transparent background |

---

## 11. Tailwind Token Reference

All values map to `@theme` tokens in `src/styles.css`. Never use raw hex values.

| Token | Usage on this screen |
|---|---|
| `felt-50` | Game pill bg (light) |
| `felt-100` | Game pill border (light) |
| `felt-300` | Game pill text (dark) |
| `felt-400` | Greeting label (dark) |
| `felt-600` | App bar (light) · Start CTA · greeting label (light) · sign-in button hover |
| `felt-700` | Start CTA gradient end |
| `cream-50` | Page background (light) |
| `cream-100` | App bar text |
| `cream-200` | Hairline (light) · game chip border (light) |
| `cream-300` | Google button border (light) · unauthorised button border (light) |
| `gold-100` | Host avatar bg (light) |
| `gold-300` | Host avatar border (light) |
| `gold-400` | "Score" italic · host avatar text (dark) |
| `gold-700` | Host avatar text (light) |
| `ink-100` | Google button text (dark) |
| `ink-200` | Game chip name (dark) |
| `ink-400` | Tagline (light) · hints (light) · unauthorised body (dark) |
| `ink-500` | Tagline (dark) · description blurb (light) · unauthorised body (light) |
| `ink-600` | Game chip tag (dark) · sign out (dark) · unauthorised button border (dark) |
| `ink-700` | Hint texts (dark) · unauthorised signature (dark) |
| `ink-800` | Game chip bg (dark) · game pill bg (dark) |
| `ink-900` | App bar (dark) · host name (light) |
| `ink-950` | Screen background (dark) |
| `ruby-800` | Unauthorised screen glow |

---

## 12. PWA & Mobile Behaviour

| Concern | Handling |
|---|---|
| Safe area insets | `env(safe-area-inset-*)` on the root app shell — not the route component |
| Home bar clearance | `padding-bottom: env(safe-area-inset-bottom)` on scroll container |
| iPhone SE width | All content within `px-3` (12px each side) · tested at 320px rendered |
| Installed PWA | `theme-color` meta tag: `felt-600` (light) / `ink-950` (dark) |
| Offline | Unauthenticated Home and `/unauthorized` render offline. Google sign-in requires network — show "No connection" toast if offline. |

---

## 13. Accessibility

| Concern | Implementation |
|---|---|
| Sign-in button | `aria-label="Sign in with Google"` |
| Start Game Night | `aria-label="Start Game Night"` |
| Host avatar | `aria-label="Signed in as {displayName}"` |
| Sign out | `aria-label="Sign out"` |
| Try again | `aria-label="Try a different Google account"` |
| Colour contrast | All pairs meet WCAG AA · `cream-100` on `felt-600` = 4.8:1 ✓ |
| Focus ring | `focus-visible:ring-2 ring-felt-400` on all interactive elements |

---

*Nobody's Keeping Score · Not that anyone's counting*
