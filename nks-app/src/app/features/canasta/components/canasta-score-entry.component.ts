import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { getMeldTier, meldBadgeLabel } from '../canasta.utils';
import type { MeldTier } from '../canasta.model';

export interface CanastaScoreEntryResult {
  base: number;
  score: number;
}

@Component({
  selector: 'app-canasta-score-entry',
  standalone: true,
  imports: [DecimalPipe],
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
          <div class="flex items-center gap-2 mt-[2px]">
            <span
              class="font-display text-[0.85rem] font-semibold text-felt-600 dark:text-felt-400"
            >
              {{ currentScore() | number }}
            </span>
            <span [class]="meldBadgeClasses(currentMeldTier())">
              {{ meldBadgeLabel(currentMeldTier()) }}
            </span>
          </div>
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
          class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px]
                 bg-cream-100 dark:bg-ink-950
                 border border-cream-200 dark:border-transparent
                 text-[0.8rem] flex-wrap"
        >
          <span class="font-display font-semibold text-ink-400 dark:text-ink-500">
            {{ currentScore() | number }}
          </span>
          <span class="text-ink-500 dark:text-ink-700 text-[0.7rem]">+</span>
          <span class="font-display font-bold text-amber-500 dark:text-amber-400">
            {{ baseValue() }}
          </span>
          @if (isLockedMode()) {
            <span
              class="text-[0.48rem] font-bold tracking-[0.05em] uppercase self-center
                     text-amber-600 dark:text-amber-600
                     bg-[rgba(217,119,6,0.12)] border border-[rgba(217,119,6,0.2)]
                     px-1 py-[1px] rounded-[4px] -ml-1"
            >
              base
            </span>
          }
          <span class="text-ink-500 dark:text-ink-700 text-[0.7rem]">+</span>
          <span
            class="font-display font-bold"
            [class]="(scoreValue() ?? 0) < 0 ? 'text-ruby-500 dark:text-ruby-400' : 'text-felt-600 dark:text-felt-400'"
          >
            {{ scoreRaw() === '' ? '—' : (scoreValue() ?? 0) | number }}
          </span>
          <span class="text-ink-500 dark:text-ink-700 text-[0.7rem]">=</span>
          <span class="font-display font-bold text-[1rem]" [class]="liveTotalClasses()">
            {{ liveTotal() | number }}
          </span>
          <!-- Meld tier preview if changing -->
          @if (meldTierChanging()) {
            <span class="text-ink-500 dark:text-ink-700 text-[0.65rem]">→</span>
            <span [class]="meldBadgeClasses(liveMeldTier())">
              {{ meldBadgeLabel(liveMeldTier()) }}
            </span>
          }
        </div>

        <!-- Stacked rows (Option C) -->
        <div class="flex flex-col gap-2">
          <!-- Base row — hidden in Phase 2 (lockedBase mode) -->
          @if (!isLockedMode()) {
          <div
            class="flex items-stretch rounded-[10px] overflow-hidden border-[1.5px] transition-colors"
            [class]="
              activeField() === 'base'
                ? 'border-amber-500 dark:border-amber-600'
                : 'border-cream-300 dark:border-ink-700'
            "
          >
            <div
              class="flex flex-col items-center justify-center px-3 py-2.5 min-w-[52px] shrink-0
                     border-r transition-colors"
              [class]="
                activeField() === 'base'
                  ? 'bg-amber-50 dark:bg-[rgba(217,119,6,0.1)] border-amber-200 dark:border-amber-800'
                  : 'bg-cream-100 dark:bg-ink-800 border-cream-200 dark:border-ink-700'
              "
            >
              <span
                class="text-[0.58rem] font-bold tracking-[0.05em] uppercase text-amber-500 dark:text-amber-400"
              >
                Base
              </span>
              <span class="text-[0.5rem] text-ink-400 dark:text-ink-600 mt-[1px]">≥ 0</span>
            </div>
            <input
              type="number"
              inputmode="numeric"
              min="0"
              placeholder="0"
              class="flex-1 px-3 py-2.5 border-none outline-none bg-transparent
                     font-display text-[1.4rem] font-bold text-right
                     text-ink-800 dark:text-cream-100
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              [class]="
                activeField() === 'base'
                  ? 'text-amber-600 dark:text-amber-300'
                  : 'text-ink-800 dark:text-cream-100'
              "
              [value]="baseRaw()"
              (input)="onBaseChange($any($event.target).value)"
              (focus)="activeField.set('base')"
              (blur)="onBaseBlur()"
              aria-label="Base value"
            />
          </div>
          } <!-- end @if (!isLockedMode()) -->

          <!-- Score row -->
          <div
            class="flex items-stretch rounded-[10px] overflow-hidden border-[1.5px] transition-colors"
            [class]="
              activeField() === 'score'
                ? 'border-felt-500 dark:border-felt-600'
                : 'border-cream-300 dark:border-ink-700'
            "
          >
            <div
              class="flex flex-col items-center justify-center px-3 py-2.5 min-w-[52px] shrink-0
                     border-r transition-colors"
              [class]="
                activeField() === 'score'
                  ? 'bg-felt-50 dark:bg-[rgba(39,158,94,0.1)] border-felt-200 dark:border-felt-800'
                  : 'bg-cream-100 dark:bg-ink-800 border-cream-200 dark:border-ink-700'
              "
            >
              <span
                class="text-[0.58rem] font-bold tracking-[0.05em] uppercase text-felt-500 dark:text-felt-400"
              >
                Score
              </span>
              <span class="text-[0.5rem] text-ink-400 dark:text-ink-600 mt-[1px]">+/−</span>
            </div>
            <input
              type="number"
              inputmode="numeric"
              placeholder="—"
              class="flex-1 px-3 py-2.5 border-none outline-none bg-transparent
                     font-display text-[1.4rem] font-bold text-right
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              [class]="scoreInputClasses()"
              [value]="scoreRaw()"
              (input)="onScoreChange($any($event.target).value)"
              (focus)="activeField.set('score')"
              (blur)="activeField.set(null)"
              aria-label="Score value"
            />
          </div>
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
          Confirm Round Score
        </button>
      </div>
    </div>
  `,
})
export class CanastaScoreEntryComponent {
  playerName = input.required<string>();
  currentScore = input.required<number>();
  lockedBase = input<number | null>(null);

  confirmed = output<CanastaScoreEntryResult>();
  dismiss = output<void>();

  protected activeField = signal<'base' | 'score' | null>(null);
  protected baseRaw = signal<string>('');
  protected scoreRaw = signal<string>('');

  protected isLockedMode = computed(() => this.lockedBase() !== null);

  protected currentMeldTier = computed(() => getMeldTier(this.currentScore()));

  protected baseValue = computed(() => {
    const locked = this.lockedBase();
    if (locked !== null) return locked;
    const v = parseFloat(this.baseRaw());
    return isNaN(v) ? 0 : Math.max(0, Math.floor(v));
  });

  protected scoreValue = computed(() => {
    const v = parseFloat(this.scoreRaw());
    return isNaN(v) ? null : Math.trunc(v);
  });

  protected liveTotal = computed(() => {
    const sv = this.scoreValue();
    return this.currentScore() + this.baseValue() + (sv ?? 0);
  });

  protected liveMeldTier = computed(() => getMeldTier(this.liveTotal()));

  protected meldTierChanging = computed(
    () => this.scoreRaw() !== '' && this.liveMeldTier() !== this.currentMeldTier(),
  );

  protected canConfirm = computed(() => this.scoreRaw().trim() !== '' && this.scoreValue() !== null);

  protected onBaseChange(val: string): void {
    // Clamp to >= 0 by stripping leading minus
    this.baseRaw.set(val.replace('-', ''));
  }

  protected onBaseBlur(): void {
    this.activeField.set(null);
    // Normalise empty to show 0 placeholder
    if (this.baseRaw().trim() === '' || isNaN(parseFloat(this.baseRaw()))) {
      this.baseRaw.set('');
    }
  }

  protected onScoreChange(val: string): void {
    this.scoreRaw.set(val);
  }

  protected confirm(): void {
    const sv = this.scoreValue();
    if (sv === null) return;
    this.confirmed.emit({ base: this.baseValue(), score: sv });
  }

  protected liveTotalClasses = computed((): string => {
    const t = this.liveTotal();
    if (t < 0) return 'text-ruby-500 dark:text-ruby-400';
    if (t >= 5000) return 'text-gold-500 dark:text-gold-400';
    return 'text-ink-800 dark:text-cream-100';
  });

  protected scoreInputClasses = computed((): string => {
    const sv = this.scoreValue();
    if (this.activeField() === 'score') {
      return sv !== null && sv < 0
        ? 'text-ruby-500 dark:text-ruby-400'
        : 'text-felt-600 dark:text-felt-300';
    }
    return sv !== null && sv < 0
      ? 'text-ruby-500 dark:text-ruby-400'
      : 'text-ink-800 dark:text-cream-100';
  });

  protected meldBadgeClasses(tier: MeldTier): string {
    switch (tier) {
      case 'none':
        return 'text-[0.55rem] font-semibold tracking-[0.04em] uppercase px-1.5 py-[1px] rounded-[4px] italic bg-ink-100 text-ink-400 dark:bg-[rgba(94,100,116,0.15)] dark:text-ink-400 border border-ink-200 dark:border-[rgba(94,100,116,0.2)]';
      case '50':
        return 'text-[0.55rem] font-semibold tracking-[0.04em] uppercase px-1.5 py-[1px] rounded-[4px] bg-felt-100 text-felt-700 dark:bg-[rgba(39,158,94,0.18)] dark:text-felt-400 border border-felt-200 dark:border-[rgba(39,158,94,0.25)]';
      case '90':
        return 'text-[0.55rem] font-semibold tracking-[0.04em] uppercase px-1.5 py-[1px] rounded-[4px] bg-amber-100 text-amber-700 dark:bg-[rgba(217,119,6,0.18)] dark:text-amber-400 border border-amber-200 dark:border-[rgba(217,119,6,0.3)]';
      case '120':
        return 'text-[0.55rem] font-semibold tracking-[0.04em] uppercase px-1.5 py-[1px] rounded-[4px] bg-ruby-100 text-ruby-700 dark:bg-[rgba(159,20,32,0.18)] dark:text-ruby-400 border border-ruby-200 dark:border-[rgba(159,20,32,0.3)]';
    }
  }

  protected readonly meldBadgeLabel = meldBadgeLabel;
}
