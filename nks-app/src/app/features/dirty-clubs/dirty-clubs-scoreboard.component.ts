import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DirtyClubsGameService } from './dirty-clubs-game.service';
import { buildGameOverResult, calculateHandResult, resolveWinnerId } from './dirty-clubs.utils';
import type {
  DirtyClubsPlayerScore,
  GameOverResult,
  HandOutcome,
  PlayerStanding,
} from './dirty-clubs.model';
import { DcPlayerRowComponent } from './components/dc-player-row.component';
import {
  DcScoreEntryComponent,
  type ScoreEntryResult,
} from './components/dc-score-entry.component';
import { DcGameOverComponent } from './components/dc-game-over.component';
import { Player } from '../../core/models/player.model';

interface PendingEntry {
  outcome: HandOutcome;
  tricksValue: number;
}

@Component({
  selector: 'app-dirty-clubs-scoreboard',
  standalone: true,
  imports: [DcPlayerRowComponent, DcScoreEntryComponent, DcGameOverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col h-full bg-cream-50 dark:bg-ink-950' },
  template: `
    @if (gameOver(); as result) {
      <!-- ─── Game Over ─── -->
      <app-dc-game-over [result]="result" (nextGame)="onNextGame()" (endNight)="onEndNight()" />
    } @else {
      <!-- ─── App Bar ─── -->
      <header
        class="flex items-center justify-between px-4 py-2.5 shrink-0
               bg-felt-600 dark:bg-ink-900"
      >
        <button
          (click)="back.emit()"
          aria-label="Back"
          class="w-8 h-8 rounded-full flex items-center justify-center
                 text-white text-[1rem] leading-none cursor-pointer outline-none
                 bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(255,255,255,0.07)]
                 focus-visible:ring-2 focus-visible:ring-white"
        >
          ‹
        </button>
        <div class="text-center">
          <p class="font-display font-bold text-[1rem] text-cream-100">Dirty Clubs</p>
          <small
            class="block font-body font-light text-[0.58rem] tracking-[0.04em] opacity-65 text-cream-100"
          >
            Hand {{ handNumber() }}
          </small>
        </div>
        <div class="w-8" aria-hidden="true"></div>
      </header>

      <!-- Game strip -->
      <div
        class="flex items-center justify-between px-4 py-2 shrink-0
                  bg-felt-700/30 dark:bg-ink-900/60 border-b border-felt-600/20 dark:border-ink-800"
      >
        <span class="font-display text-[0.75rem] font-semibold text-felt-700 dark:text-felt-500">
          ♣ Dirty Clubs
        </span>
        <span
          class="font-body text-[0.72rem] font-semibold px-2 py-0.5 rounded-full
                     bg-felt-100 text-felt-700 dark:bg-[rgba(26,127,75,0.2)] dark:text-felt-400"
        >
          Hand {{ handNumber() }}
        </span>
        <span
          class="text-[0.82rem] text-ink-300 dark:text-ink-700 tracking-wide"
          aria-hidden="true"
        >
          ♠ ♥ ♦ ♣
        </span>
      </div>

      <!-- Scrollable player list -->
      <div class="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="px-3 pt-3 pb-2 flex flex-col gap-1.5">
          <p
            class="text-[0.62rem] font-semibold tracking-[0.09em] uppercase
                    text-ink-400 dark:text-ink-600 px-1 pb-1"
          >
            Standings
          </p>

          @for (standing of standings(); track standing.playerId) {
            <app-dc-player-row
              [standing]="standing"
              [pending]="pendingEntries()[standing.playerId] !== undefined"
              [isLeader]="leaderId() === standing.playerId"
              (tap)="openEntry(standing)"
            />
          }
        </div>
      </div>

      <!-- Submit Hand CTA -->
      @if (allEntered()) {
        <div
          class="shrink-0 px-3 pt-2 pb-4 bg-cream-50 dark:bg-ink-950
                    border-t border-cream-100 dark:border-ink-900
                    pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            [disabled]="submitting()"
            (click)="submitHand()"
            class="relative w-full py-3.5 px-4 rounded-[12px] font-display text-[1rem]
                   font-semibold text-white cursor-pointer outline-none
                   bg-linear-to-br from-felt-600 to-felt-700
                   shadow-[0_4px_16px_rgba(26,127,75,0.25)]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus-visible:ring-2 focus-visible:ring-felt-400"
          >
            <span
              class="absolute right-4 text-[1.4rem] opacity-[0.15] leading-none
                         pointer-events-none select-none"
              aria-hidden="true"
              >♣</span
            >
            {{ submitting() ? 'Saving…' : 'Submit Hand ' + handNumber() }}
          </button>
          <p class="text-center text-[0.63rem] mt-1.5 text-ink-400 dark:text-ink-700">
            All {{ standings().length }} players entered
          </p>
        </div>
      }

      <!-- Score entry sheet -->
      @if (openSheetStanding(); as s) {
        <app-dc-score-entry
          [playerName]="s.name"
          [currentScore]="s.score"
          [currentBumps]="s.bumps"
          (confirmed)="onEntryConfirmed(s.playerId, $event)"
          (dismiss)="openSheetStanding.set(null)"
        />
      }
    }
  `,
})
export class DirtyClubsScoreboardComponent implements OnInit {
  sessionId = input.required<string>();
  gameId = input.required<string>();
  players = input.required<Player[]>();
  currentRound = input.required<number>();

  back = output<void>();
  navigateToSetup = output<string>(); // emits sessionId for "Next Game"
  sessionArchived = output<void>();

  private gameService = inject(DirtyClubsGameService);
  private destroyRef = inject(DestroyRef);

  // ── Local state ──────────────────────────────────────────────────
  protected openSheetStanding = signal<PlayerStanding | null>(null);
  protected pendingEntries = signal<Record<string, PendingEntry>>({});
  protected submitting = signal(false);
  protected gameOver = signal<GameOverResult | null>(null);

  // ── Rounds from Firestore ────────────────────────────────────────
  private rounds = signal<import('./dirty-clubs.model').DirtyClubsRound[]>([]);

  ngOnInit(): void {
    this.gameService
      .getRounds$(this.sessionId(), this.gameId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rounds) => this.rounds.set(rounds));
  }

  // ── Derived standings ────────────────────────────────────────────
  protected standings = computed((): PlayerStanding[] => {
    const allRounds = this.rounds();
    return this.players().map((p, idx) => {
      const score = allRounds.reduce((acc, r) => r.scores[p.id]?.newScore ?? acc, 0);
      const bumps = allRounds.reduce((acc, r) => r.scores[p.id]?.newBumpCount ?? acc, 0);
      return { playerId: p.id, name: p.name, order: idx + 1, score, bumps };
    });
  });

  protected leaderId = computed((): string | null => {
    const s = this.standings();
    if (s.every((p) => p.score === 0 && p.bumps === 0)) return null;
    const max = Math.max(...s.map((p) => p.score));
    if (max === 0) return null;
    const leaders = s.filter((p) => p.score === max);
    return leaders.length === 1 ? leaders[0].playerId : null;
  });

  protected handNumber = computed(() => this.currentRound());

  protected allEntered = computed(() => {
    const pending = this.pendingEntries();
    return this.players().length > 0 && this.players().every((p) => pending[p.id] !== undefined);
  });

  // ── Interactions ─────────────────────────────────────────────────
  protected openEntry(standing: PlayerStanding): void {
    this.openSheetStanding.set(standing);
  }

  protected onEntryConfirmed(playerId: string, result: ScoreEntryResult): void {
    this.pendingEntries.update((map) => ({
      ...map,
      [playerId]: { outcome: result.outcome, tricksValue: result.tricksValue },
    }));
    this.openSheetStanding.set(null);
  }

  protected async submitHand(): Promise<void> {
    if (!this.allEntered() || this.submitting()) return;
    this.submitting.set(true);

    const pending = this.pendingEntries();
    const currentStandings = this.standings();
    const scores: Record<string, DirtyClubsPlayerScore> = {};
    let moonWin = false;
    let moonShooterId: string | undefined;

    for (const standing of currentStandings) {
      const entry = pending[standing.playerId];
      const result = calculateHandResult(
        standing.score,
        standing.bumps,
        entry.outcome,
        entry.tricksValue,
      );

      if (result.moonWin) {
        moonWin = true;
        moonShooterId = standing.playerId;
      }

      scores[standing.playerId] = {
        outcome: entry.outcome,
        tricksValue: entry.tricksValue,
        scoreDelta: result.scoreDelta,
        newScore: result.newScore,
        bumpsAdded: result.bumpsAdded,
        newBumpCount: result.newBumpCount,
      };
    }

    try {
      await this.gameService.submitRound(
        this.sessionId(),
        this.gameId(),
        this.handNumber(),
        moonWin,
        scores,
      );
    } catch {
      this.submitting.set(false);
      return;
    }

    this.pendingEntries.set({});

    // Check win condition
    const updatedStandings = currentStandings.map((s) => ({
      ...s,
      score: scores[s.playerId].newScore,
      bumps: scores[s.playerId].newBumpCount,
    }));

    const winnerId = resolveWinnerId(updatedStandings, moonWin, moonShooterId);

    if (winnerId) {
      // Set game-over UI first so the parent's Firestore listener (which will emit null
      // once status flips to 'complete') cannot destroy this component before the
      // game-over screen is shown.
      this.gameOver.set(buildGameOverResult(updatedStandings, winnerId, moonWin));
      await this.gameService.completeGame(this.sessionId(), this.gameId());
    }

    this.submitting.set(false);
  }

  protected onNextGame(): void {
    this.navigateToSetup.emit(this.sessionId());
  }

  protected async onEndNight(): Promise<void> {
    this.sessionArchived.emit();
  }
}
