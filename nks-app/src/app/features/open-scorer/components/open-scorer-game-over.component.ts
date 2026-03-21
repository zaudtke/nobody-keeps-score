import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { getAvatarColor } from '../../game-setup/game-setup.constants';
import type { OpenScorerGameOverResult } from '../open-scorer.model';

@Component({
  selector: 'app-open-scorer-game-over',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col h-full' },
  template: `
    <!-- Hero -->
    <div
      class="flex flex-col items-center justify-center px-6 py-8 shrink-0
             bg-linear-to-br from-felt-900 to-ink-950"
    >
      <div class="text-[3.5rem] leading-none mb-3">🏆</div>
      <p
        class="text-[0.65rem] font-semibold tracking-[0.1em] uppercase
               text-cream-300 dark:text-ink-400 mb-1"
      >
        {{ result().isTie ? 'Tie!' : 'Winner' }}
      </p>
      <p class="font-display text-[2rem] font-bold text-cream-50 leading-tight text-center">
        {{ result().winnerName }}
      </p>
      <p class="text-[0.75rem] text-felt-400 mt-1 text-center">
        @if (result().isTie) {
          Tied at {{ result().winnerScore }} — tiebreaker at the table
        } @else {
          Finished with {{ result().winnerScore }}
        }
      </p>
      <p class="text-[0.65rem] text-ink-500 mt-2 italic">
        {{ result().winDirection === 'high' ? 'Highest score wins' : 'Lowest score wins' }} — well played.
      </p>
    </div>

    <!-- Standings list -->
    <div
      class="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
             bg-cream-50 dark:bg-ink-950 px-4 pt-4"
    >
      <p
        class="text-[0.62rem] font-semibold tracking-[0.09em] uppercase
               text-ink-400 dark:text-ink-600 mb-3"
      >
        Final Standings ·
        {{ result().winDirection === 'high' ? 'highest wins' : 'lowest wins' }}
      </p>

      <div class="flex flex-col gap-2">
        @for (row of result().standings; track row.playerId) {
          <div
            class="flex items-center gap-3 px-3 py-2.5 rounded-[12px]
                   bg-white dark:bg-ink-900
                   shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-none"
          >
            <!-- Place -->
            <span
              class="font-display text-[1rem] font-bold w-5 text-center shrink-0"
              [class]="placeClasses(row.place)"
            >
              {{ row.place }}
            </span>

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
              @if (row.total < 0) {
                <p class="text-[0.63rem] text-ruby-500 dark:text-ruby-400 mt-[1px]">
                  Finished negative
                </p>
              }
            </div>

            <!-- Score -->
            <p
              class="shrink-0 font-display text-[1.25rem] font-bold"
              [class]="
                row.total < 0
                  ? 'text-ruby-600 dark:text-ruby-400'
                  : row.place === 1
                    ? 'text-gold-500 dark:text-gold-400'
                    : 'text-felt-600 dark:text-felt-400'
              "
            >
              {{ row.total }}
            </p>
          </div>
        }
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
        ▶ New Game
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
export class OpenScorerGameOverComponent {
  result = input.required<OpenScorerGameOverResult>();
  nextGame = output<void>();
  endNight = output<void>();

  private theme = inject(ThemeService);

  protected avatarColor(order: number) {
    return getAvatarColor(order, this.theme.isDark());
  }

  protected placeClasses(place: number): string {
    if (place === 1) return 'text-gold-400';
    if (place === 2) return 'text-ink-300 dark:text-ink-400';
    if (place === 3) return 'text-amber-600 dark:text-amber-700';
    return 'text-ink-500 dark:text-ink-600';
  }
}
