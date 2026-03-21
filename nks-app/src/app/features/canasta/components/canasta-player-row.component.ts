import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { getAvatarColor } from '../../game-setup/game-setup.constants';
import { isNearWin, meldBadgeLabel } from '../canasta.utils';
import type { CanastaPlayerStanding, MeldTier } from '../canasta.model';

@Component({
  selector: 'app-canasta-player-row',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [attr.aria-label]="'Enter score for ' + standing().name"
      (click)="tap.emit()"
      class="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-[12px]
             bg-white dark:bg-ink-900
             shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none
             transition-colors cursor-pointer outline-none
             focus-visible:ring-2 focus-visible:ring-felt-400
             active:bg-cream-50 dark:active:bg-ink-800"
      [class]="rowClasses()"
    >
      <!-- Avatar -->
      <div class="relative shrink-0">
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center
                 text-[0.9rem] font-bold font-display"
          [style.background-color]="avatarColor().bg"
          [style.color]="avatarColor().text"
          aria-hidden="true"
        >
          {{ initial() }}
        </div>
        <!-- Pending checkmark -->
        @if (pending()) {
          <span
            class="absolute -top-[3px] -right-[3px] w-4 h-4 rounded-full
                   bg-felt-500 flex items-center justify-center"
            aria-label="Score entered"
          >
            <svg class="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M1.5 5l2.5 2.5 4.5-5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        }
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <!-- Name -->
        <div class="flex items-center gap-1.5">
          <span
            class="truncate text-[0.88rem] font-semibold font-body leading-snug"
            [class]="nameClasses()"
          >
            {{ standing().name }}
          </span>
          @if (nearWin()) {
            <span
              class="shrink-0 text-[0.5rem] font-bold tracking-[0.06em] uppercase
                     px-1.5 py-[1px] rounded-full
                     bg-linear-to-r from-gold-500 to-gold-400 text-ink-950"
            >
              Near Win
            </span>
          }
        </div>

        <!-- Meld badge -->
        <div class="mt-[3px]">
          <span [class]="meldBadgeClasses()">
            {{ meldBadgeLabel(standing().meldTier) }}
          </span>
        </div>
      </div>

      <!-- Score -->
      <div class="shrink-0 flex flex-col items-end">
        <span class="font-display text-[1.5rem] font-bold leading-none" [class]="scoreClasses()">
          {{ standing().total | number }}
        </span>
        <span class="text-[0.6rem] text-ink-400 dark:text-ink-600 mt-[1px]">of 5,000</span>
      </div>

      <!-- Tap arrow -->
      <span class="shrink-0 text-ink-300 dark:text-ink-700 text-[0.9rem]" aria-hidden="true"
        >›</span
      >
    </button>
  `,
})
export class CanastaPlayerRowComponent {
  standing = input.required<CanastaPlayerStanding>();
  pending = input<boolean>(false);
  isLeader = input<boolean>(false);
  tap = output<void>();

  private theme = inject(ThemeService);

  protected initial = computed(() => this.standing().name.charAt(0).toUpperCase());
  protected avatarColor = computed(() =>
    getAvatarColor(this.standing().order, this.theme.isDark()),
  );
  protected nearWin = computed(() => isNearWin(this.standing().total));

  protected rowClasses = computed((): string => {
    if (this.nearWin()) {
      return 'bg-linear-to-r from-[rgba(250,204,21,0.07)] to-transparent dark:from-[rgba(250,204,21,0.05)] dark:to-transparent';
    }
    return '';
  });

  protected nameClasses = computed((): string => {
    if (this.nearWin()) return 'text-gold-600 dark:text-gold-400';
    if (this.isLeader()) return 'text-gold-600 dark:text-gold-400';
    return 'text-ink-800 dark:text-ink-100';
  });

  protected scoreClasses = computed((): string => {
    const t = this.standing().total;
    if (t < 0) return 'text-ruby-600 dark:text-ruby-400';
    if (this.nearWin() || this.isLeader()) return 'text-gold-500 dark:text-gold-400';
    return 'text-felt-600 dark:text-felt-400';
  });

  protected meldBadgeClasses = computed((): string => {
    return meldBadgeClasses(this.standing().meldTier);
  });

  protected readonly meldBadgeLabel = meldBadgeLabel;
}

export function meldBadgeClasses(tier: MeldTier): string {
  const base =
    'text-[0.55rem] font-semibold tracking-[0.04em] uppercase px-1.5 py-[1px] rounded-[4px] border';
  switch (tier) {
    case 'none':
      return `${base} italic bg-ink-100 text-ink-400 dark:bg-[rgba(94,100,116,0.15)] dark:text-ink-400 border-ink-200 dark:border-[rgba(94,100,116,0.2)]`;
    case '50':
      return `${base} bg-felt-100 text-felt-700 dark:bg-[rgba(39,158,94,0.18)] dark:text-felt-400 border-felt-200 dark:border-[rgba(39,158,94,0.25)]`;
    case '90':
      return `${base} bg-amber-100 text-amber-700 dark:bg-[rgba(217,119,6,0.18)] dark:text-amber-400 border-amber-200 dark:border-[rgba(217,119,6,0.3)]`;
    case '120':
      return `${base} bg-ruby-100 text-ruby-700 dark:bg-[rgba(159,20,32,0.18)] dark:text-ruby-400 border-ruby-200 dark:border-[rgba(159,20,32,0.3)]`;
  }
}
