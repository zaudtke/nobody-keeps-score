import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { GameType } from '../../../core/models/game.model';
import { GAME_DEFS } from '../game-setup.constants';

@Component({
  selector: 'app-game-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      role="radio"
      [attr.aria-checked]="selected()"
      (click)="picked.emit()"
      [class]="cardClasses()"
    >
      <!-- Icon -->
      <span class="w-7 text-center text-[1.3rem] leading-none shrink-0" aria-hidden="true">
        {{ def().icon }}
      </span>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <p class="text-[0.88rem] font-semibold font-body text-ink-800 dark:text-ink-100">
          {{ def().name }}
        </p>
        <p class="text-[0.65rem] font-normal font-body mt-0.5 text-ink-400 dark:text-ink-500">
          {{ def().genre }}
        </p>
        <p
          class="text-[0.62rem] font-medium font-body mt-px tracking-[0.02em] text-felt-600 dark:text-felt-400"
        >
          {{ def().range }}
        </p>
      </div>

      <!-- Check circle -->
      <div
        class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
        [class]="
          selected() ? 'bg-felt-600 border-felt-600' : 'border-cream-300 dark:border-ink-600'
        "
      >
        @if (selected()) {
          <svg class="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
      </div>
    </button>
  `,
})
export class GameCardComponent {
  game = input.required<GameType>();
  selected = input<boolean>(false);
  /** True when this card is Open Scoring and its panel is attached below */
  attachPanel = input<boolean>(false);
  picked = output<void>();

  protected def = computed(() => GAME_DEFS[this.game()]);

  protected cardClasses = computed((): string => {
    const base =
      'w-full text-left p-[11px_14px] flex items-center gap-3 cursor-pointer outline-none ' +
      'border-2 transition-colors focus-visible:ring-2 focus-visible:ring-felt-400';
    const radius = this.attachPanel() ? 'rounded-t-[12px] rounded-b-none' : 'rounded-[12px]';
    const colors = this.selected()
      ? 'bg-felt-50 border-felt-500 dark:bg-[rgba(26,127,75,0.15)] dark:border-felt-500'
      : 'bg-white border-transparent shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:bg-ink-800 dark:border-transparent dark:shadow-none';
    return `${base} ${radius} ${colors}`;
  });
}
