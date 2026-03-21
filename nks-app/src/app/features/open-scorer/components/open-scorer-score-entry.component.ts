import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import type { WinDirection } from '../open-scorer.model';

export interface OpenScorerScoreEntryResult {
  turnScore: number;
  newTotal: number;
}

@Component({
  selector: 'app-open-scorer-score-entry',
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
      <div
        class="flex items-center justify-between px-4 py-2
               border-b border-cream-200 dark:border-ink-800"
      >
        <div>
          <p class="font-display text-[1rem] font-bold text-ink-900 dark:text-ink-50">
            {{ playerName() }}
          </p>
          <span class="font-display text-[0.85rem] font-semibold text-felt-600 dark:text-felt-400">
            {{ currentTotal() }}
          </span>
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

      <!-- Entry body -->
      <div class="px-4 pt-3 pb-4 flex flex-col gap-3">
        <!-- Live math bar -->
        <div
          class="flex items-center justify-center gap-2 px-3 py-2 rounded-[10px]
                 bg-cream-100 dark:bg-ink-950
                 border border-cream-200 dark:border-transparent
                 text-[0.8rem]"
        >
          <span class="font-display font-semibold text-ink-400 dark:text-ink-500">
            {{ currentTotal() }}
          </span>
          <span class="text-ink-500 dark:text-ink-700 text-[0.7rem]">+</span>
          <span
            class="font-display font-bold"
            [class]="turnScoreValue() !== null && turnScoreValue()! < 0
              ? 'text-ruby-500 dark:text-ruby-400'
              : 'text-felt-600 dark:text-felt-400'"
          >
            {{ rawScore() === '' ? '—' : turnScoreValue() }}
          </span>
          <span class="text-ink-500 dark:text-ink-700 text-[0.7rem]">=</span>
          <span class="font-display font-bold text-[1rem]" [class]="liveTotalClasses()">
            {{ liveTotal() }}
          </span>
        </div>

        <!-- Turn score input -->
        <div
          class="flex items-stretch rounded-[10px] overflow-hidden border-[1.5px] transition-colors"
          [class]="focused() ? 'border-felt-500 dark:border-felt-600' : 'border-cream-300 dark:border-ink-700'"
        >
          <div
            class="flex flex-col items-center justify-center px-3 py-2.5 min-w-[52px] shrink-0
                   border-r transition-colors"
            [class]="focused()
              ? 'bg-felt-50 dark:bg-[rgba(39,158,94,0.1)] border-felt-200 dark:border-felt-800'
              : 'bg-cream-100 dark:bg-ink-800 border-cream-200 dark:border-ink-700'"
          >
            <span class="text-[0.58rem] font-bold tracking-[0.05em] uppercase text-felt-500 dark:text-felt-400">
              Turn
            </span>
            <span class="text-[0.5rem] text-ink-400 dark:text-ink-600 mt-[1px]">+/−</span>
          </div>
          <input
            type="number"
            inputmode="numeric"
            placeholder="0"
            class="flex-1 px-3 py-2.5 border-none outline-none bg-transparent
                   font-display text-[1.8rem] font-bold text-right
                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            [class]="turnScoreValue() !== null && turnScoreValue()! < 0
              ? 'text-ruby-500 dark:text-ruby-400'
              : 'text-ink-800 dark:text-cream-100'"
            [value]="rawScore()"
            (input)="onScoreChange($any($event.target).value)"
            (focus)="focused.set(true)"
            (blur)="focused.set(false)"
            aria-label="Turn score"
          />
        </div>

        <!-- Confirm -->
        <button
          type="button"
          [disabled]="!canConfirm()"
          (click)="confirm()"
          class="w-full py-3.5 px-4 rounded-[12px] text-[0.95rem] font-semibold font-display
                 transition-colors cursor-pointer outline-none
                 focus-visible:ring-2 focus-visible:ring-white
                 disabled:opacity-30 disabled:cursor-not-allowed
                 bg-felt-600 text-white
                 shadow-[0_4px_16px_rgba(26,127,75,0.3)]"
        >
          Confirm Score
        </button>
      </div>
    </div>
  `,
})
export class OpenScorerScoreEntryComponent {
  playerName = input.required<string>();
  currentTotal = input.required<number>();
  winDirection = input.required<WinDirection>();

  confirmed = output<OpenScorerScoreEntryResult>();
  dismiss = output<void>();

  protected rawScore = signal<string>('');
  protected focused = signal(false);

  protected turnScoreValue = computed(() => {
    const v = parseFloat(this.rawScore());
    return isNaN(v) ? null : Math.trunc(v);
  });

  protected liveTotal = computed(() => {
    const sv = this.turnScoreValue();
    return this.currentTotal() + (sv ?? 0);
  });

  protected canConfirm = computed(
    () => this.rawScore().trim() !== '' && this.turnScoreValue() !== null,
  );

  protected liveTotalClasses = computed((): string => {
    const t = this.liveTotal();
    if (t < 0) return 'text-ruby-500 dark:text-ruby-400';
    return 'text-ink-800 dark:text-cream-100';
  });

  protected onScoreChange(val: string): void {
    this.rawScore.set(val);
  }

  protected confirm(): void {
    const sv = this.turnScoreValue();
    if (sv === null) return;
    this.confirmed.emit({ turnScore: sv, newTotal: this.liveTotal() });
  }
}
