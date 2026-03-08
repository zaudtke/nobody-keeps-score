# 5 Crowns — Scoring Rules & UI Design Spec
*Nobody's Keeping Score · Not that anyone's counting*

---

| | |
|---|---|
| **Project** | Nobody's Keeping Score (NKS) |
| **Game** | 5 Crowns |
| **Stack** | Angular 21 · Tailwind CSS v4 · PWA |
| **Primary device** | iPhone SE / iPhone 17e · iPad |
| **Version** | 1.0 |
| **Date** | 2026-03-07 |

---

## 1. Overview

5 Crowns is a fixed-round card game with exactly 11 rounds. Each round has a specific card count and wild card — both determined by the round label. Scoring is cumulative. **The lowest score wins.** The game ends after all 11 rounds are completed.

---

## 2. Round Structure

There are exactly 11 rounds. Each round is identified by a label that also determines the number of cards dealt and which card is wild for that round.

| Round # | Label | Cards Dealt | Wild Card |
|---|---|---|---|
| 1 | 3 | 3 | 3s |
| 2 | 4 | 4 | 4s |
| 3 | 5 | 5 | 5s |
| 4 | 6 | 6 | 6s |
| 5 | 7 | 7 | 7s |
| 6 | 8 | 8 | 8s |
| 7 | 9 | 9 | 9s |
| 8 | 10 | 10 | 10s |
| 9 | J | 11 | Jacks |
| 10 | Q | 12 | Queens |
| 11 | K | 13 | Kings |

> **Note:** The round label (3 through K) is the canonical identifier displayed throughout the UI. Round number (1–11) is used internally for ordering only.

---

## 3. Score Formula

Each round, every player counts their unmelded card points and that value is added to their running total.

| Term | Definition |
|---|---|
| **Previous Score** | Player's running total before this round |
| **Round Score** | Points from unmelded cards this round · always ≥ 0 |
| **New Total** | Previous Score + Round Score |

**Formula: `New Total = Previous Score + Round Score`**

> **Note:** Round Score is always ≥ 0. A player who goes out scores 0 for the round. Negative totals are not possible in standard play, but the app permits negative entry to accommodate any house-rule edge case (e.g. a bonus correction).

---

## 4. Card Point Values

Standard 5 Crowns point values for reference (informational — not enforced by the app):

| Card | Points |
|---|---|
| 3 – 9 | Face value |
| 10, J, Q, K | 10 |
| Joker | 50 |
| Wild card (varies by round) | 20 |
| Ace | 15 |

> The app does not calculate hand values — players count and enter their total manually.

---

## 5. Win Condition

| Scenario | Behaviour |
|---|---|
| Normal end | Game ends after Round K is fully scored (all players have entered their score). |
| Winner | Player with the **lowest** cumulative total after Round K wins. |
| Tie | Scores are equal — app notes the tie; tiebreaker resolved at the table. |
| Negative total | Permitted as an edge case. Shown in ruby on the scoreboard and results screen. |

> **Note:** There is no mid-game win condition. The game always runs all 11 rounds. The Game Over screen is triggered after the final round (K) is fully entered.

---

## 6. Round Flow

### 6.1 Two-Level Completion Model

5 Crowns requires two distinct "complete" actions per round:

| Action | Who triggers it | What it does |
|---|---|---|
| **Confirm Player Score** | Host or claimed player | Submits one player's score for the current round. Enabled once the score field has a value. |
| **Complete Round** | Host only | Advances the game to the next round. Only available once **all** players have a score for the current round. |

> **Note:** Players may enter scores in any order within a round. The "Complete Round" button remains disabled until every player's score is confirmed for the current round. This prevents accidentally advancing mid-round.

### 6.2 Round Indicator

The current round is always visible in the game strip below the app bar. It shows:
- The round label (3, 4, 5 … 10, J, Q, K) — large and prominent
- Cards dealt this round
- Wild card for this round
- A compact progress pip track showing all 11 labels with the current one highlighted

### 6.3 Score Entry per Player

Score entry opens as a bottom sheet when a player row is tapped. The entry sheet is intentionally simple — a single number field.

---

## 7. Score Entry UI

### 7.1 Entry Sheet Layout

The entry sheet slides up from the bottom (iOS native pattern). The scoreboard remains partially visible above.

**Sheet structure (top to bottom):**

1. Drag handle
2. Sheet header — player name (Fraunces display) · current running total · round context chip (e.g. "Round 8 · wild 8s")
3. Live math bar — `prev + this round = new total` — updates on every keystroke
4. Score input — single large number field; label: "Round score"; always ≥ 0 (with optional override for negative house-rule corrections)
5. Confirm button — "Confirm Score" · disabled until the score field has a value

### 7.2 Interaction Behaviour

| Behaviour | Detail |
|---|---|
| Default focus | Score field receives focus immediately when sheet opens. |
| Score field constraint | Soft minimum of 0. A player who goes out enters 0. Negative entry is permitted with a visual warning for edge cases. |
| Live math bar | `prev + this round = new total`. Updates on every keystroke. New total shown large; turns ruby if negative (edge case). |
| Confirm button | Disabled until score field has a value (including 0). Label: "Confirm Score". |
| Post-confirm | Sheet closes. Player row gains a ✓ indicator showing their score is in for this round. |
| All scores in | "Complete Round" button in the game strip becomes active (host only). |

### 7.3 Live Math Bar

- Previous score shown in muted ink (read-only context)
- Round score shown in felt green; turns ruby if negative
- Result shown large; turns ruby if negative
- Previous score and new total use Fraunces display font for weight

### 7.4 Player Row Status

Each player row shows one of three states for the current round:

| State | Visual |
|---|---|
| Awaiting score | No indicator — tap arrow visible |
| Score entered (not yet advanced) | Small ✓ badge · score delta shown dimly beside the total |
| Round complete | Score confirmed — ✓ badge persists until next round opens |

---

## 8. Scoreboard

- Players listed in ascending order (lowest score first — i.e. the leader is at the top)
- Each row: avatar · name · current total · round status indicator · tap arrow (host / claimed player only)
- Score numerals use Fraunces display font
- Negative scores (edge case) displayed in ruby
- A player in the lead (lowest score) receives a subtle gold-left-blush highlight and a "Leading" badge
- Round progress strip always visible below the app bar — shows current round label prominently
- "Complete Round" button appears as a tappable action in the game strip once all players have scores — host only

> **Note on sort order:** Because lowest wins, the player with the fewest points is ranked first. The sort is ascending by total — the opposite of most NKS games.

---

## 9. Complete Round Button

The "Complete Round" button is a distinct action from individual score confirmation.

| State | Appearance | Behaviour |
|---|---|---|
| Scores incomplete | Dimmed / disabled · shows how many players are still needed (e.g. "2 remaining") | Non-interactive |
| All scores in | Active · felt green · label: "Complete Round →" | Advances to next round; updates round indicator |
| Final round (K) completed | Active · gold · label: "End Game →" | Triggers Game Over screen |

The button lives in the game strip area — always visible without scrolling — so the host can complete the round from the top of the scoreboard without needing to scroll down.

---

## 10. Game Over Screen

- Triggered after Round K is fully scored and the host taps "End Game"
- Hero section: trophy emoji · winner name · final score · note for ties or multiple finishers
- Subheading: "Lowest score wins — well played."
- Final standings list: placement number (gold 1st, silver 2nd, amber 3rd) · avatar · name · final score
- Negative finishers (edge case) shown with ruby score
- Round K delta shown for each player as context
- Actions: **New Game** (routes to Game Setup) · **End Night** (archives session)

---

## 11. Teams vs. Individual Players

5 Crowns supports both individual and team play. For scoring purposes, a team is entered as a single scored entry — identical to an individual player. No special data model distinction is required.

---

## 12. Angular Implementation Notes

### 12.1 Scoring Logic

Pure functions in a shared scoring utility — no side effects, fully unit-testable.

```typescript
const ROUNDS: RoundDef[] = [
  { label: '3',  cards: 3,  wild: '3s'    },
  { label: '4',  cards: 4,  wild: '4s'    },
  { label: '5',  cards: 5,  wild: '5s'    },
  { label: '6',  cards: 6,  wild: '6s'    },
  { label: '7',  cards: 7,  wild: '7s'    },
  { label: '8',  cards: 8,  wild: '8s'    },
  { label: '9',  cards: 9,  wild: '9s'    },
  { label: '10', cards: 10, wild: '10s'   },
  { label: 'J',  cards: 11, wild: 'Jacks' },
  { label: 'Q',  cards: 12, wild: 'Queens'},
  { label: 'K',  cards: 13, wild: 'Kings' },
];

calculateNewTotal(prev: number, roundScore: number): number
isRoundComplete(scores: Record<string, number | null>): boolean  // all players have a value
isGameOver(currentRound: number): boolean                        // currentRound === 11 and round complete
getWinner(totals: Record<string, number>): string | 'tie'        // lowest total wins
getRoundDef(currentRound: number): RoundDef                      // returns ROUNDS[currentRound - 1]
```

### 12.2 Component: `FiveCrownsScoreEntryComponent`

- Standalone component
- Inputs: `player`, `currentTotal`, `roundDef`, `onConfirm` callback
- Reactive form with one control: `roundScore` (soft min: 0)
- `liveTotal` signal: `computed(() => currentTotal + roundScore)`
- Emits `{ roundScore, newTotal }` on confirm — parent handles Firestore write

### 12.3 Component: `FiveCrownsScoreboardComponent`

- Reads from Firestore `rounds` collection; derives cumulative totals via `reduce`
- Players sorted ascending by total (lowest first)
- `roundComplete()` signal: `computed(() => all players have a score for current round)`
- `isLeading(playerId)` — signal: `true` when player has the lowest current total
- `roundDef` — `computed(() => getRoundDef(currentRound()))` · converts 1-based `currentRound` to 0-based index internally via `ROUNDS[currentRound - 1]`
- Opens `FiveCrownsScoreEntryComponent` in a bottom sheet on player row tap
- "Complete Round" button wired to `completeRound()` — increments `currentRound` (1-based), writes to Firestore
- Game over condition: `currentRound === 11 && roundComplete()`

### 12.4 Feature Branch

```
feature/scoring-5crowns
```

---

*Nobody's Keeping Score · Not that anyone's counting*
