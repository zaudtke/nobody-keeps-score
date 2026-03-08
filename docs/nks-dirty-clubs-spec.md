# Dirty Clubs — Scoring Rules & UI Design Spec
*Nobody's Keeping Score · Not that anyone's counting*

---

| | |
|---|---|
| **Project** | Nobody's Keeping Score (NKS) |
| **Game** | Dirty Clubs |
| **Stack** | Angular 21 · Tailwind CSS v4 · PWA |
| **Primary device** | iPhone SE / iPhone 17e · iPad |
| **Version** | 1.0 |
| **Date** | 2026-03-07 |

---

## 1. Overview

Dirty Clubs is a trump-based trick-taking card game for 3–6 players. Scoring is cumulative across hands within a single game. Players earn points by taking tricks, with the goal of reaching 15 points first. A monetary element tracks what each loser owes the winner at the end of each game.

---

## 2. Player Count

| Minimum | Maximum |
|---|---|
| 3 | 6 |

---

## 3. Score Formula

Each hand, one player wins the bid. All others either play or sit out. Points are calculated per player per hand based on their role and outcome.

### 3.1 Outcomes

| Outcome | Condition | Points | Bumps |
|---|---|---|---|
| **Did Not Play** | Player sat out the hand | +0 | 0 |
| **Won bid — met tricks** | Bid player took ≥ bid number of tricks | +tricks taken | 0 |
| **Won bid — missed tricks** | Bid player took < bid number of tricks | −5 (floor 0) | +1 |
| **Did not win bid — took tricks** | Non-bid player chose to play and took ≥ 1 trick | +tricks taken | 0 |
| **Did not win bid — took no tricks** | Non-bid player chose to play and took 0 tricks | −5 (floor 0) | +1 |
| **Shoot the Moon — success** | Bid player declared Moon and took all 5 tricks | Game over — shooter wins | 0 |
| **Shoot the Moon — failed** | Bid player declared Moon and took < 5 tricks | −5 (floor 0) | +2 |

### 3.2 Bid Constraints

| | |
|---|---|
| **Minimum bid** | 2 tricks |
| **Maximum bid** | 5 tricks |

### 3.3 Score Floor

A player's score cannot go below 0. A bump always results in the player's score being `max(0, currentScore − 5)`.

### 3.4 Bump Definition

A bump is a penalty event. It subtracts 5 points (floor 0) from the player's score **and** increments their bump count by the bump amount. The bump count is stored separately from the score and is never reset during a game.

---

## 4. Special Rules

### 4.1 Shoot the Moon

| Condition | Requirement |
|---|---|
| **Eligibility** | Player must already be "on the board" — must have at least 1 point OR at least 1 bump recorded |
| **Success** | Took all 5 tricks — shooter wins, game ends after the current hand completes |
| **Failure** | Took < 5 tricks — player receives −5 pts (floor 0) + 2 bumps |

> **Note:** "On the board" means the player has at least one point OR at least one bump. A player with score 0 and 0 bumps (never played a hand) is not eligible.

### 4.2 Forced Play

| Score | Rule |
|---|---|
| 13 or 14 | Player **must** play the hand — cannot choose Did Not Play |

The app enforces this by disabling the Did Not Play option in the entry sheet when the player's current score is 13 or 14.

---

## 5. Win Condition

| Scenario | Behaviour |
|---|---|
| **Single winner** | First player to reach ≥ 15 points wins. Game ends after the current hand completes. |
| **Multiple reach 15 in same hand** | Highest score wins. |
| **Tie** | Scores are equal — app notes the tie, tiebreaker resolved at the table. |
| **Shoot the Moon** | Shooter wins immediately regardless of scores — game ends after current hand. |

> **Note:** The app detects the win condition after each hand is submitted. All edge cases are handled on the Game Over screen.

---

## 6. Monetary Rules

Stakes are settled at the end of each game. Bump penalties are also settled per game — they do not accumulate across games in a session.

| Rule | Detail |
|---|---|
| **Base game fee** | Each loser pays the winner **$0.25** |
| **Bump penalty** | Each bump a player accumulated costs them **$0.10**, paid to the winner |
| **Did Not Play all game** | Still owes the $0.25 game fee to the winner (treated as a loser with score 0) |
| **Shoot the Moon payout** | Same as a normal win — $0.25 per loser + bump penalties |
| **Settlement timing** | Per game — not accumulated across the night's session |

### 6.1 Payout Formula (per loser)

```
amount owed = $0.25 + (bump count × $0.10)
```

### 6.2 Winner Total Formula

```
winner collects = (number of losers × $0.25) + (sum of all losers' bumps × $0.10)
```

---

## 7. Score Entry UI

### 7.1 Entry Method

The host taps a player row on the scoreboard to open that player's entry sheet. The sheet slides up from the bottom (iOS native bottom sheet pattern). The scoreboard remains partially visible above so all players can see standings while the host enters scores.

The host goes around the table, tapping each player in turn. One sheet opens at a time — confirming an entry closes the sheet and returns to the scoreboard.

### 7.2 Custom Numpad Layout

A purpose-built 8-button numpad replaces a generic number input. Each button maps directly to a game outcome — the app calculates the score delta and bump changes; the host never enters a raw number.

```
[ Did Not Play                        ]   ← full width · muted
[ 💥 Bump          ] [ 💥💥 Double   ]   ← ruby tones · 2 columns
[ 1  ] [ 2  ] [ 3  ]                      ← felt green numerals
[ 4  ] [ 5  ]                             ← felt green numerals
[ 🌙 Shoot the Moon                   ]   ← full width · special gradient
[ Confirm                             ]   ← full width · disabled until selection
```

### 7.3 Button Definitions

| Button | Outcome Applied | Score Delta | Bumps Added |
|---|---|---|---|
| Did Not Play | Sat out | +0 | 0 |
| Bump | Missed bid or played and took 0 tricks | −5 (floor 0) | +1 |
| Double Bump | Failed Shoot the Moon | −5 (floor 0) | +2 |
| 1 – 5 | Tricks taken | +n | 0 |
| Shoot the Moon | Moon declared and succeeded | Game over | 0 |

> **Note:** Buttons 1–5 cover all trick outcomes — whether the player won the bid or not. The app does not need to know who held the bid; the score entered reflects the actual tricks taken and the rules determine the delta.

### 7.4 Sheet Header

The sheet header shows the current player's context before any input:

| Element | Detail |
|---|---|
| Player name | Fraunces display font |
| Current score | Felt green numeral |
| Bump count | Ruby numeral |
| On board status | Implied by Moon button state — no separate label |

### 7.5 Interaction Behaviour

| Behaviour | Detail |
|---|---|
| Default state | No button selected · Confirm disabled |
| Selection | Tapping any button highlights it (selected state) · Confirm enables |
| Moon — disabled | When player is not on the board · greyed out · inline hint: "— not on board yet" |
| Moon — selected | Confirm button transforms: purple-to-green gradient · label: "🌙 Confirm Moon — Game ends after this hand" |
| Did Not Play — disabled | When player's score is 13 or 14 (forced play rule) · greyed out |
| Confirm | Closes sheet · updates score and bump count · checks win condition |
| Dismiss | Drag down or tap overlay · no changes applied |

---

## 8. Scoreboard

### 8.1 Player Row

Each player row shows:

| Element | Detail |
|---|---|
| Avatar | Initial letter · colour-coded per player |
| On board indicator | Small green dot on avatar corner when player has ≥ 1 pt or ≥ 1 bump |
| Player name | DM Sans · 600 weight |
| Forced play badge | "Must Play" in ruby · shown inline in name row when score is 13 or 14 |
| Bump pips | One filled ruby dot per bump · ghost circles pad remaining slots for consistent row height |
| Score progress bar | Thin track below bump pips · fills proportionally toward 15 · turns ruby when score is 13–14 |
| Score numeral | Fraunces display · felt green · ruby at 13–14 · gold when leading |
| Tap arrow | Faint › chevron · host view only |

### 8.2 Score States

| State | Visual Treatment |
|---|---|
| Score 0, no bumps | Score numeral at low opacity · "not on board yet" italic sub-label |
| Score 1–12 | Standard felt green numeral |
| Score 13–14 | Ruby numeral · ruby progress bar · "Must Play" badge · faint ruby left-blush on row |
| Leading player | Gold numeral |
| Score ≥ 15 | Game over triggered — does not display on scoreboard |

### 8.3 Game Header Strip

A slim strip below the app bar shows:

| Element | Detail |
|---|---|
| Game name | "♣ Dirty Clubs" |
| Hand counter | "Hand N" badge |
| Suit motif | ♠ ♥ ♦ ♣ decorative, muted |

---

## 9. Game Over Screen

Triggered when any player's score reaches ≥ 15 after a hand is confirmed, or when a Shoot the Moon succeeds.

### 9.1 Hero Section

| Win Type | Treatment |
|---|---|
| Normal win | Trophy emoji · "Winner" label · winner name (Fraunces) · final score |
| Shoot the Moon | Moon emoji · "🌙 Shoot the Moon!" banner · winner name · "All 5 tricks taken · game over" |

### 9.2 Payout List

One row per loser:

| Element | Detail |
|---|---|
| Avatar + name | Standard player identity |
| Breakdown | "$0.25 game + $0.XX (N bumps)" · bump amount in ruby |
| Amount owed | Fraunces numeral · ruby colour |

Footer row:

| Element | Detail |
|---|---|
| "Winner collects" label | DM Sans · medium weight |
| Total amount | Fraunces · gold colour |

### 9.3 Actions

| Button | Action |
|---|---|
| **Next Game** (primary · felt green) | Routes to Game Setup |
| **End Night** (secondary · outline) | Archives the session |

---

## 10. Angular Implementation Notes

### 10.1 Scoring Logic

Pure functions in a shared scoring utility — no side effects, fully unit-testable.

```typescript
type HandOutcome =
  | 'dnp'           // Did Not Play
  | 'tricks'        // tricks taken (1–5)
  | 'bump'          // missed bid or took no tricks
  | 'double_bump'   // failed Shoot the Moon
  | 'moon';         // Shoot the Moon success

interface HandResult {
  scoreDelta: number;   // change to apply (may be negative)
  newScore: number;     // max(0, currentScore + scoreDelta)
  bumpsAdded: number;   // 0, 1, or 2
  newBumpCount: number; // running total
  gameOver: boolean;
  moonWin: boolean;
}

calculateHandResult(
  currentScore: number,
  currentBumps: number,
  outcome: HandOutcome,
  tricks?: number        // required when outcome === 'tricks'
): HandResult

isOnBoard(score: number, bumps: number): boolean   // score > 0 || bumps > 0
isForcedPlay(score: number): boolean               // score === 13 || score === 14
isGameOver(scores: number[]): boolean              // any score >= 15
getWinner(scores: Record<string, number>): string | 'tie'

calculatePayout(
  players: Record<string, { score: number; bumps: number }>,
  winnerId: string
): Record<string, number>   // playerId → amount owed in cents
```

### 10.2 Component: `DirtyClubsScoreEntryComponent`

- Standalone component · bottom sheet
- Inputs: `player`, `currentScore`, `currentBumps`, `onConfirm` callback
- `isOnBoard` signal: `computed(() => isOnBoard(currentScore, currentBumps))`
- `isForcedPlay` signal: `computed(() => isForcedPlay(currentScore))`
- `selectedOutcome` signal: `HandOutcome | null`
- `moonWin` signal: `computed(() => selectedOutcome() === 'moon')`
- Emits `HandResult` on confirm — parent handles Firestore write and win detection

### 10.3 Component: `DirtyClubsScoreboardComponent`

- Reads from Firestore `rounds` collection; derives cumulative totals and bump counts via `reduce`
- `onBoard(playerId)` — derived signal
- `forcedPlay(playerId)` — derived signal
- `leader()` — derived signal: playerId with highest score
- Opens `DirtyClubsScoreEntryComponent` in a bottom sheet on player row tap (host / claimed player only)
- Detects game over after each round write; routes to Game Over screen

### 10.4 Component: `DirtyClubsPayoutComponent`

- Inputs: `players`, `winnerId`, `moonWin`
- Calls `calculatePayout()` to derive amounts
- Displays hero, payout list, and total
- Emits `nextGame` or `endNight` on action tap

### 10.5 Feature Branch

```
feature/scoring-dirty-clubs
```

---

*Nobody's Keeping Score · Not that anyone's counting*
