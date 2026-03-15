import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { SetupPlayer, getAvatarColor } from '../game-setup.constants';

@Component({
  selector: 'app-player-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center gap-2.5 p-[8px_10px] rounded-[10px]
             bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]
             dark:bg-ink-800 dark:shadow-none"
    >
      <!-- Avatar -->
      <div
        class="w-[34px] h-[34px] rounded-full flex items-center justify-center
               text-[0.9rem] font-bold font-display shrink-0"
        [style.background-color]="avatarColor().bg"
        [style.color]="avatarColor().text"
        aria-hidden="true"
      >
        {{ initial() }}
      </div>

      <!-- Name -->
      <span
        class="flex-1 min-w-0 truncate text-[0.88rem] font-medium font-body
               text-ink-800 dark:text-ink-100"
      >
        {{ player().name }}
      </span>

      <!-- Remove button -->
      <button
        [attr.aria-label]="'Remove ' + player().name"
        (click)="remove.emit()"
        class="w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0
               cursor-pointer outline-none transition-opacity
               bg-cream-100 text-ink-400
               dark:bg-[rgba(255,255,255,0.05)] dark:text-ink-500
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
  `,
})
export class PlayerRowComponent {
  player = input.required<SetupPlayer>();
  remove = output<void>();

  private theme = inject(ThemeService);

  protected initial = computed(() => this.player().name.charAt(0).toUpperCase());
  protected avatarColor = computed(() =>
    getAvatarColor(this.player().avatarPosition, this.theme.isDark()),
  );
}
