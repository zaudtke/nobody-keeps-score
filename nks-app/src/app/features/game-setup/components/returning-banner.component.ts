import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-returning-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="mx-3 mt-2.5 rounded-[10px] p-[10px_12px] flex items-center gap-2.5 border
             bg-felt-50 border-felt-100
             dark:bg-[rgba(26,127,75,0.12)] dark:border-[rgba(26,127,75,0.2)]"
    >
      <span class="text-[1.1rem] leading-none shrink-0" aria-hidden="true">🔁</span>
      <div>
        <p class="text-[0.78rem] font-semibold font-body text-felt-700 dark:text-felt-300">
          Players carried over
        </p>
        <p class="text-[0.65rem] font-normal font-body mt-px text-ink-400 dark:text-ink-500">
          From previous {{ previousGame() }} game
        </p>
      </div>
    </div>
  `,
})
export class ReturningBannerComponent {
  previousGame = input.required<string>();
}
