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
import { FiveCrownsGameService } from './five-crowns-game.service';
import { ROUNDS, buildFiveCrownsGameOverResult, getRoundDef } from './five-crowns.utils';
import type {
  FiveCrownsGameOverResult,
  FiveCrownsPlayerStanding,
  FiveCrownsRound,
} from './five-crowns.model';
import { FiveCrownsPlayerRowComponent } from './components/five-crowns-player-row.component';
import {
  FiveCrownsScoreEntryComponent,
  type FiveCrownsScoreEntryResult,
} from './components/five-crowns-score-entry.component';
import { FiveCrownsGameOverComponent } from './components/five-crowns-game-over.component';
import { Player } from '../../core/models/player.model';

const TOTAL_ROUNDS = 11;

@Component({
  selector: 'app-five-crowns-scoreboard',
  standalone: true,
  imports: [FiveCrownsPlayerRowComponent, FiveCrownsScoreEntryComponent, FiveCrownsGameOverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col h-full bg-cream-50 dark:bg-ink-950' },
  template: `
    @if (gameOver(); as result) {
      <!-- ─── Game Over ─── -->
      <app-five-crowns-game-over
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
          <p class="font-display font-bold text-[1rem] text-cream-100">5 Crowns</p>
          <small
            class="block font-body font-light text-[0.58rem] tracking-[0.04em] opacity-65 text-cream-100"
          >
            Lowest score wins
          </small>
        </div>
        <div class="w-8" aria-hidden="true"></div>
      </header>

      <!-- ─── Round Strip ─── -->
      <div
        class="shrink-0 px-4 pt-2.5 pb-2
               bg-felt-700/30 dark:bg-ink-900/60
               border-b border-felt-600/20 dark:border-ink-800"
      >
        <!-- Round info row -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="font-display text-[2rem] font-bold leading-none text-felt-700 dark:text-felt-400">
              {{ roundDef().label }}
            </span>
            <div class="flex flex-col gap-[2px]">
              <span class="text-[0.6rem] font-semibold text-ink-500 dark:text-ink-500">
                {{ roundDef().cards }} cards
              </span>
              <span
                class="text-[0.55rem] font-semibold tracking-[0.04em] uppercase
                       px-1.5 py-[1px] rounded-[4px]
                       bg-cream-100 text-ink-500 dark:bg-[rgba(94,100,116,0.15)] dark:text-ink-400
                       border border-cream-200 dark:border-[rgba(94,100,116,0.2)]"
              >
                wild {{ roundDef().wild }}
              </span>
            </div>
          </div>

          <!-- Complete Round / End Game button -->
          @if (allConfirmed()) {
            <button
              type="button"
              [disabled]="completing()"
              (click)="onCompleteRound()"
              class="px-3.5 py-2 rounded-[10px] font-display text-[0.8rem] font-semibold
                     cursor-pointer outline-none transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus-visible:ring-2 focus-visible:ring-felt-400"
              [class]="currentRound() === TOTAL_ROUNDS
                ? 'bg-gold-400 text-ink-950 shadow-[0_2px_8px_rgba(250,204,21,0.3)]'
                : 'bg-felt-600 text-white shadow-[0_2px_8px_rgba(26,127,75,0.25)]'"
            >
              {{ completing() ? 'Saving…' : currentRound() === TOTAL_ROUNDS ? 'End Game →' : 'Complete Round →' }}
            </button>
          } @else {
            <span class="text-[0.7rem] text-ink-400 dark:text-ink-600">
              {{ remainingCount() }} remaining
            </span>
          }
        </div>

        <!-- Pip track -->
        <div class="flex items-center gap-[4px]">
          @for (r of allRounds; track r.label) {
            <div
              class="flex-1 flex flex-col items-center gap-[3px]"
              [attr.aria-label]="'Round ' + r.label + (roundDef().label === r.label ? ' (current)' : '')"
            >
              <div
                class="h-[3px] w-full rounded-full transition-colors"
                [class]="pipClasses(r.label)"
              ></div>
              <span
                class="text-[0.5rem] font-semibold leading-none transition-colors"
                [class]="pipLabelClasses(r.label)"
              >
                {{ r.label }}
              </span>
            </div>
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
            Standings · lowest wins
          </p>

          @for (standing of standings(); track standing.playerId) {
            <app-five-crowns-player-row
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
                <span class="text-[0.6rem] text-ink-400 dark:text-ink-600 w-7 shrink-0">Rnd</span>
                @for (p of players(); track p.id) {
                  <span
                    class="flex-1 text-center text-[0.65rem] font-semibold text-ink-500 dark:text-ink-500 truncate"
                  >
                    {{ p.name }}
                  </span>
                }
              </div>
              <!-- Data rows -->
              @for (row of roundHistoryRows(); track row.label) {
                <div
                  class="flex items-center px-3 py-1.5 border-b border-cream-100/60 dark:border-ink-800/60 last:border-0"
                >
                  <span class="text-[0.6rem] font-semibold text-ink-500 dark:text-ink-500 w-7 shrink-0">
                    {{ row.label }}
                  </span>
                  @for (score of row.scores; track $index) {
                    <span
                      class="flex-1 text-center font-display text-[0.7rem] font-semibold"
                      [class]="score === null ? 'text-ink-300 dark:text-ink-700' : 'text-ink-600 dark:text-ink-400'"
                    >
                      {{ score === null ? '—' : score }}
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
        <app-five-crowns-score-entry
          [playerName]="s.name"
          [currentTotal]="s.total"
          [roundDef]="roundDef()"
          (confirmed)="onEntryConfirmed(s.playerId, $event)"
          (dismiss)="openSheetStanding.set(null)"
        />
      }
    }
  `,
})
export class FiveCrownsScoreboardComponent implements OnInit {
  sessionId = input.required<string>();
  gameId = input.required<string>();
  players = input.required<Player[]>();
  currentRound = input.required<number>();

  back = output<void>();
  navigateToSetup = output<string>();
  sessionArchived = output<void>();

  private gameService = inject(FiveCrownsGameService);
  private destroyRef = inject(DestroyRef);

  protected readonly TOTAL_ROUNDS = TOTAL_ROUNDS;
  protected readonly allRounds = ROUNDS;

  // ── Local state ──────────────────────────────────────────────────
  protected openSheetStanding = signal<FiveCrownsPlayerStanding | null>(null);
  protected completing = signal(false);
  protected gameOver = signal<FiveCrownsGameOverResult | null>(null);

  // ── Rounds from Firestore ────────────────────────────────────────
  protected rounds = signal<FiveCrownsRound[]>([]);

  ngOnInit(): void {
    this.gameService
      .getRounds$(this.sessionId(), this.gameId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rounds) => this.rounds.set(rounds));
  }

  // ── Derived data ─────────────────────────────────────────────────

  protected roundDef = computed(() => getRoundDef(this.currentRound()));

  /** Rounds before the current round (fully completed) */
  protected completedRounds = computed(() =>
    this.rounds().filter((r) => r.roundNumber < this.currentRound()),
  );

  /** The current round's doc (may have partial scores or not exist yet) */
  protected currentRoundDoc = computed(() =>
    this.rounds().find((r) => r.roundNumber === this.currentRound()) ?? null,
  );

  /** Standings sorted ascending (lowest first = leader) */
  protected standings = computed((): FiveCrownsPlayerStanding[] => {
    const completed = this.completedRounds();
    const currentDoc = this.currentRoundDoc();

    const result = this.players().map((p, idx) => {
      // Sum all completed rounds' scores
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
      } satisfies FiveCrownsPlayerStanding;
    });

    // Ascending sort — lowest total first
    return result.sort((a, b) => a.total - b.total);
  });

  /** The player with the lowest current total (null if all at 0 or tie) */
  protected leaderId = computed((): string | null => {
    const s = this.standings();
    if (s.every((p) => p.total === 0)) return null;
    const min = Math.min(...s.map((p) => p.total));
    const leaders = s.filter((p) => p.total === min);
    return leaders.length === 1 ? leaders[0].playerId : null;
  });

  /** True when every player has confirmed their score for the current round */
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
      label: getRoundDef(round.roundNumber).label,
      scores: this.players().map((p) => round.scores[p.id] !== undefined ? round.scores[p.id] : null),
    })),
  );

  // ── Interactions ─────────────────────────────────────────────────

  protected openEntry(standing: FiveCrownsPlayerStanding): void {
    this.openSheetStanding.set(standing);
  }

  protected async onEntryConfirmed(
    playerId: string,
    result: FiveCrownsScoreEntryResult,
  ): Promise<void> {
    this.openSheetStanding.set(null);
    const roundNumber = this.currentRound();
    await this.gameService.confirmPlayerScore(
      this.sessionId(),
      this.gameId(),
      roundNumber,
      roundNumber - 1,
      playerId,
      result.roundScore,
    );
  }

  protected async onCompleteRound(): Promise<void> {
    if (!this.allConfirmed() || this.completing()) return;
    this.completing.set(true);

    const isLastRound = this.currentRound() === TOTAL_ROUNDS;

    try {
      if (isLastRound) {
        // Build game-over result before writing to Firestore to avoid race condition
        // where the parent destroys this component when status flips to 'complete'.
        const finalStandings = this.standings().map((s) => ({
          ...s,
          // Include the current round's confirmed score in the final total
          total: s.total + (s.roundScore ?? 0),
          roundScore: s.roundScore,
        }));
        this.gameOver.set(buildFiveCrownsGameOverResult(finalStandings));
        await this.gameService.completeGame(this.sessionId(), this.gameId());
      } else {
        await this.gameService.completeRound(this.sessionId(), this.gameId());
      }
    } catch {
      this.gameOver.set(null);
      this.completing.set(false);
      return;
    }

    this.completing.set(false);
  }

  protected onNextGame(): void {
    this.navigateToSetup.emit(this.sessionId());
  }

  protected async onEndNight(): Promise<void> {
    this.sessionArchived.emit();
  }

  // ── Pip track styling ─────────────────────────────────────────────

  protected pipClasses(label: string): string {
    const current = this.roundDef().label;
    if (label === current) return 'bg-felt-500 dark:bg-felt-400';
    if (this.isRoundCompleted(label)) return 'bg-felt-700/60 dark:bg-felt-800';
    return 'bg-cream-200 dark:bg-ink-800';
  }

  protected pipLabelClasses(label: string): string {
    const current = this.roundDef().label;
    if (label === current) return 'text-felt-600 dark:text-felt-400';
    if (this.isRoundCompleted(label)) return 'text-felt-700/70 dark:text-felt-700';
    return 'text-ink-400 dark:text-ink-700';
  }

  private isRoundCompleted(label: string): boolean {
    return this.completedRounds().some((r) => getRoundDef(r.roundNumber).label === label);
  }
}
