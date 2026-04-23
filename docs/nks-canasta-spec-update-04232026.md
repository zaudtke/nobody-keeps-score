# Canasta Scoring UI — Flow Update
*Nobody's Keeping Score · Change Record*

---

| | |
|---|---|
| **Date** | 2026-04-23 |
| **Branch** | `feature/canasta-two-phase-scoring` |
| **Updates** | `docs/nks-canasta-spec.md` · `design/nks-canasta-mockup.html` |

---

## Problem

The original single-player entry flow (tap player → enter Base + Score → confirm) assumes one player scores completely before the next begins. In practice, Canasta scoring is parallel: all players count simultaneously but finish at different speeds.

**Real-world example (3 players: Kim, Kelly, Allen):**
After a round ends, Kim starts counting while Kelly and Allen wait — they can't score until Kim is done with the shared entry flow. This creates a queue at the table and wastes time.

---

## Decision

Replace the single-step per-player sheet with a **two-phase round scoring flow**.

### Phase 1 — Base Entry (all players, quick)

- A "Score Round" button on the scoreboard opens a bottom sheet (slides up) listing all players
- Each player row shows only their Base input field
- Base defaults to 0 — if nothing is entered, 0 is used
- A single **"Lock Bases & Start Scores"** button at the bottom confirms all bases and dismisses the sheet
- This phase is fast: base does not require counting cards, so the whole table completes it immediately

### Phase 2 — Score Entry (per player, any order)

- The scoreboard returns to its normal view — no per-player pending indicator (would be visual noise)
- As each player finishes counting their cards, the host taps that player's row
- Their entry sheet opens with:
  - Base already locked and reflected in the live math bar (`prev + base + score = result`)
  - Only the **Score** field visible for input
- Confirm closes that player's sheet and updates their running total
- Players can be scored in any order; repeat until all are done

---

## What Does Not Change

- Score formula: `New Total = Previous Score + Base + Score`
- Meld threshold logic and badge display
- Live math bar behavior
- Win condition detection
- Round history table
- Game Over screen

---

## UI Changes Summary

| Screen / Element | Before | After |
|---|---|---|
| Scoreboard player row tap | Opens full Base + Score sheet | Opens Score-only sheet (Phase 2) |
| New: "Score Round" button | — | Triggers Phase 1 batch base sheet |
| Phase 1 sheet | — | Slide-up, all players listed, Base inputs only |
| Phase 2 sheet | Base + Score fields | Score field only; Base shown read-only in math bar |
| Player row (pending state) | — | No change (intentional — avoids noise) |

---

*Nobody's Keeping Score · Not that anyone's counting*
