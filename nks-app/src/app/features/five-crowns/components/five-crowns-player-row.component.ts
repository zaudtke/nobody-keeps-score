import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { getAvatarColor } from '../../game-setup/game-setup.constants';
import type { FiveCrownsPlayerStanding } from '../five-crowns.model';

@Component({
  selector: 'app-five-crowns-player-row',
  standalone: true,
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
        <!-- Confirmed checkmark -->
        @if (standing().roundScore !== null) {
          <span
            class="absolute -top-[3px] -right-[3px] w-4 h-4 rounded-full
                   bg-felt-500 flex items-center justify-center"
            aria-label="Score confirmed"
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
        <div class="flex items-center gap-1.5">
          <span
            class="truncate text-[0.88rem] font-semibold font-body leading-snug"
            [class]="nameClasses()"
          >
            {{ standing().name }}
          </span>
          @if (isLeader()) {
            <span
              class="shrink-0 text-[0.5rem] font-bold tracking-[0.06em] uppercase
                     px-1.5 py-[1px] rounded-full
                     bg-linear-to-r from-gold-500 to-gold-400 text-ink-950"
            >
              Leading
            </span>
          }
        </div>
        <!-- Round score delta (dim) -->
        @if (standing().roundScore !== null) {
          <p class="text-[0.65rem] text-ink-400 dark:text-ink-600 mt-[2px]">
            +{{ standing().roundScore }} this round
          </p>
        }
      </div>

      <!-- Score -->
      <div class="shrink-0 flex flex-col items-end">
        <span class="font-display text-[1.5rem] font-bold leading-none" [class]="scoreClasses()">
          {{ standing().total }}
        </span>
        @if (standing().roundScore !== null) {
          <span class="text-[0.6rem] text-felt-500 dark:text-felt-600 mt-[1px]">
            → {{ standing().total + standing().roundScore! }}
          </span>
        }
      </div>

      <!-- Tap arrow -->
      <span class="shrink-0 text-ink-300 dark:text-ink-700 text-[0.9rem]" aria-hidden="true">›</span>
    </button>
  `,
})
export class FiveCrownsPlayerRowComponent {
  standing = input.required<FiveCrownsPlayerStanding>();
  isLeader = input<boolean>(false);
  tap = output<void>();

  private theme = inject(ThemeService);

  protected initial = computed(() => this.standing().name.charAt(0).toUpperCase());
  protected avatarColor = computed(() =>
    getAvatarColor(this.standing().order, this.theme.isDark()),
  );

  protected rowClasses = computed((): string => {
    if (this.isLeader()) {
      return 'bg-linear-to-r from-[rgba(250,204,21,0.07)] to-transparent dark:from-[rgba(250,204,21,0.05)] dark:to-transparent';
    }
    return '';
  });

  protected nameClasses = computed((): string => {
    if (this.isLeader()) return 'text-gold-600 dark:text-gold-400';
    return 'text-ink-800 dark:text-ink-100';
  });

  protected scoreClasses = computed((): string => {
    const t = this.standing().total;
    if (t < 0) return 'text-ruby-600 dark:text-ruby-400';
    if (this.isLeader()) return 'text-gold-500 dark:text-gold-400';
    return 'text-felt-600 dark:text-felt-400';
  });
}
