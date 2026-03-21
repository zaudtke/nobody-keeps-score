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
import { OpenScorerGameService } from './open-scorer-game.service';
import { buildOpenScorerGameOverResult } from './open-scorer.utils';
import type {
  OpenScorerGameOverResult,
  OpenScorerPlayerStanding,
  OpenScorerRound,
  WinDirection,
} from './open-scorer.model';
import { OpenScorerPlayerRowComponent } from './components/open-scorer-player-row.component';
import {
  OpenScorerScoreEntryComponent,
  type OpenScorerScoreEntryResult,
} from './components/open-scorer-score-entry.component';
import { OpenScorerGameOverComponent } from './components/open-scorer-game-over.component';
import { Player } from '../../core/models/player.model';
import type { GameConfig } from '../../core/models/game.model';

@Component({
  selector: 'app-open-scorer-scoreboard',
  standalone: true,
  imports: [OpenScorerPlayerRowComponent, OpenScorerScoreEntryComponent, OpenScorerGameOverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col h-full bg-cream-50 dark:bg-ink-950' },
  template: `
    @if (gameOver(); as result) {
      <!-- ─── Game Over ─── -->
      <app-open-scorer-game-over
        [result]="result"
        (nextGame)="onNextGame()"
        (endNight)="onEndNight()"
      />
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
          <p class="font-display font-bold text-[1rem] text-cream-100">{{ gameName() }}</p>
          <small
            class="block font-body font-light text-[0.58rem] tracking-[0.04em] opacity-65 text-cream-100"
          >
            Open scorer
          </small>
        </div>
        <div class="w-8" aria-hidden="true"></div>
      </header>

      <!-- ─── Game Strip ─── -->
      <div
        class="shrink-0 px-4 py-2
               bg-felt-700/30 dark:bg-ink-900/60
               border-b border-felt-600/20 dark:border-ink-800"
      >
        <!-- Row 1: round + win direction chip -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span
              class="font-body text-[0.72rem] font-semibold px-2 py-0.5 rounded-full
                     bg-felt-100 text-felt-700 dark:bg-[rgba(26,127,75,0.2)] dark:text-felt-400"
            >
              Round {{ currentRound() }}
            </span>
            <!-- Win direction chip -->
            <span
              class="text-[0.6rem] font-bold tracking-[0.04em] px-2 py-0.5 rounded-full"
              [class]="winDirection() === 'high'
                ? 'bg-felt-100 text-felt-700 dark:bg-[rgba(26,127,75,0.2)] dark:text-felt-400'
                : 'bg-amber-100 text-amber-700 dark:bg-[rgba(217,119,6,0.15)] dark:text-amber-400'"
            >
              {{ winDirection() === 'high' ? '↑ High wins' : '↓ Low wins' }}
            </span>
          </div>

          <!-- End Game (always active) -->
          <button
            type="button"
            [disabled]="endingGame()"
            (click)="onEndGame()"
            class="px-3 py-1.5 rounded-[8px] font-body text-[0.72rem] font-semibold
                   border border-ruby-300 dark:border-ruby-800
                   text-ruby-600 dark:text-ruby-400
                   cursor-pointer outline-none transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus-visible:ring-2 focus-visible:ring-ruby-400"
          >
            {{ endingGame() ? 'Ending…' : 'End Game' }}
          </button>
        </div>

        <!-- Row 2: Complete Round button or remaining count -->
        <div class="flex items-center justify-end">
          @if (allConfirmed()) {
            <button
              type="button"
              [disabled]="completingRound()"
              (click)="onCompleteRound()"
              class="px-3.5 py-1.5 rounded-[8px] font-display text-[0.78rem] font-semibold
                     text-white bg-felt-600 dark:bg-felt-700
                     shadow-[0_2px_8px_rgba(26,127,75,0.25)]
                     cursor-pointer outline-none transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus-visible:ring-2 focus-visible:ring-felt-400"
            >
              {{ completingRound() ? 'Saving…' : 'Complete Round →' }}
            </button>
          } @else {
            <span class="text-[0.68rem] text-ink-400 dark:text-ink-600">
              {{ remainingCount() }} remaining
            </span>
          }
        </div>
      </div>

      <!-- ─── Scrollable body ─── -->
      <div class="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <!-- Standings -->
        <div class="px-3 pt-3 pb-2 flex flex-col gap-1.5">
          <p
            class="text-[0.62rem] font-semibold tracking-[0.09em] uppercase
                   text-ink-400 dark:text-ink-600 px-1 pb-1"
          >
            Standings
          </p>

          @for (standing of standings(); track standing.playerId) {
            <app-open-scorer-player-row
              [standing]="standing"
              [isLeader]="leaderId() === standing.playerId"
              (tap)="openEntry(standing)"
            />
          }
        </div>

        <!-- Round History -->
        @if (completedRounds().length > 0) {
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
              @for (row of roundHistoryRows(); track row.roundNumber) {
                <div
                  class="flex items-center px-3 py-1.5 border-b border-cream-100/60 dark:border-ink-800/60 last:border-0"
                >
                  <span class="text-[0.6rem] text-ink-400 dark:text-ink-600 w-9 shrink-0">
                    {{ row.roundNumber }}
                  </span>
                  @for (score of row.scores; track $index) {
                    <span
                      class="flex-1 text-center font-display text-[0.7rem] font-semibold"
                      [class]="score === null
                        ? 'text-ink-300 dark:text-ink-700'
                        : score < 0
                          ? 'text-ruby-500 dark:text-ruby-400'
                          : 'text-ink-600 dark:text-ink-400'"
                    >
                      {{ score === null ? '—' : (score >= 0 ? '+' : '') + score }}
                    </span>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Score entry sheet -->
      @if (openSheetStanding(); as s) {
        <app-open-scorer-score-entry
          [playerName]="s.name"
          [currentTotal]="s.total"
          [winDirection]="winDirection()"
          (confirmed)="onEntryConfirmed(s.playerId, $event)"
          (dismiss)="openSheetStanding.set(null)"
        />
      }
    }
  `,
})
export class OpenScorerScoreboardComponent implements OnInit {
  sessionId = input.required<string>();
  gameId = input.required<string>();
  players = input.required<Player[]>();
  currentRound = input.required<number>();
  config = input.required<GameConfig>();

  back = output<void>();
  navigateToSetup = output<string>();
  sessionArchived = output<void>();

  private gameService = inject(OpenScorerGameService);
  private destroyRef = inject(DestroyRef);

  // ── Local state ──────────────────────────────────────────────────
  protected openSheetStanding = signal<OpenScorerPlayerStanding | null>(null);
  protected completingRound = signal(false);
  protected endingGame = signal(false);
  protected gameOver = signal<OpenScorerGameOverResult | null>(null);

  // ── Rounds from Firestore ────────────────────────────────────────
  protected rounds = signal<OpenScorerRound[]>([]);

  ngOnInit(): void {
    this.gameService
      .getRounds$(this.sessionId(), this.gameId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rounds) => this.rounds.set(rounds));
  }

  // ── Config helpers ────────────────────────────────────────────────

  protected winDirection = computed((): WinDirection => this.config().winDirection);

  protected gameName = computed(() => this.config().gameName?.trim() || 'Open Game');

  // ── Derived data ─────────────────────────────────────────────────

  /** Rounds before the current round (fully completed) */
  protected completedRounds = computed(() =>
    this.rounds().filter((r) => r.roundNumber < this.currentRound()),
  );

  /** The current round's doc (may have partial scores or not exist yet) */
  protected currentRoundDoc = computed(() =>
    this.rounds().find((r) => r.roundNumber === this.currentRound()) ?? null,
  );

  /** Standings sorted by win direction */
  protected standings = computed((): OpenScorerPlayerStanding[] => {
    const completed = this.completedRounds();
    const currentDoc = this.currentRoundDoc();
    const direction = this.winDirection();

    const result = this.players().map((p, idx) => {
      const total = completed.reduce((sum, round) => {
        const score = round.scores[p.id];
        return sum + (score !== undefined ? score : 0);
      }, 0);

      const roundScore = currentDoc?.scores[p.id] !== undefined
        ? currentDoc.scores[p.id]
        : null;

      return {
        playerId: p.id,
        name: p.name,
        order: idx + 1,
        total,
        roundScore,
      } satisfies OpenScorerPlayerStanding;
    });

    return result.sort((a, b) =>
      direction === 'high' ? b.total - a.total : a.total - b.total,
    );
  });

  /** The leading player's id (null if all tied at 0) */
  protected leaderId = computed((): string | null => {
    const s = this.standings();
    if (s.every((p) => p.total === 0)) return null;
    if (s.length === 0) return null;
    const topScore = s[0].total; // already sorted
    const leaders = s.filter((p) => p.total === topScore);
    return leaders.length === 1 ? leaders[0].playerId : null;
  });

  protected allConfirmed = computed(() => {
    const doc = this.currentRoundDoc();
    if (!doc) return false;
    return this.players().every((p) => doc.scores[p.id] !== undefined);
  });

  protected remainingCount = computed(() => {
    const doc = this.currentRoundDoc();
    const confirmed = doc ? Object.keys(doc.scores).length : 0;
    return this.players().length - confirmed;
  });

  protected roundHistoryRows = computed(() =>
    this.completedRounds().map((round) => ({
      roundNumber: round.roundNumber,
      scores: this.players().map((p) =>
        round.scores[p.id] !== undefined ? round.scores[p.id] : null,
      ),
    })),
  );

  // ── Interactions ─────────────────────────────────────────────────

  protected openEntry(standing: OpenScorerPlayerStanding): void {
    this.openSheetStanding.set(standing);
  }

  protected async onEntryConfirmed(
    playerId: string,
    result: OpenScorerScoreEntryResult,
  ): Promise<void> {
    this.openSheetStanding.set(null);
    await this.gameService.confirmPlayerScore(
      this.sessionId(),
      this.gameId(),
      this.currentRound(),
      playerId,
      result.turnScore,
    );
  }

  protected async onCompleteRound(): Promise<void> {
    if (!this.allConfirmed() || this.completingRound()) return;
    this.completingRound.set(true);
    try {
      await this.gameService.completeRound(this.sessionId(), this.gameId());
    } catch {
      // ignore — Firestore listener will keep state consistent
    }
    this.completingRound.set(false);
  }

  protected async onEndGame(): Promise<void> {
    if (this.endingGame()) return;
    this.endingGame.set(true);

    // Build game-over result from current standings before Firestore write
    // to prevent the parent destroying this component before game-over renders.
    this.gameOver.set(
      buildOpenScorerGameOverResult(this.standings(), this.winDirection()),
    );

    try {
      await this.gameService.completeGame(this.sessionId(), this.gameId());
    } catch {
      this.gameOver.set(null);
      this.endingGame.set(false);
    }
  }

  protected onNextGame(): void {
    this.navigateToSetup.emit(this.sessionId());
  }

  protected async onEndNight(): Promise<void> {
    this.sessionArchived.emit();
  }
}
