# Open Scorer — Scoring Rules & UI Design Spec
*Nobody's Keeping Score · Not that anyone's counting*

---

| | |
|---|---|
| **Project** | Nobody's Keeping Score (NKS) |
| **Game** | Open Scorer (generic) |
| **Stack** | Angular 21 · Tailwind CSS v4 · PWA |
| **Primary device** | iPhone SE / iPhone 17e · iPad |
| **Version** | 1.0 |
| **Date** | 2026-03-07 |

---

## 1. Overview

The Open Scorer is a generic cumulative scorer with no game-specific rules, round structure, or card logic. It is designed for any freeform game where players take turns adding points to their running total — Scrabble, Boggle, Yahtzee, dominoes, darts, or any other game where the host just needs to track who has what.

The single configurable property set at Game Setup is **win direction**: **High Score Wins** or **Low Score Wins**. Everything else — sorting, badges, leader treatment, and the win condition — derives from that one value.

---

## 2. Game Configuration

Set once at Game Setup. Cannot be changed mid-game.

| Setting | Options | Effect |
|---|---|---|
| **Win Direction** | High Score Wins · Low Score Wins | Controls sort order, leader badge, and win detection |
| **Game Name** | Free text (optional) | Displayed in the app bar subtitle. Defaults to "Open Game" if blank. |

> **Note:** There is no round count, no round labels, and no forced end condition. The host ends the game manually by tapping "End Game" whenever the table decides the game is over.

---

## 3. Score Formula

Each turn, the host enters a score adjustment for one player. The adjustment is added to their running total.

| Term | Definition |
|---|---|
| **Previous Score** | Player's running total before this turn |
| **Turn Score** | Points earned this turn · may be negative (e.g. a penalty or correction) |
| **New Total** | Previous Score + Turn Score |

**Formula: `New Total = Previous Score + Turn Score`**

> **Note:** Turn Score may be negative. There is no constraint on direction — positive scores add points, negative scores subtract (useful for penalties or score corrections). Starting total is 0 for all players.

---

## 4. Win Condition

| Scenario | Behaviour |
|---|---|
| **High Score Wins** | Player with the highest total is the leader. Game ends when the host taps "End Game". Highest score wins. |
| **Low Score Wins** | Player with the lowest total is the leader. Game ends when the host taps "End Game". Lowest score wins. |
| **Tie** | Two or more players share the top (or bottom) position. App notes the tie; resolved at the table. |
| **Negative total** | Always permitted. Shown in ruby on the scoreboard. |

> **Note:** There is no automatic win detection. The host always ends the game manually. This keeps the Open Scorer flexible — some games have natural endpoints, others do not.

---

## 5. Sorting & Leader Treatment

| Win Direction | Sort Order | Leader = |
|---|---|---|
| High Score Wins | Descending (highest first) | Highest total |
| Low Score Wins | Ascending (lowest first) | Lowest total |

The leading player always receives:
- Gold left-blush highlight on their row
- **"Leading"** badge (High) or **"Leading"** badge (Low) — same label, different context communicated by the score ordering alone

---

## 6. Score Entry UI

### 6.1 Entry Sheet Layout

The entry sheet slides up from the bottom (iOS native pattern). The scoreboard remains partially visible above.

**Sheet structure (top to bottom):**

1. Drag handle
2. Sheet header — player name (Fraunces display) · current running total
3. Live math bar — `prev + turn = new total` — updates on every keystroke
4. Turn score input — single large number field · label: "Turn score" · may be negative
5. Confirm button — "Confirm Score" · disabled until the score field has a value

### 6.2 Interaction Behaviour

| Behaviour | Detail |
|---|---|
| Default focus | Score field receives focus immediately when sheet opens. |
| Score field constraint | No constraint — positive or negative values permitted. |
| Live math bar | `prev + turn = new total`. Updates on every keystroke. New total turns ruby if negative. |
| Confirm button | Disabled until the score field has a value. Label: "Confirm Score". |
| Post-confirm | Sheet closes. Player row gains a ✓ indicator showing their score is in for the current round. |
| All scores in | "Complete Round" button in the game strip becomes active (host only). |

### 6.3 Live Math Bar

- Previous score shown in muted ink (read-only context)
- Turn score shown in felt green; turns ruby if the value is negative
- Result shown large in Fraunces; turns ruby if total goes negative
- All three values update live on every keystroke

---

## 7. Scoreboard

- Players sorted by win direction (descending for High, ascending for Low)
- Each row: avatar · name · current total · round status indicator · tap arrow (host / claimed player only)
- Score numerals use Fraunces display font
- Negative scores displayed in ruby
- The leading player (top of sorted list) receives a gold left-blush highlight and a "Leading" badge

### 7.1 Player Row Status

Each player row shows one of two states for the current round:

| State | Visual |
|---|---|
| Awaiting score | No indicator — tap arrow visible |
| Score confirmed | Small ✓ badge beside the name sub-row |

### 7.2 Win Direction Indicator

A small persistent chip in the game strip below the app bar shows the win direction so all players can see it at a glance:

| Win Direction | Chip Label | Chip Colour |
|---|---|---|
| High Score Wins | ↑ High wins | Felt green |
| Low Score Wins | ↓ Low wins | Amber |

---

## 8. Round Tracking

The Open Scorer tracks a simple round counter — no rules or logic are tied to the round number. It exists purely as an indicator so players know where they are in the game.

### 8.1 Round Indicator

The current round number is displayed in the game strip, always visible below the app bar:
- "Round N" — plain numeric label, starting at Round 1
- No maximum — the counter increments indefinitely until End Game

### 8.2 Complete Round Button

The "Complete Round" button lives in the game strip alongside the round indicator and the End Game button.

| State | Appearance | Behaviour |
|---|---|---|
| Scores incomplete | Dimmed / disabled · shows how many players still need a score (e.g. "2 remaining") | Non-interactive |
| All scores in | Active · felt green · label: "Complete Round →" | Increments round counter; resets all player ✓ indicators |

> **Note:** Completing a round does not end the game. The host must still tap "End Game" to trigger the Game Over screen.

---

## 9. End Game

The host taps **"End Game"** in the game strip to end the game at any time. This triggers the Game Over screen.

The "End Game" button is always active (no pre-conditions). It lives in the game strip — always visible without scrolling.

---

## 10. Game Over Screen

- Triggered when the host taps "End Game"
- Hero section: trophy emoji · winner name · final score · win direction context note
- For High wins: "Highest score wins — well played."
- For Low wins: "Lowest score wins — well played."
- Final standings list: placement (gold 1st, silver 2nd, amber 3rd) · avatar · name · final score
- Negative finishers shown with ruby score
- Tie handled: hero note reads "Tied — break at the table."
- Actions: **New Game** (routes to Game Setup) · **End Night** (archives session)

---

## 11. Angular Implementation Notes

### 11.1 Game Config Model

```typescript
type WinDirection = 'high' | 'low';

interface OpenGameConfig {
  winDirection: WinDirection;
  gameName: string;  // optional, defaults to 'Open Game'
}
```

### 11.2 Scoring Logic

Pure functions in a shared scoring utility — no side effects, fully unit-testable.

```typescript
calculateNewTotal(prev: number, turnScore: number): number
sortPlayers(
  totals: Record<string, number>,
  direction: WinDirection
): string[]   // returns playerIds sorted by direction
isLeading(playerId: string, totals: Record<string, number>, direction: WinDirection): boolean
isRoundComplete(scores: Record<string, number | null>): boolean  // all players have a value for this round
getWinner(totals: Record<string, number>, direction: WinDirection): string | 'tie'
```

### 11.3 Component: `OpenScoreEntryComponent`

- Standalone component
- Inputs: `player`, `currentTotal`, `winDirection`, `onConfirm` callback
- Reactive form with one control: `turnScore` (no min/max constraint)
- `liveTotal` signal: `computed(() => currentTotal + turnScore)`
- Emits `{ turnScore, newTotal }` on confirm — parent handles Firestore write

### 11.4 Component: `OpenScoreboardComponent`

- Reads from Firestore `rounds` collection; each round document holds per-player scores for that round; cumulative totals derived via `reduce`
- `currentRound` signal — integer starting at 1; incremented on Complete Round (1-based)
- `roundComplete()` signal: `computed(() => all players have a score for the current round)`
- `sortedPlayers` — derived signal; re-sorts on every new total write
- `isLeading(playerId)` — signal derived from sorted order and `winDirection`
- `winDirectionLabel` — computed chip label and colour from config
- Opens `OpenScoreEntryComponent` in a bottom sheet on player row tap
- "Complete Round" button wired to `completeRound()` — increments `currentRound`, writes to Firestore
- "End Game" button always active — triggers game-over flow on tap

### 11.5 Firestore Structure Note

Switching from a flat `turns` collection to a `rounds` collection to support per-round score tracking and the Complete Round flow:

```
games/{gameId}
  ├── gameType: 'open'
  ├── config: { winDirection: 'high' | 'low', gameName: string }
  ├── currentRound: number       // 1-based · starts at 1 · increments on Complete Round
  └── rounds/{roundId}
        ├── roundNumber: number
        └── scores: { [playerId]: number | null }
```

### 11.6 Feature Branch

```
feature/scoring-open
```

---

*Nobody's Keeping Score · Not that anyone's counting*
