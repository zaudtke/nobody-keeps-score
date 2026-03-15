import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { getAvatarColor } from '../../game-setup/game-setup.constants';
import { isOnBoard, isForcedPlay } from '../dirty-clubs.utils';
import type { PlayerStanding } from '../dirty-clubs.model';

const MAX_SCORE = 15;
const MAX_BUMP_PIPS = 3; // ghost pips shown up to this count

@Component({
  selector: 'app-dc-player-row',
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
        <!-- On-board indicator -->
        @if (onBoard()) {
          <span
            class="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 rounded-full
                   bg-felt-400 border-2 border-white dark:border-ink-900"
            aria-hidden="true"
          ></span>
        }
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
        <!-- Name + forced badge -->
        <div class="flex items-center gap-1.5">
          <span
            class="truncate text-[0.88rem] font-semibold font-body leading-snug"
            [class]="nameClasses()"
          >
            {{ standing().name }}
          </span>
          @if (forcedPlay()) {
            <span
              class="shrink-0 text-[0.55rem] font-semibold tracking-[0.04em] uppercase
                     px-1.5 py-[1px] rounded-full bg-ruby-100 text-ruby-700
                     dark:bg-[rgba(248,59,72,0.15)] dark:text-ruby-400"
            >
              Must Play
            </span>
          }
        </div>

        <!-- Bumps / sub-label -->
        @if (onBoard()) {
          <div class="flex items-center gap-1.5 mt-[3px]">
            <span class="text-[0.62rem] text-ink-400 dark:text-ink-600">bumps:</span>
            <div class="flex items-center gap-[3px]" aria-label="{{ standing().bumps }} bumps">
              @for (pip of bumpPips(); track $index) {
                <span
                  class="w-[7px] h-[7px] rounded-full"
                  [class]="pip ? 'bg-ruby-500 dark:bg-ruby-400' : 'bg-cream-200 dark:bg-ink-700'"
                ></span>
              }
            </div>
          </div>
        } @else {
          <p class="text-[0.7rem] italic text-ink-400 dark:text-ink-600 mt-[1px]">
            not on board yet
          </p>
        }

        <!-- Progress bar -->
        <div
          class="h-[3px] rounded-full mt-[5px]"
          [class]="onBoard() ? 'bg-cream-100 dark:bg-ink-800' : 'bg-transparent'"
          role="progressbar"
          [attr.aria-valuenow]="standing().score"
          [attr.aria-valuemax]="15"
        >
          @if (onBoard()) {
            <div
              class="h-full rounded-full transition-all duration-500"
              [class]="
                forcedPlay() ? 'bg-ruby-500 dark:bg-ruby-400' : 'bg-felt-400 dark:bg-felt-500'
              "
              [style.width.%]="progressPct()"
            ></div>
          }
        </div>
      </div>

      <!-- Score display -->
      <div class="shrink-0 flex flex-col items-end">
        <span
          class="font-display text-[1.5rem] font-bold leading-none"
          [class]="scoreClasses()"
          [class.opacity-30]="!onBoard()"
        >
          {{ standing().score }}
        </span>
        <span class="text-[0.6rem] text-ink-400 dark:text-ink-600 mt-[1px]">of 15</span>
      </div>

      <!-- Tap arrow -->
      <span class="shrink-0 text-ink-300 dark:text-ink-700 text-[0.9rem]" aria-hidden="true"
        >›</span
      >
    </button>
  `,
})
export class DcPlayerRowComponent {
  standing = input.required<PlayerStanding>();
  pending = input<boolean>(false);
  isLeader = input<boolean>(false);
  tap = output<void>();

  private theme = inject(ThemeService);

  protected initial = computed(() => this.standing().name.charAt(0).toUpperCase());

  protected avatarColor = computed(() =>
    getAvatarColor(this.standing().order, this.theme.isDark()),
  );

  protected onBoard = computed(() => isOnBoard(this.standing().score, this.standing().bumps));
  protected forcedPlay = computed(() => isForcedPlay(this.standing().score));

  protected bumpPips = computed(() => {
    const count = this.standing().bumps;
    const visible = Math.max(count, MAX_BUMP_PIPS);
    return Array.from({ length: visible }, (_, i) => i < count);
  });

  protected progressPct = computed(() => Math.min(100, (this.standing().score / MAX_SCORE) * 100));

  protected rowClasses = computed((): string => {
    if (this.forcedPlay()) {
      return 'border border-ruby-200/60 dark:border-ruby-900/40';
    }
    return '';
  });

  protected nameClasses = computed((): string => {
    if (this.forcedPlay()) return 'text-ruby-700 dark:text-ruby-400';
    if (this.isLeader() && this.onBoard()) return 'text-gold-600 dark:text-gold-400';
    return 'text-ink-800 dark:text-ink-100';
  });

  protected scoreClasses = computed((): string => {
    if (this.forcedPlay()) return 'text-ruby-600 dark:text-ruby-400';
    if (this.isLeader() && this.onBoard()) return 'text-gold-500 dark:text-gold-400';
    return 'text-felt-600 dark:text-felt-400';
  });
}
