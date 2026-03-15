import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-win-direction-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="mx-3 rounded-b-[12px] p-[10px_14px_12px] border border-t-0
             bg-felt-50 border-felt-100
             dark:bg-[rgba(26,127,75,0.08)] dark:border-[rgba(26,127,75,0.2)]"
    >
      <!-- Label -->
      <p
        class="text-[0.62rem] font-semibold tracking-[0.08em] uppercase mb-2
               text-ink-500 dark:text-ink-500"
      >
        Win Direction
      </p>

      <!-- Toggle -->
      <div
        role="radiogroup"
        aria-label="Win Direction"
        class="flex rounded-[8px] overflow-hidden border-[1.5px]
               border-felt-200 dark:border-ink-700"
      >
        <!-- High Score Wins -->
        <button
          role="radio"
          [attr.aria-checked]="winDirection() === 'high'"
          (click)="directionChange.emit('high')"
          class="flex-1 py-[7px] px-[10px] text-[0.78rem] font-semibold font-body text-center
                 border-r-[1.5px] border-felt-200 dark:border-ink-700
                 outline-none focus-visible:ring-2 focus-visible:ring-felt-400 focus-visible:ring-inset
                 transition-colors"
          [class]="
            winDirection() === 'high'
              ? 'bg-felt-600 text-white dark:bg-felt-700 dark:text-white'
              : 'bg-white text-ink-400 dark:bg-ink-900 dark:text-ink-400'
          "
        >
          High Wins
        </button>

        <!-- Low Score Wins -->
        <button
          role="radio"
          [attr.aria-checked]="winDirection() === 'low'"
          (click)="directionChange.emit('low')"
          class="flex-1 py-[7px] px-[10px] text-[0.78rem] font-semibold font-body text-center
                 outline-none focus-visible:ring-2 focus-visible:ring-felt-400 focus-visible:ring-inset
                 transition-colors"
          [class]="
            winDirection() === 'low'
              ? 'bg-amber-100 text-amber-600 dark:bg-[rgba(217,119,6,0.3)] dark:text-amber-400'
              : 'bg-white text-ink-400 dark:bg-ink-900 dark:text-ink-400'
          "
        >
          Low Wins
        </button>
      </div>

      <!-- Hint text -->
      <p class="text-[0.62rem] mt-1.5 text-ink-400 dark:text-ink-600">
        @if (winDirection() === 'high') {
          ↑ High score wins · host ends the game manually
        } @else {
          ↓ Low score wins · host ends the game manually
        }
      </p>

      <!-- Game Name input -->
      <div class="mt-3">
        <label
          for="open-game-name"
          class="block text-[0.62rem] font-semibold tracking-[0.06em] uppercase mb-1.5
                 text-ink-500 dark:text-ink-500"
        >
          Game Name
          <span class="font-normal normal-case tracking-normal ml-1 opacity-60">(optional)</span>
        </label>
        <input
          id="open-game-name"
          type="text"
          aria-label="Game name (optional)"
          inputmode="text"
          maxlength="30"
          [placeholder]="
            winDirection() === 'high' ? 'e.g. Scrabble, Yahtzee…' : 'e.g. Golf, Mini-golf…'
          "
          [value]="gameName()"
          (input)="nameChange.emit($any($event.target).value)"
          class="w-full rounded-[8px] border-[1.5px] p-[7px_10px] text-[0.82rem] font-normal font-body
                 outline-none focus-visible:ring-2 focus-visible:ring-felt-400
                 border-cream-300 text-ink-900 bg-white placeholder:text-ink-300
                 dark:border-ink-700 dark:text-ink-100 dark:bg-transparent dark:placeholder:text-ink-600"
        />
      </div>
    </div>
  `,
})
export class WinDirectionPanelComponent {
  winDirection = input.required<'high' | 'low'>();
  gameName = input.required<string>();
  directionChange = output<'high' | 'low'>();
  nameChange = output<string>();
}
