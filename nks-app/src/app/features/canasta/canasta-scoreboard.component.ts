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
import { CanastaGameService } from './canasta-game.service';
import { buildCanastaGameOverResult, calculateNewTotal, getMeldTier, isGameOver } from './canasta.utils';
import type {
  CanastaGameOverResult,
  CanastaPlayerScore,
  CanastaPlayerStanding,
  CanastaRound,
} from './canasta.model';
import { CanastaPlayerRowComponent } from './components/canasta-player-row.component';
import {
  CanastaScoreEntryComponent,
  type CanastaScoreEntryResult,
} from './components/canasta-score-entry.component';
import { CanastaGameOverComponent } from './components/canasta-game-over.component';
import { Player } from '../../core/models/player.model';

interface PendingEntry {
  base: number;
  score: number;
}

@Component({
  selector: 'app-canasta-scoreboard',
  standalone: true,
  imports: [CanastaPlayerRowComponent, CanastaScoreEntryComponent, CanastaGameOverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col h-full bg-cream-50 dark:bg-ink-950' },
  template: `
    @if (gameOver(); as result) {
      <!-- ─── Game Over ─── -->
      <app-canasta-game-over [result]="result" (nextGame)="onNextGame()" (endNight)="onEndNight()" />
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
          <p class="font-display font-bold text-[1rem] text-cream-100">Canasta</p>
          <small
            class="block font-body font-light text-[0.58rem] tracking-[0.04em] opacity-65 text-cream-100"
          >
            Round {{ roundNumber() }}
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
          🃏 Canasta
        </span>
        <span
          class="font-body text-[0.72rem] font-semibold px-2 py-0.5 rounded-full
                 bg-felt-100 text-felt-700 dark:bg-[rgba(26,127,75,0.2)] dark:text-felt-400"
        >
          Round {{ roundNumber() }}
        </span>
        <span
          class="text-[0.82rem] text-ink-300 dark:text-ink-700 tracking-wide"
          aria-hidden="true"
        >
          ♠ ♥ ♦ ♣
        </span>
      </div>

      <!-- Scrollable body -->
      <div class="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <!-- Standings -->
        <div class="px-3 pt-3 pb-2 flex flex-col gap-1.5">
          <p
            class="text-[0.62rem] font-semibold tracking-[0.09em] uppercase
                   text-ink-400 dark:text-ink-600 px-1 pb-1"
          >
            Standings · Goal 5,000
          </p>

          @for (standing of standings(); track standing.playerId) {
            <app-canasta-player-row
              [standing]="standing"
              [pending]="pendingEntries()[standing.playerId] !== undefined"
              [isLeader]="leaderId() === standing.playerId"
              (tap)="openEntry(standing)"
            />
          }
        </div>

        <!-- Round History -->
        @if (rounds().length > 0) {
          <div class="px-3 pt-2 pb-4">
            <p
              class="text-[0.62rem] font-semibold tracking-[0.09em] uppercase
                     text-ink-400 dark:text-ink-600 px-1 pb-2"
            >
              Round History
            </p>
            <div
              class="rounded-[12px] overflow-hidden
                     bg-white dark:bg-ink-900
                     shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none"
            >
              <!-- Header row -->
              <div
                class="flex items-center px-3 py-1.5 border-b border-cream-100 dark:border-ink-800
                       bg-cream-50 dark:bg-ink-950"
              >
                <span class="text-[0.6rem] text-ink-400 dark:text-ink-600 w-9 shrink-0">Rnd</span>
                @for (p of players(); track p.id) {
                  <span
                    class="flex-1 text-center text-[0.65rem] font-semibold text-ink-500 dark:text-ink-500 truncate"
                  >
                    {{ p.name }}
                  </span>
                }
              </div>
              <!-- Data rows -->
              @for (row of roundHistory(); track row.roundNumber) {
                <div
                  class="flex items-center px-3 py-1.5 border-b border-cream-100/60 dark:border-ink-800/60 last:border-0"
                >
                  <span class="text-[0.6rem] text-ink-400 dark:text-ink-600 w-9 shrink-0">
                    {{ row.roundNumber }}
                  </span>
                  @for (delta of row.deltas; track $index) {
                    <span
                      class="flex-1 text-center font-display text-[0.7rem] font-semibold"
                      [class]="deltaClasses(delta)"
                    >
                      {{ delta === null ? '—' : (delta > 0 ? '+' : '') + delta }}
                    </span>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Submit Round CTA -->
      @if (allEntered()) {
        <div
          class="shrink-0 px-3 pt-2 pb-4 bg-cream-50 dark:bg-ink-950
                 border-t border-cream-100 dark:border-ink-900
                 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            [disabled]="submitting()"
            (click)="submitRound()"
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
              >🃏</span
            >
            {{ submitting() ? 'Saving…' : 'Submit Round ' + roundNumber() }}
          </button>
          <p class="text-center text-[0.63rem] mt-1.5 text-ink-400 dark:text-ink-700">
            All {{ standings().length }} players entered
          </p>
        </div>
      }

      <!-- Score entry sheet -->
      @if (openSheetStanding(); as s) {
        <app-canasta-score-entry
          [playerName]="s.name"
          [currentScore]="s.total"
          (confirmed)="onEntryConfirmed(s.playerId, $event)"
          (dismiss)="openSheetStanding.set(null)"
        />
      }
    }
  `,
})
export class CanastaScoreboardComponent implements OnInit {
  sessionId = input.required<string>();
  gameId = input.required<string>();
  players = input.required<Player[]>();
  currentRound = input.required<number>();

  back = output<void>();
  navigateToSetup = output<string>();
  sessionArchived = output<void>();

  private gameService = inject(CanastaGameService);
  private destroyRef = inject(DestroyRef);

  // ── Local state ──────────────────────────────────────────────────
  protected openSheetStanding = signal<CanastaPlayerStanding | null>(null);
  protected pendingEntries = signal<Record<string, PendingEntry>>({});
  protected submitting = signal(false);
  protected gameOver = signal<CanastaGameOverResult | null>(null);

  // ── Rounds from Firestore ────────────────────────────────────────
  protected rounds = signal<CanastaRound[]>([]);

  ngOnInit(): void {
    this.gameService
      .getRounds$(this.sessionId(), this.gameId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rounds) => this.rounds.set(rounds));
  }

  // ── Derived standings ────────────────────────────────────────────
  protected standings = computed((): CanastaPlayerStanding[] => {
    const allRounds = this.rounds();
    return this.players().map((p, idx) => {
      let total = 0;
      for (let i = allRounds.length - 1; i >= 0; i--) {
        const ps = allRounds[i].scores[p.id];
        if (ps !== undefined) {
          total = ps.newTotal;
          break;
        }
      }
      return {
        playerId: p.id,
        name: p.name,
        order: idx + 1,
        total,
        meldTier: getMeldTier(total),
      };
    });
  });

  protected leaderId = computed((): string | null => {
    const s = this.standings();
    if (s.every((p) => p.total === 0)) return null;
    const max = Math.max(...s.map((p) => p.total));
    const leaders = s.filter((p) => p.total === max);
    return leaders.length === 1 ? leaders[0].playerId : null;
  });

  protected roundNumber = computed(() => this.currentRound());

  protected allEntered = computed(() => {
    const pending = this.pendingEntries();
    return this.players().length > 0 && this.players().every((p) => pending[p.id] !== undefined);
  });

  protected roundHistory = computed(() =>
    this.rounds().map((round) => ({
      roundNumber: round.roundNumber,
      deltas: this.players().map((p) => {
        const s = round.scores[p.id];
        return s !== undefined ? s.base + s.score : null;
      }),
    })),
  );

  // ── Interactions ─────────────────────────────────────────────────
  protected openEntry(standing: CanastaPlayerStanding): void {
    this.openSheetStanding.set(standing);
  }

  protected onEntryConfirmed(playerId: string, result: CanastaScoreEntryResult): void {
    this.pendingEntries.update((map) => ({
      ...map,
      [playerId]: { base: result.base, score: result.score },
    }));
    this.openSheetStanding.set(null);
  }

  protected async submitRound(): Promise<void> {
    if (!this.allEntered() || this.submitting()) return;
    this.submitting.set(true);

    const pending = this.pendingEntries();
    const currentStandings = this.standings();
    const scores: Record<string, CanastaPlayerScore> = {};

    for (const standing of currentStandings) {
      const entry = pending[standing.playerId];
      const newTotal = calculateNewTotal(standing.total, entry.base, entry.score);
      scores[standing.playerId] = {
        base: entry.base,
        score: entry.score,
        newTotal,
      };
    }

    try {
      await this.gameService.submitRound(
        this.sessionId(),
        this.gameId(),
        this.roundNumber(),
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
      total: scores[s.playerId].newTotal,
      meldTier: getMeldTier(scores[s.playerId].newTotal),
    }));

    if (isGameOver(updatedStandings)) {
      // Set game-over UI first to prevent parent's Firestore listener from
      // destroying this component before the game-over screen is shown.
      this.gameOver.set(buildCanastaGameOverResult(updatedStandings));
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

  protected deltaClasses(delta: number | null): string {
    if (delta === null) return 'text-ink-300 dark:text-ink-700';
    if (delta > 0) return 'text-felt-600 dark:text-felt-400';
    if (delta < 0) return 'text-ruby-600 dark:text-ruby-400';
    return 'text-ink-400 dark:text-ink-600';
  }
}
