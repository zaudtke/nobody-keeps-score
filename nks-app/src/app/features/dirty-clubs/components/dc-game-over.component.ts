import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { getAvatarColor } from '../../game-setup/game-setup.constants';
import { formatCents } from '../dirty-clubs.utils';
import type { GameOverResult } from '../dirty-clubs.model';

@Component({
  selector: 'app-dc-game-over',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col h-full' },
  template: `
    <!-- Hero -->
    <div
      class="flex flex-col items-center justify-center px-6 py-8 shrink-0"
      [class]="heroClasses()"
    >
      @if (result().moonWin) {
        <p
          class="font-display text-[0.7rem] font-bold tracking-[0.12em] uppercase
                  text-purple-300 mb-2"
        >
          🌙 Shoot the Moon!
        </p>
        <div class="text-[3.5rem] leading-none mb-3">🌕</div>
      } @else {
        <div class="text-[3.5rem] leading-none mb-3">🏆</div>
      }

      <p
        class="text-[0.65rem] font-semibold tracking-[0.1em] uppercase
                text-cream-300 dark:text-ink-400 mb-1"
      >
        Winner
      </p>
      <p class="font-display text-[2rem] font-bold text-cream-50 dark:text-ink-50 leading-tight">
        {{ result().winnerName }}
      </p>

      @if (result().moonWin) {
        <p class="text-[0.75rem] text-cream-300 dark:text-ink-400 mt-1">
          All 5 tricks taken · game over
        </p>
      } @else {
        <p class="text-[0.75rem] text-cream-300 dark:text-ink-400 mt-1">
          Finished with {{ result().winnerScore }} pts
          @if (result().winnerBumps > 0) {
            · {{ result().winnerBumps }} bump{{ result().winnerBumps === 1 ? '' : 's' }}
          }
        </p>
      }
    </div>

    <!-- Payout list -->
    <div
      class="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                bg-cream-50 dark:bg-ink-950 px-4 pt-4"
    >
      <p
        class="text-[0.62rem] font-semibold tracking-[0.09em] uppercase
                text-ink-400 dark:text-ink-600 mb-3"
      >
        Each player owes {{ result().winnerName }}
      </p>

      <div class="flex flex-col gap-2">
        @for (row of result().payouts; track row.playerId) {
          <div
            class="flex items-center gap-3 px-3 py-2.5 rounded-[12px]
                      bg-white dark:bg-ink-900
                      shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none"
          >
            <!-- Avatar -->
            <div
              class="w-9 h-9 rounded-full shrink-0 flex items-center justify-center
                     text-[0.9rem] font-bold font-display"
              [style.background-color]="avatarColor(row.order).bg"
              [style.color]="avatarColor(row.order).text"
              aria-hidden="true"
            >
              {{ row.name.charAt(0).toUpperCase() }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-[0.88rem] font-semibold font-body text-ink-800 dark:text-ink-100">
                {{ row.name }}
              </p>
              <p class="text-[0.7rem] text-ink-400 dark:text-ink-500 mt-[1px]">
                $0.25 game
                @if (row.bumps > 0) {
                  <span class="text-ruby-600 dark:text-ruby-400">
                    + {{ formatCents(row.bumps * 10) }} ({{ row.bumps }} bump{{
                      row.bumps === 1 ? '' : 's'
                    }})
                  </span>
                } @else {
                  · no bumps
                }
              </p>
            </div>

            <!-- Amount -->
            <p
              class="shrink-0 font-display text-[1.25rem] font-bold text-ruby-600 dark:text-ruby-400"
            >
              {{ formatCents(row.amountCents) }}
            </p>
          </div>
        }

        <!-- Total row -->
        <div
          class="flex items-center justify-between px-3 py-2 mt-1
                    border-t border-cream-200 dark:border-ink-800"
        >
          <span class="text-[0.82rem] font-semibold font-body text-ink-600 dark:text-ink-400">
            {{ result().winnerName }} collects
          </span>
          <span class="font-display text-[1.5rem] font-bold text-gold-500 dark:text-gold-400">
            {{ formatCents(result().winnerCollectsCents) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div
      class="shrink-0 px-4 pt-3 pb-4 bg-cream-50 dark:bg-ink-950
                border-t border-cream-100 dark:border-ink-900
                pb-[max(1rem,env(safe-area-inset-bottom))]
                flex flex-col gap-2"
    >
      <button
        type="button"
        (click)="nextGame.emit()"
        class="w-full py-3.5 rounded-[12px] font-display text-[1rem] font-semibold text-white
               bg-linear-to-br from-felt-600 to-felt-700
               shadow-[0_4px_16px_rgba(26,127,75,0.25)] cursor-pointer outline-none
               focus-visible:ring-2 focus-visible:ring-felt-400"
      >
        ▶ Next Game
      </button>
      <button
        type="button"
        (click)="endNight.emit()"
        class="w-full py-3 rounded-[12px] font-body text-[0.9rem] font-semibold
               border border-ink-200 dark:border-ink-700
               text-ink-600 dark:text-ink-400
               cursor-pointer outline-none
               focus-visible:ring-2 focus-visible:ring-felt-400"
      >
        End Night
      </button>
    </div>
  `,
})
export class DcGameOverComponent {
  result = input.required<GameOverResult>();
  nextGame = output<void>();
  endNight = output<void>();

  private theme = inject(ThemeService);

  protected heroClasses = computed((): string => {
    if (this.result().moonWin) {
      return 'bg-linear-to-br from-[#1a0a40] to-ink-950';
    }
    return 'bg-linear-to-br from-felt-900 to-ink-950';
  });

  protected avatarColor(order: number) {
    return getAvatarColor(order, this.theme.isDark());
  }

  protected formatCents = formatCents;
}
