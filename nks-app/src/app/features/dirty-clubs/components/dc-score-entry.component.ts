import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { HandOutcome } from '../dirty-clubs.model';
import { isOnBoard, isForcedPlay } from '../dirty-clubs.utils';

export interface ScoreEntryResult {
  outcome: HandOutcome;
  tricksValue: number;
}

@Component({
  selector: 'app-dc-score-entry',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/50 z-40 transition-opacity"
      (click)="dismiss.emit()"
      aria-hidden="true"
    ></div>

    <!-- Bottom sheet -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px]
             bg-cream-50 dark:bg-ink-900
             shadow-[0_-4px_24px_rgba(0,0,0,0.18)]
             pb-[env(safe-area-inset-bottom)]"
      role="dialog"
      [attr.aria-label]="'Score entry for ' + playerName()"
    >
      <!-- Handle -->
      <div class="flex justify-center pt-3 pb-1">
        <div class="w-9 h-1 rounded-full bg-ink-200 dark:bg-ink-700"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-2">
        <div>
          <p class="font-display text-[1.15rem] font-bold text-ink-900 dark:text-ink-50">
            {{ playerName() }}
          </p>
          <p class="text-[0.72rem] font-body text-ink-400 dark:text-ink-500 mt-[1px]">
            Score:
            <span class="text-felt-600 dark:text-felt-400 font-semibold">{{ currentScore() }}</span>
            &nbsp;·&nbsp; Bumps:
            <span class="text-ruby-600 dark:text-ruby-400 font-semibold">{{ currentBumps() }}</span>
          </p>
        </div>
        <button
          (click)="dismiss.emit()"
          aria-label="Close"
          class="w-7 h-7 rounded-full flex items-center justify-center text-ink-400
                 bg-cream-100 dark:bg-ink-800 cursor-pointer outline-none
                 focus-visible:ring-2 focus-visible:ring-felt-400"
        >
          <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 2l8 8M10 2l-8 8"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- Numpad -->
      <div class="px-3 pb-3 flex flex-col gap-2">
        <!-- Did Not Play -->
        <button
          type="button"
          [disabled]="forcedPlay()"
          (click)="select('dnp')"
          class="w-full py-3 px-4 rounded-[10px] text-[0.88rem] font-semibold font-body
                 transition-all cursor-pointer outline-none
                 focus-visible:ring-2 focus-visible:ring-felt-400"
          [class]="btnClass('dnp')"
          [class.opacity-30]="forcedPlay()"
          [class.cursor-not-allowed]="forcedPlay()"
          [attr.aria-pressed]="selected() === 'dnp'"
          [attr.title]="forcedPlay() ? 'Forced play — score is 13 or 14' : ''"
        >
          Did Not Play — no change
        </button>

        <!-- Bump row -->
        <div class="grid grid-cols-2 gap-2">
          <!-- Bump -->
          <button
            type="button"
            (click)="select('bump')"
            class="py-3 px-2 rounded-[10px] flex flex-col items-center gap-0.5
                   transition-all cursor-pointer outline-none
                   focus-visible:ring-2 focus-visible:ring-felt-400"
            [class]="btnClass('bump')"
            [attr.aria-pressed]="selected() === 'bump'"
          >
            <span class="text-[1.4rem] leading-none">💥</span>
            <span class="text-[0.82rem] font-semibold">Bump</span>
            <span class="text-[0.65rem] opacity-70">−5 pts · +1 bump</span>
          </button>
          <!-- Double Bump -->
          <button
            type="button"
            (click)="select('double_bump')"
            class="py-3 px-2 rounded-[10px] flex flex-col items-center gap-0.5
                   transition-all cursor-pointer outline-none
                   focus-visible:ring-2 focus-visible:ring-felt-400"
            [class]="btnClass('double_bump')"
            [attr.aria-pressed]="selected() === 'double_bump'"
          >
            <span class="text-[1.4rem] leading-none">💥💥</span>
            <span class="text-[0.82rem] font-semibold">Double</span>
            <span class="text-[0.65rem] opacity-70">−5 pts · +2 bumps</span>
          </button>
        </div>

        <!-- Tricks grid (1–5) -->
        <div class="grid grid-cols-5 gap-2">
          @for (n of tricksRange; track n) {
            <button
              type="button"
              (click)="selectTricks(n)"
              class="py-3 rounded-[10px] text-[1.1rem] font-bold font-display
                     transition-all cursor-pointer outline-none
                     focus-visible:ring-2 focus-visible:ring-felt-400"
              [class]="tricksClass(n)"
              [attr.aria-pressed]="selected() === 'tricks' && selectedTricks() === n"
              [attr.aria-label]="n + ' tricks'"
            >
              {{ n }}
            </button>
          }
        </div>

        <!-- Shoot the Moon -->
        <button
          type="button"
          [disabled]="!canShootMoon()"
          (click)="select('moon')"
          class="w-full py-3 px-4 rounded-[10px] text-[0.88rem] font-semibold font-body
                 transition-all cursor-pointer outline-none
                 focus-visible:ring-2 focus-visible:ring-felt-400
                 flex items-center justify-center gap-2"
          [class]="moonBtnClass()"
          [class.opacity-30]="!canShootMoon()"
          [class.cursor-not-allowed]="!canShootMoon()"
          [attr.aria-pressed]="selected() === 'moon'"
        >
          <span>🌙 Shoot the Moon</span>
          @if (!canShootMoon()) {
            <span class="text-[0.72rem] font-normal opacity-70">— not on board yet</span>
          }
        </button>

        <!-- Confirm -->
        <button
          type="button"
          [disabled]="!canConfirm()"
          (click)="confirm()"
          class="w-full py-3.5 px-4 rounded-[12px] text-[0.95rem] font-semibold font-display
                 transition-all cursor-pointer outline-none
                 focus-visible:ring-2 focus-visible:ring-white
                 disabled:opacity-30 disabled:cursor-not-allowed"
          [class]="confirmBtnClass()"
        >
          {{ confirmLabel() }}
        </button>
      </div>
    </div>
  `,
})
export class DcScoreEntryComponent {
  playerName = input.required<string>();
  currentScore = input.required<number>();
  currentBumps = input.required<number>();

  confirmed = output<ScoreEntryResult>();
  dismiss = output<void>();

  protected readonly tricksRange = [1, 2, 3, 4, 5];

  protected selected = signal<HandOutcome | null>(null);
  protected selectedTricks = signal<number>(0);

  protected canShootMoon = computed(() => isOnBoard(this.currentScore(), this.currentBumps()));
  protected forcedPlay = computed(() => isForcedPlay(this.currentScore()));
  protected canConfirm = computed(() => this.selected() !== null);

  protected confirmLabel = computed(() => {
    if (this.selected() === 'moon') return '🌙 Confirm Moon — Game ends after this hand';
    return 'Confirm';
  });

  protected select(outcome: HandOutcome): void {
    if (outcome === 'dnp' && this.forcedPlay()) return;
    if (outcome === 'moon' && !this.canShootMoon()) return;
    this.selected.set(outcome);
    if (outcome !== 'tricks') this.selectedTricks.set(0);
  }

  protected selectTricks(n: number): void {
    this.selected.set('tricks');
    this.selectedTricks.set(n);
  }

  protected confirm(): void {
    const outcome = this.selected();
    if (!outcome) return;
    this.confirmed.emit({ outcome, tricksValue: this.selectedTricks() });
  }

  protected btnClass(outcome: HandOutcome): string {
    const active = this.selected() === outcome;
    if (active) {
      return 'bg-ruby-600 text-white shadow-[0_2px_8px_rgba(229,29,43,0.35)]';
    }
    return 'bg-ruby-50 text-ruby-700 dark:bg-[rgba(248,59,72,0.08)] dark:text-ruby-400';
  }

  protected tricksClass(n: number): string {
    const active = this.selected() === 'tricks' && this.selectedTricks() === n;
    if (active) {
      return 'bg-felt-600 text-white shadow-[0_2px_8px_rgba(26,127,75,0.35)]';
    }
    return 'bg-felt-50 text-felt-700 dark:bg-[rgba(26,127,75,0.1)] dark:text-felt-400';
  }

  protected moonBtnClass(): string {
    const active = this.selected() === 'moon';
    if (active) {
      return 'bg-linear-to-r from-purple-700 to-felt-700 text-white shadow-[0_2px_12px_rgba(124,58,237,0.4)]';
    }
    return 'bg-ink-900/5 text-ink-600 dark:bg-[rgba(255,255,255,0.05)] dark:text-ink-400 border border-ink-200/50 dark:border-ink-700/50';
  }

  protected confirmBtnClass(): string {
    if (this.selected() === 'moon') {
      return 'bg-linear-to-br from-purple-700 to-felt-700 text-white';
    }
    if (this.canConfirm()) {
      return 'bg-felt-600 text-white shadow-[0_4px_16px_rgba(26,127,75,0.3)]';
    }
    return 'bg-ink-100 dark:bg-ink-800 text-ink-400';
  }
}
