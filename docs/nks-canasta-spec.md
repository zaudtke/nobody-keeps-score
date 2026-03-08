# Canasta — Scoring Rules & UI Design Spec
*Nobody's Keeping Score · Not that anyone's counting*

---

| | |
|---|---|
| **Project** | Nobody's Keeping Score (NKS) |
| **Game** | Canasta |
| **Stack** | Angular 21 · Tailwind CSS v4 · PWA |
| **Primary device** | iPhone SE / iPhone 17e · iPad |
| **Version** | 1.0 |
| **Date** | 2026-03-07 |

---

## 1. Overview

Canasta uses a cumulative scoring model. Players (or teams — entered identically) keep a running total across rounds. The total at the end of each round determines the minimum meld required to open the following round. The game ends when any player reaches 5,000 points.

---

## 2. Score Formula

Every round entry involves three values:

| Term | Definition |
|---|---|
| **Previous Score** | Player's running total before this round |
| **Base** | Adjustment value · default 0 · always ≥ 0 |
| **Score** | Points earned this round · may be negative |
| **New Total** | Previous Score + Base + Score |
| **Meld (next round)** | Determined by New Total using the threshold table |

**Formula: `New Total = Previous Score + Base + Score`**

> **Note:** Base defaults to 0 and is always ≥ 0. Score may be negative. The resulting New Total may be negative.

---

## 3. Meld Thresholds

The New Total after each round determines the minimum meld the player must lay down to open the next round. Thresholds are re-evaluated after every round — a negative round can drop a player to a lower tier.

| Score Range | Meld Required | Badge Label | Badge Colour |
|---|---|---|---|
| < 0 | None | No min. | Muted ink · italic |
| 0 – 1,499 | 50 | Meld 50 | Felt green |
| 1,500 – 2,999 | 90 | Meld 90 | Amber |
| ≥ 3,000 | 120 | Meld 120 | Ruby red |

> **Note:** A player with score < 0 has no minimum meld requirement. They remain active in the game.

---

## 4. Win Condition

| Scenario | Behaviour |
|---|---|
| Single winner | First player to reach ≥ 5,000 wins. Game ends after that round completes. |
| Multiple over 5,000 | Multiple players may cross 5,000 in the same round. Highest score wins. |
| Tie | Scores are equal — app notes the tie, tiebreaker resolved at the table. |
| Negative at game end | Allowed. Player's final score shown in ruby red on the results screen. |

> **Note:** The app detects the win condition after each round is submitted. All edge cases are handled on the Game Over screen without requiring manual resolution in the app.

---

## 5. Score Entry UI

### 5.1 Entry Method Selected

**Option C — Stacked Inline Rows** was selected after reviewing all three options in the interactive mockup.

| Option | Description | Best For | Status |
|---|---|---|---|
| A — Two Fields | Base + Score always visible, stacked, color-coded | New players | Considered |
| B — Expander | Score primary; Base hidden behind toggle | Casual use | Considered |
| **C — Stacked Rows** | **Two inline rows, focus activates colour; compact** | **All players** | **✓ Selected** |

---

### 5.2 Score Entry Sheet — Option C Layout

The entry sheet slides up from the bottom (iOS native pattern). The scoreboard remains partially visible above so all players can see standings while the host enters scores.

**Sheet structure (top to bottom):**

1. Drag handle
2. Sheet header — player name (Fraunces display) · current score · meld badge
3. Live math bar — `prev + base + score = result` — updates on every keystroke
4. Base row — amber label chip + number input · receives focus by default
5. Score row — felt green label chip + number input · activates on tap
6. Confirm button — "Confirm Round Score" · disabled until Score has a value

---

### 5.3 Interaction Behaviour

| Behaviour | Detail |
|---|---|
| Default focus | Base row receives focus when sheet opens (top-down order) |
| Base field constraint | Base ≥ 0 always. Negative entry not permitted. |
| Score field constraint | Score may be negative (e.g. −150). Shown in ruby in the live math bar. |
| Live math bar | `prev + base + score = result`. Updates on every keystroke. Result turns ruby if negative, gold if ≥ 5,000. |
| Confirm button | Disabled until Score field has a value. Label: "Confirm Round Score". |
| Post-confirm | Sheet closes and returns to the scoreboard. Meld badge updates immediately. |
| Meld on drop | If a negative round drops a player to a lower threshold, the badge updates to reflect the new tier. |

---

### 5.4 Live Math Bar

The equation is always visible at the top of the entry area, keeping the calculation transparent for all players at the table.

- Previous score shown in muted ink (read-only context)
- Base value shown in amber to match the Base row label
- Score value shown in felt green; turns ruby if negative
- Result shown large; turns ruby if total goes negative, gold if total crosses 5,000
- A new meld badge previews beside the result if the tier is changing

---

### 5.5 Meld Badge

The meld badge appears in the player sub-row on the scoreboard and in the sheet header. It updates immediately after each round is confirmed.

| Badge | Score Range | Colour Tokens | Notes |
|---|---|---|---|
| No min. | < 0 | `ink-400` / `ink-600` bg | Italic, muted. Player still active. |
| Meld 50 | 0 – 1,499 | `felt-400` / `felt-900` bg | Green — low stakes, common opening. |
| Meld 90 | 1,500 – 2,999 | `amber-400` / `amber-900` bg | Amber — mid-game pressure. |
| Meld 120 | ≥ 3,000 | `ruby-400` / `ruby-900` bg | Ruby — high stakes endgame. |

---

## 6. Scoreboard

- Players listed with: avatar · name · meld badge · current score · tap arrow (host only)
- Score numerals use Fraunces display font for visual weight
- Negative scores display in ruby red with "No min." meld badge
- A player approaching 5,000 (≥ 4,000) receives a gold left-blush highlight and a "Near Win" badge — mirrors the Dirty Clubs forced-play treatment
- Round history table below standings: round number in left column, per-player deltas colour-coded (felt green positive, ruby negative)
- Tap any player row to open the score entry sheet for that player (host / claimed player only)

---

## 7. Game Over Screen

- Triggered when any player's New Total ≥ 5,000 after a round is confirmed
- Hero section: trophy emoji · winner name · final score · context note for ties or multiple finishers
- Final standings list: placement number (gold 1st, silver 2nd, amber 3rd) · avatar · name · final score
- Negative finishers shown with ruby score and "Finished negative" detail line
- Actions: **New Game** (routes to Game Setup) · **End Night** (archives session)

---

## 8. Teams vs. Individual Players

Canasta supports both individual and team play. For scoring purposes, a team is entered as a single scored entry — identical to an individual player. No special data model distinction is required. The team's name is entered at game setup in place of a player name.

---

## 9. Angular Implementation Notes

### 9.1 Scoring Logic

Pure functions in a shared scoring utility — no side effects, fully unit-testable.

```typescript
type MeldTier = 'none' | '50' | '90' | '120';

getMeldTier(score: number): MeldTier
calculateNewTotal(prev: number, base: number, score: number): number
isGameOver(scores: number[]): boolean           // any score >= 5000
getWinner(scores: Record<string, number>): string | 'tie'
```

---

### 9.2 Component: `CanastaScoreEntryComponent`

- Standalone component
- Inputs: `player`, `currentScore`, `onConfirm` callback
- Reactive form with two controls: `base` (min: 0) and `score` (no min constraint)
- `liveTotal` signal: `computed(() => currentScore + base + score)`
- `liveMeldTier` signal: `computed(() => getMeldTier(liveTotal()))`
- Emits `{ base, score, newTotal }` on confirm — parent handles Firestore write

---

### 9.3 Component: `CanastaScoreboardComponent`

- Reads from Firestore `rounds` collection; derives cumulative totals via `reduce`
- `meldTier(playerId)` — derived signal from current totals
- `nearWin(playerId)` — signal: `true` when total ≥ 4,000 (threshold configurable)
- Opens `CanastaScoreEntryComponent` in a bottom sheet on player row tap (host / claimed player only)

---

### 9.4 Feature Branch

```
feature/scoring-canasta
```

---

*Nobody's Keeping Score · Not that anyone's counting*
