import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-add-player-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [disabled]="disabled()"
      (click)="!disabled() && add.emit()"
      [class]="rowClasses()"
      aria-label="Add a player"
    >
      <!-- Plus icon -->
      <div
        class="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 text-[1rem]
               bg-cream-100 text-ink-400
               dark:bg-[rgba(255,255,255,0.05)] dark:text-ink-500"
        aria-hidden="true"
      >
        +
      </div>

      <!-- Label -->
      <span class="text-[0.88rem] font-normal font-body text-ink-400 dark:text-ink-500">
        {{ label() }}
      </span>
    </button>
  `,
})
export class AddPlayerRowComponent {
  disabled = input<boolean>(false);
  hasPlayers = input<boolean>(false);
  add = output<void>();

  protected label = computed(() => {
    if (this.disabled()) return 'Select a game first';
    if (this.hasPlayers()) return 'Add another player';
    return 'Add a player';
  });

  protected rowClasses = computed((): string => {
    const base =
      'w-full flex items-center gap-2.5 p-[8px_10px] rounded-[10px] border-[1.5px] border-dashed ' +
      'outline-none focus-visible:ring-2 focus-visible:ring-felt-400 transition-opacity ' +
      'border-cream-300 bg-white dark:border-ink-700 dark:bg-transparent';
    return this.disabled() ? `${base} opacity-40 cursor-not-allowed` : `${base} cursor-pointer`;
  });
}
