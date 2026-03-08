# Game Setup Screen — UI Design Spec
*Nobody's Keeping Score · Not that anyone's counting*

---

| | |
|---|---|
| **Project** | Nobody's Keeping Score (NKS) |
| **Screen** | Game Setup (`/game-setup`) |
| **Stack** | Angular 21 · Tailwind CSS v4 · PWA |
| **Primary device** | iPhone SE / iPhone 17e · iPad |
| **Branch** | `feature/game-setup` |
| **Version** | 1.0 |
| **Date** | 2026-03-08 |

---

## 1. Overview

The Game Setup screen is the first screen after the host taps "Start Game Night" on the authenticated Home screen. It is a single scrollable screen at `/game-setup` where the host picks a game type, configures any game-specific options, and enters player names before starting a game.

The screen has two entry modes that share the same route and component:

| Mode | Trigger | Behaviour |
|---|---|---|
| **Fresh Start** | Host taps "Start Game Night" from Home · no previous session in memory | No game pre-selected · no players populated · Add player row disabled until game is chosen |
| **Returning** | Host taps "New Game" from the Game Over screen within the same session | Previous game type pre-selected · players carried over · context banner shown · Start button immediately active if count is valid |

---

## 2. Layout Structure

```
┌─────────────────────────┐
│  Status Bar (28px)      │
├─────────────────────────┤
│  App Bar                │
│  ‹ back · title · spacer│
├─────────────────────────┤
│  Section Label          │
│  "Game Type"            │
│                         │
│  Game Type Cards        │
│  (4 cards · or 1 if     │
│   collapsed)            │
│                         │
│  Win Direction Panel    │
│  (Open Scoring only)    │
│                         │
├─────────────────────────┤
│  Hairline Divider       │
├─────────────────────────┤
│  Players Section Label  │
│  + count badge          │
│                         │
│  Player rows (added)    │
│  Add player row / input │
│                         │
│  Start button + hint    │
└─────────────────────────┘
```

No tab bar on this screen. The tab bar appears only once a game is active.

---

## 3. App Bar

| Element | Detail |
|---|---|
| **Left** | Back button (‹) · 32px circular · returns to Home (`/`) |
| **Centre** | Screen title (Fraunces 700, 1rem) + sub-label (DM Sans 300, 0.58rem, 0.65 opacity) |
| **Right** | 32px spacer — balances the back button visually, no action |

| Mode | Title | Sub-label |
|---|---|---|
| Fresh Start | "Game Setup" | "Pick a game · Add players" |
| Returning | "New Game" | "Same night · adjust if needed" |

### App Bar Theme

| Theme | Background | Text |
|---|---|---|
| Light | `felt-600` | `cream-100` |
| Dark | `ink-900` | `cream-100` |

### Back Button

| Property | Value |
|---|---|
| Light | `rgba(255,255,255,0.15)` bg · white text |
| Dark | `rgba(255,255,255,0.07)` bg · `ink-200` text |
| Action | `router.navigate(['/'])` — no confirmation required |

---

## 4. Returning Players Banner

Shown only in **Returning** mode. Positioned between the app bar and the "Game Type" section label.

| Property | Value |
|---|---|
| Layout | `border-radius: 10px` · `padding: 10px 12px` · `margin: 10px 12px 0` · flex row · `gap: 10px` |
| Icon | 🔁 · 1.1rem |
| Title | "Players carried over" — DM Sans 600, 0.78rem |
| Sub-text | "From previous {gameType} game" — DM Sans 400, 0.65rem |

| Theme | Background | Border | Title | Sub-text |
|---|---|---|---|---|
| Light | `felt-50` | `felt-100` | `felt-700` | `ink-400` |
| Dark | `rgba(26,127,75,0.12)` | `rgba(26,127,75,0.2)` | `felt-300` | `ink-500` |

---

## 5. Game Type Section

### 5.1 Section Label

`font-size: 0.62rem` · `font-weight: 600` · `letter-spacing: 0.09em` · `text-transform: uppercase` · `padding: 14px 16px 8px`

| Theme | Colour |
|---|---|
| Light | `ink-400` |
| Dark | `ink-600` |

### 5.2 Game Cards

Four cards displayed as a vertical list. `padding: 0 12px` · `gap: 6px` between cards.

When a game is selected, the list **collapses** to show only the selected card once the host begins adding players. This saves vertical space on iPhone SE. The host can tap the collapsed card to re-expand the full list and change their selection.

#### Card anatomy

| Element | Property | Value |
|---|---|---|
| Container | `border-radius` | `12px` (unselected) · `12px 12px 0 0` when Open Scoring selected (panel attaches below) |
| Container | `padding` | `11px 14px` |
| Container | `border` | `2px solid transparent` (unselected) · `2px solid felt-500` (selected) |
| Icon | Size | `1.3rem` · `width: 28px` · centred |
| Name | Font | DM Sans 600, 0.88rem |
| Genre descriptor | Font | DM Sans 400, 0.65rem · `margin-top: 2px` |
| Player range | Font | DM Sans 500, 0.62rem · `margin-top: 1px` · `letter-spacing: 0.02em` |
| Check circle | Size | `20px` · `border-radius: 50%` · `border: 2px solid` |

#### Card content

| Game | Icon | Genre descriptor | Player range |
|---|---|---|---|
| Dirty Clubs | ♣ | Trump trick-taking · first to 15 pts | 3 – 6 players |
| Canasta | 🃏 | Meld & draw · point totals | 2 – 6 players |
| 5 Crowns | 👑 | Rummy variant · lowest score wins | 2 – 7 players |
| Open Scoring | ✏️ | Any game · you set the rules | 2 – 8 players |

#### Card theme — unselected

| Element | Light | Dark |
|---|---|---|
| Background | white · `box-shadow: 0 1px 4px rgba(0,0,0,0.07)` | `ink-800` |
| Name | `ink-800` | `ink-100` |
| Genre descriptor | `ink-400` | `ink-500` |
| Player range | `felt-600` | `felt-400` |
| Check circle border | `cream-300` | `ink-600` |

#### Card theme — selected

| Element | Light | Dark |
|---|---|---|
| Background | `felt-50` | `rgba(26,127,75,0.15)` |
| Border | `felt-500` | `felt-500` |
| Check circle | `felt-600` fill · white ✓ | `felt-600` fill · white ✓ |

#### Selection behaviour

- Only one card may be selected at a time
- Tapping an unselected card selects it and deselects the current selection
- On selection: player count badge updates to show the game's range · CTA label updates to the game name · Add player row unlocks
- On deselection (tapping a different card): win direction panel collapses if Open Scoring was previously selected

### 5.3 Win Direction Panel (Open Scoring only)

Appears immediately below the Open Scoring card when it is selected. Visually attached — the card loses its bottom border-radius so the two surfaces read as one connected element.

#### Panel container

| Property | Value |
|---|---|
| `border-radius` | `0 0 12px 12px` |
| `padding` | `10px 14px 12px` |
| `margin` | `0 12px` (matches card horizontal margin) |
| `border-top` | none (flush with card bottom) |

| Theme | Background | Border |
|---|---|---|
| Light | `felt-50` | `1px solid felt-100` · no top border |
| Dark | `rgba(26,127,75,0.08)` | `1px solid rgba(26,127,75,0.2)` · no top border |

#### Win direction label

`font-size: 0.62rem` · `font-weight: 600` · `letter-spacing: 0.08em` · `text-transform: uppercase` · `margin-bottom: 8px`

| Theme | Colour |
|---|---|
| Light | `ink-500` |
| Dark | `ink-500` |

#### Win direction toggle

A two-option inline toggle — not a standard segmented control. Both options sit inside a single bordered container and share one border between them.

| Property | Value |
|---|---|
| Container | `border-radius: 8px` · `overflow: hidden` · `border: 1.5px solid` |
| Each option | `flex: 1` · `padding: 7px 10px` · DM Sans 600, 0.78rem · centred |
| Divider | `border-right: 1.5px solid` on the first option |

| State | Light | Dark |
|---|---|---|
| Container border | `felt-200` | `ink-700` |
| Option divider | `felt-200` | `ink-700` |
| Inactive bg | white | `ink-900` |
| Inactive text | `ink-400` | `ink-400` |
| **High Wins active** bg | `felt-600` | `felt-700` |
| **High Wins active** text | white | white |
| **Low Wins active** bg | `#fef3c7` | `rgba(217,119,6,0.3)` |
| **Low Wins active** text | `amber-600` | `amber-400` |

> **Amber for Low Wins** is intentional. The amber tint is visually distinct from the felt-green default and carries through to the scoreboard's win-direction chip — amber = low wins is a persistent convention in the app.

#### Default state

**High Score Wins** is active by default when Open Scoring is first selected. The host may switch to Low Score Wins by tapping the right option. This setting persists for the duration of the game and cannot be changed mid-game.

#### Hint text

One line below the toggle. Updates when the active direction changes.

| Direction | Text |
|---|---|
| High Score Wins | "↑ High score wins · host ends the game manually" |
| Low Score Wins | "↓ Low score wins · host ends the game manually" |

`font-size: 0.62rem` · `margin-top: 6px`

| Theme | Colour |
|---|---|
| Light | `ink-400` |
| Dark | `ink-600` |

#### Game Name input

Optional free-text field below the hint. When filled, the CTA label and scoreboard app bar subtitle use the entered name instead of "Open Scoring".

| Property | Value |
|---|---|
| Label | "Game Name" + "(optional)" in lighter weight — DM Sans 600, 0.62rem, uppercase |
| Input | `border-radius: 8px` · `border: 1.5px solid` · `padding: 7px 10px` · DM Sans 400, 0.82rem |
| Placeholder (High active) | "e.g. Scrabble, Yahtzee…" |
| Placeholder (Low active) | "e.g. Golf, Mini-golf…" |
| `maxlength` | 30 |

| Theme | Border | Text | Placeholder | Background |
|---|---|---|---|---|
| Light | `cream-300` | `ink-900` | `ink-300` | white |
| Dark | `ink-700` | `ink-100` | `ink-600` | transparent |

---

## 6. Hairline Divider

Separates the game type section from the players section.

`height: 1px` · `margin: 12px 16px`

| Theme | Colour |
|---|---|
| Light | `cream-200` |
| Dark | `rgba(255,255,255,0.06)` |

---

## 7. Players Section

### 7.1 Section Header Row

Flex row · `justify-content: space-between` · `padding: 0 16px 8px`

| Element | Property | Value |
|---|---|---|
| Label | Font | DM Sans 600, 0.62rem · uppercase · `letter-spacing: 0.09em` |
| Label | Light / Dark | `ink-400` / `ink-600` |
| Count badge | Font | DM Sans 600, 0.65rem · `padding: 2px 8px` · `border-radius: 999px` |

**Count badge states:**

| State | Text | Light | Dark |
|---|---|---|---|
| No game selected | "0 added" | `cream-100` bg · `cream-200` border · `ink-400` text | `ink-800` bg · `ink-400` text |
| Game selected, below minimum | "N of min – max" | `cream-100` bg · `cream-200` border · `ink-400` text | `ink-800` bg · `ink-400` text |
| Minimum met or exceeded | "N of min – max" | `felt-50` bg · `felt-100` border · `felt-600` text | `rgba(26,127,75,0.2)` bg · `felt-400` text |

### 7.2 Player Rows (Confirmed)

Each confirmed player is shown as a row with avatar, name, and remove button.

`padding: 0 12px` · `gap: 6px` between rows

| Element | Property | Value |
|---|---|---|
| Row container | `border-radius` | `10px` · `padding: 8px 10px` |
| Row container | Light / Dark | white + `box-shadow: 0 1px 4px rgba(0,0,0,0.05)` / `ink-800` |
| Avatar circle | Size | `34px` · `border-radius: 50%` |
| Avatar circle | Font | Fraunces 700, 0.9rem |
| Avatar content | | First letter of the player's name — generated automatically, not editable |
| Name | Font | DM Sans 500, 0.88rem |
| Name | Light / Dark | `ink-800` / `ink-100` |
| Remove button | Size | `26px` · `border-radius: 50%` |
| Remove button | Light / Dark | `cream-100` bg · `ink-400` text / `rgba(255,255,255,0.05)` bg · `ink-500` text |
| Remove button | Action | Removes player · re-evaluates count badge and CTA state immediately |

#### Avatar colour assignment

Colours are assigned by position (1-indexed). The same player always gets the same colour for the duration of the game night.

| Position | Dark bg | Dark text | Light bg | Light text |
|---|---|---|---|---|
| 1 | `rgba(26,127,75,0.25)` | `felt-300` | `felt-100` | `felt-700` |
| 2 | `rgba(234,179,8,0.2)` | `gold-400` | `#fef9c3` | `#a16207` |
| 3 | `rgba(248,59,72,0.2)` | `#ff8089` | `ruby-100` | `ruby-600` |
| 4 | `rgba(96,165,250,0.2)` | `#93c5fd` | `#dbeafe` | `#1d4ed8` |
| 5 | `rgba(192,132,252,0.2)` | `#d8b4fe` | `#f3e8ff` | `#7c3aed` |
| 6 | `rgba(251,146,60,0.2)` | `#fdba74` | `#ffedd5` | `#c2410c` |

If a player is removed, the remaining players retain their original positions and colours. A new player added at the end takes the next available position colour.

### 7.3 Add Player Row (Inactive)

Shown when no input is currently active and the player maximum for the selected game has not been reached.

`border-radius: 10px` · `padding: 8px 10px` · `border: 1.5px dashed` · `margin: 0 12px`

| Element | Light | Dark |
|---|---|---|
| Row border | `cream-300` | `ink-700` |
| Row background | white | transparent |
| Plus icon circle | `cream-100` bg · `ink-400` text | `rgba(255,255,255,0.05)` bg · `ink-500` text |
| Label | `ink-400` | `ink-500` |

**Label text by context:**

| State | Label |
|---|---|
| No game selected | "Select a game first" (row is disabled, `opacity: 0.4`, `cursor: not-allowed`) |
| Game selected, no players yet | "Add a player" |
| One or more players added | "Add another player" |
| Maximum reached | Row is hidden · replaced by limit hint |

**Player limit hint (maximum reached):**

`text-align: center` · DM Sans 400, 0.65rem · `padding: 6px 16px 0`

Text: "Maximum {n} players for {gameName}"

| Theme | Colour |
|---|---|
| Light | `ink-400` |
| Dark | `ink-600` |

### 7.4 Add Player Row (Active — Input)

Tapping the Add Player row replaces it with an inline input row. No modal, no bottom sheet — editing stays in-context.

`border-radius: 10px` · `padding: 6px 10px` · `border: 2px solid` · `margin: 0 12px`

| Property | Light | Dark |
|---|---|---|
| Border | `felt-500` | `felt-500` |
| Background | white · `box-shadow: 0 0 0 3px rgba(26,127,75,0.1)` | `ink-800` |

| Element | Property | Value |
|---|---|---|
| Avatar circle | Size | `34px` · same colour/style as confirmed player rows |
| Avatar content | | Live preview — first letter of text currently in the input field · blank circle if input is empty |
| Input field | Font | DM Sans 500, 0.88rem |
| Input field | Placeholder | "Player name" |
| Input field | `inputmode` | `text` |
| Input field | `maxlength` | 20 |
| Input field | Light / Dark | `ink-900` / `ink-100` · transparent background |
| Confirm button | Size | `28px` · `border-radius: 8px` |
| Confirm button | Style | `felt-600` bg · white ✓ · DM Sans 700, 0.75rem |
| Confirm button | Disabled | When input is empty |

**Confirm action:** adds the player to the list, resets the input to the Add Player row (inactive state). If the newly added player meets the minimum count, the CTA button activates.

**iOS keyboard:** tapping Return/Done on the iOS keyboard is equivalent to tapping the confirm button.

**CTA state while input is open:** the Start button remains disabled even if the minimum is otherwise met — the host must confirm or discard the current input before starting.

---

## 8. Start Button & CTA Area

`padding: 14px 12px 0`

### 8.1 Button

| Property | Value |
|---|---|
| Width | Full-width |
| `border-radius` | `12px` |
| `padding` | `14px 16px` |
| Font | Fraunces 600, 1rem · `letter-spacing: -0.01em` |
| Background | `linear-gradient(135deg, felt-600 0%, felt-700 100%)` |
| Text | white |
| Watermark | Game icon absolute-positioned right · `font-size: 2rem` · `opacity: 0.12` (clubs ♣ for Dirty Clubs / Canasta / 5 Crowns; ✏️ at reduced size for Open Scoring) |

**Disabled state:** `opacity: 0.35` · `cursor: not-allowed` · gradient still visible (no grey-out)

**Active state:** `box-shadow: 0 4px 20px rgba(26,127,75,0.35)` (dark) · `0 4px 16px rgba(26,127,75,0.25)` (light)

### 8.2 Button Label

Label updates reactively as the host configures the game.

| State | Label |
|---|---|
| No game selected | "Start Game" |
| Game selected, minimum not met | "Start {GameName}" |
| Minimum met, input open | "Start {GameName}" (disabled) |
| Ready | "Start {GameName}" (active) |
| Open Scoring + custom name entered | "Start {CustomName}" |

### 8.3 CTA Hint Text

One line below the button. `font-size: 0.63rem` · `text-align: center` · light: `ink-400` · dark: `ink-700`

| State | Hint |
|---|---|
| No game selected | "Select a game and add players to begin" |
| Game selected, below minimum | "Add at least {n} players to begin" |
| Input open | "Confirm player name to continue" |
| Ready — Dirty Clubs | "4 players · first to 15 points wins" |
| Ready — Canasta | "4 players · most points wins" |
| Ready — 5 Crowns | "4 players · lowest score wins" |
| Ready — Open · High wins | "3 players · ↑ high score wins" |
| Ready — Open · Low wins | "3 players · ↓ low score wins" |

---

## 9. Validation Rules

| Rule | Detail |
|---|---|
| Game required | Start button disabled until a game type is selected |
| Minimum players | Start button disabled until the selected game's minimum player count is met |
| Input must be confirmed | Start button disabled while an unconfirmed name is in the input field |
| Duplicate names | Permitted — "Jim" and "Jim" can coexist. The host is responsible for clarity at the table |
| Empty name | Confirm button on input row disabled if the field is empty |
| Maximum players | Add player row hidden once the selected game's maximum is reached |
| Win direction (Open) | Always has a valid default (High Score Wins) — never blocks the Start button |

---

## 10. Game Player Constraints

| Game | Minimum | Maximum |
|---|---|---|
| Dirty Clubs | 3 | 6 |
| Canasta | 2 | 6 |
| 5 Crowns | 2 | 7 |
| Open Scoring | 2 | 8 |

---

## 11. Angular Component

### 11.1 Component Identity

| Property | Value |
|---|---|
| Name | `GameSetupComponent` |
| Path | `src/app/features/game-setup/game-setup.component.ts` |
| Type | Standalone · `ChangeDetectionStrategy.OnPush` |
| Route | `/game-setup` |

### 11.2 Route & Navigation

The route accepts an optional query parameter for the returning-players flow:

```typescript
// Fresh start — no params
router.navigate(['/game-setup']);

// Returning — carries sessionId for player carryover lookup
router.navigate(['/game-setup'], { queryParams: { session: sessionId } });
```

On init, `GameSetupComponent` reads the `session` query param. If present, it fetches the previous session's game type and player list from Firestore and pre-populates the form.

### 11.3 Signals

```typescript
// Game selection
selectedGame    = signal<GameType | null>(null);
// GameType = 'dirty-clubs' | 'canasta' | '5-crowns' | 'open'

// Open Scoring config
winDirection    = signal<'high' | 'low'>('high');
gameName        = signal<string>('');

// Players
players         = signal<Player[]>([]);
// Player = { id: string; name: string; avatarPosition: number }

addPlayerInput  = signal<string>('');
isAddingPlayer  = signal<boolean>(false);

// Returning mode
isReturning     = signal<boolean>(false);
previousGame    = signal<string>('');   // label for banner sub-text

// Derived
gameConstraints = computed(() => GAME_CONSTRAINTS[this.selectedGame() ?? 'open']);
// GAME_CONSTRAINTS: Record<GameType, { min: number; max: number }>

playerCount     = computed(() => this.players().length);
countIsValid    = computed(() =>
  this.playerCount() >= this.gameConstraints().min &&
  this.playerCount() <= this.gameConstraints().max
);

canStart        = computed(() =>
  this.selectedGame() !== null &&
  this.countIsValid() &&
  !this.isAddingPlayer()
);

ctaLabel        = computed(() => {
  const game = this.selectedGame();
  if (!game) return 'Start Game';
  if (game === 'open') {
    const name = this.gameName().trim();
    return name ? `Start ${name}` : 'Start Open Scoring';
  }
  return `Start ${GAME_LABELS[game]}`;
});

ctaHint = computed(() => { /* see section 8.3 */ });

gameCardList    = computed(() =>
  this.selectedGame() && this.playerCount() > 0
    ? [this.selectedGame()]   // collapsed — only selected card shown
    : ALL_GAMES               // full list shown
);
```

### 11.4 Methods

```typescript
selectGame(game: GameType): void
// Sets selectedGame signal. Resets players if switching games while players exist.
// If previous game was 'open', resets winDirection to 'high' and gameName to ''.

setWinDirection(direction: 'high' | 'low'): void
// Sets winDirection signal. Updates CTA hint and game name placeholder.

beginAddPlayer(): void
// Sets isAddingPlayer to true. Focuses the input on next tick.

confirmPlayer(): void
// Trims addPlayerInput. Returns early if empty.
// Appends { id: uuid(), name, avatarPosition: players().length + 1 } to players signal.
// Resets addPlayerInput and isAddingPlayer.

removePlayer(id: string): void
// Removes player by id. Re-evaluates canStart immediately.

async startGame(): Promise<void>
// Guard: returns early if !canStart().
// Creates Firestore session document via SessionService.
// Navigates to /game/:id.
```

### 11.5 Template Structure

```html
<!-- Returning banner — shown only if isReturning() -->
@if (isReturning()) {
  <app-returning-banner [previousGame]="previousGame()" />
}

<!-- Game type section -->
<section class="game-type-section">
  <div class="section-label">Game Type</div>

  @for (game of gameCardList(); track game) {
    <app-game-card
      [game]="game"
      [selected]="selectedGame() === game"
      [attachPanel]="game === 'open' && selectedGame() === 'open'"
      (select)="selectGame(game)"
    />
    @if (game === 'open' && selectedGame() === 'open') {
      <app-win-direction-panel
        [winDirection]="winDirection()"
        [gameName]="gameName()"
        (directionChange)="setWinDirection($event)"
        (nameChange)="gameName.set($event)"
      />
    }
  }
</section>

<hr class="hairline" />

<!-- Players section -->
<section class="players-section">
  <div class="player-count-row">...</div>

  @for (player of players(); track player.id) {
    <app-player-row [player]="player" (remove)="removePlayer(player.id)" />
  }

  @if (isAddingPlayer()) {
    <app-player-input
      [(value)]="addPlayerInput"
      [avatarPosition]="playerCount() + 1"
      (confirm)="confirmPlayer()"
      (cancel)="isAddingPlayer.set(false)"
    />
  } @else if (playerCount() < gameConstraints().max) {
    <app-add-player-row
      [disabled]="!selectedGame()"
      (add)="beginAddPlayer()"
    />
  } @else {
    <p class="player-limit-hint">Maximum {{ gameConstraints().max }} players</p>
  }
</section>

<!-- CTA -->
<div class="cta-area">
  <button
    class="btn-start-game"
    [class.ready]="canStart()"
    [disabled]="!canStart()"
    (click)="startGame()"
  >
    {{ ctaLabel() }}
  </button>
  <p class="cta-hint">{{ ctaHint() }}</p>
</div>
```

---

## 12. Firestore Interaction

### 12.1 On Init (Returning mode)

```typescript
// Read previous session to pre-populate
const session = await sessionService.getSession(sessionId);
selectedGame.set(session.gameType);
players.set(session.players.map(p => ({ ...p })));
if (session.gameType === 'open') {
  winDirection.set(session.config.winDirection);
  gameName.set('');  // game name is not carried over — host re-enters if wanted
}
isReturning.set(true);
previousGame.set(GAME_LABELS[session.gameType]);
```

### 12.2 On Start Game

```typescript
const sessionDoc: Session = {
  hostId: authService.currentUser()!.uid,
  createdAt: serverTimestamp(),
  status: 'active',
  gameType: selectedGame()!,
  config: selectedGame() === 'open'
    ? { winDirection: winDirection(), gameName: gameName().trim() || 'Open Game' }
    : {},
  players: players().map(p => ({ id: p.id, name: p.name }))
};
const id = await sessionService.createSession(sessionDoc);
router.navigate(['/game', id]);
```

---

## 13. PWA & Mobile Behaviour

| Concern | Handling |
|---|---|
| Safe area insets | Applied at root shell — not this component |
| iPhone SE scroll | Content is scrollable — critical that the Start button and CTA hint are reachable above the iOS home indicator. `padding-bottom: env(safe-area-inset-bottom)` on `.scrollable` |
| iOS keyboard | When the player name input or game name input is active, the keyboard pushes the viewport up. The active input should remain visible above the keyboard — Angular's CDK scroll handling or `scrollIntoView` on focus |
| `inputmode` on game name | `inputmode="text"` — triggers standard alphabetic keyboard |
| Installed PWA | `theme-color` uses `felt-600` (light) / `ink-950` (dark) from app shell |

---

## 14. Accessibility

| Concern | Implementation |
|---|---|
| Game card selection | `role="radio"` · `aria-checked` · grouped in `role="radiogroup"` labelled "Game Type" |
| Win direction toggle | `role="radio"` · `aria-checked` · grouped in `role="radiogroup"` labelled "Win Direction" |
| Player name input | `aria-label="Player name"` · `autocomplete="off"` |
| Game name input | `aria-label="Game name (optional)"` |
| Confirm player button | `aria-label="Confirm player name"` |
| Remove player button | `aria-label="Remove {playerName}"` |
| Start button | `aria-label="Start {ctaLabel()}"` · `aria-disabled` when disabled |
| Count badge | `aria-live="polite"` — announces count changes to screen readers |
| Focus ring | `focus-visible:ring-2 ring-felt-400` on all interactive elements |

---

## 15. Tailwind Token Reference

All values map to `@theme` tokens in `src/styles.css`. Never use raw hex values.

| Token | Usage on this screen |
|---|---|
| `felt-50` | Game card bg (selected, light) · win direction panel bg (light) · returning banner bg (light) · count badge bg (valid, light) |
| `felt-100` | Win direction panel border (light) · returning banner border (light) · count badge border (valid, light) |
| `felt-200` | Win direction toggle border (light) |
| `felt-300` | Returning banner title (dark) |
| `felt-400` | Player count badge text (valid, dark) · game card player range (dark) |
| `felt-500` | Game card selected border · player input active border |
| `felt-600` | App bar (light) · Start button gradient start · win dir High active bg (light) · game card player range (light) · start button active shadow |
| `felt-700` | Start button gradient end · win dir High active bg (dark) |
| `cream-50` | Page background (light) |
| `cream-100` | App bar text · remove btn bg (light) · count badge bg (default, light) |
| `cream-200` | Hairline (light) · count badge border (default, light) |
| `cream-300` | Add player row border (light) · game name input border (light) · back btn bg (light) |
| `amber-400` | Win dir Low active text (dark) |
| `amber-600` | Win dir Low active text (light) |
| `ink-100` | Player name (dark) · game card name (dark) |
| `ink-200` | Back button text (dark) |
| `ink-400` | Section labels (light) · add player label (dark) · remove btn text (light) · CTA hint (light) |
| `ink-500` | Game card genre (dark) · win dir label (both) · returning banner sub (light) |
| `ink-600` | Section labels (dark) · player limit hint (dark) · win dir hint (dark) |
| `ink-700` | Win dir toggle border (dark) · game name input border (dark) · CTA hint (dark) |
| `ink-800` | Game card bg (dark) · player row bg (dark) · count badge bg (default, dark) |
| `ink-900` | App bar (dark) · page background text (light) |
| `ink-950` | Page background (dark) |
| `gold-400` | Avatar position 2 text (dark) |

---

*Nobody's Keeping Score · Not that anyone's counting*
