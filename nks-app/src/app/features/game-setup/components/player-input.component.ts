import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { getAvatarColor } from '../game-setup.constants';

@Component({
  selector: 'app-player-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center gap-2.5 p-[6px_10px] rounded-[10px] border-2
             border-felt-500 bg-white shadow-[0_0_0_3px_rgba(26,127,75,0.1)]
             dark:bg-ink-800 dark:shadow-none"
    >
      <!-- Live-preview avatar -->
      <div
        class="w-[34px] h-[34px] rounded-full flex items-center justify-center
               text-[0.9rem] font-bold font-display shrink-0"
        [style.background-color]="avatarColor().bg"
        [style.color]="avatarColor().text"
        aria-hidden="true"
      >
        {{ previewInitial() }}
      </div>

      <!-- Input -->
      <input
        #nameInput
        type="text"
        aria-label="Player name"
        inputmode="text"
        autocomplete="off"
        maxlength="20"
        placeholder="Player name"
        [value]="value()"
        (input)="valueChange.emit($any($event.target).value)"
        (keydown.enter)="onConfirm()"
        class="flex-1 min-w-0 text-[0.88rem] font-medium font-body bg-transparent outline-none
               text-ink-900 placeholder:text-ink-300
               dark:text-ink-100 dark:placeholder:text-ink-600"
      />

      <!-- Confirm button -->
      <button
        aria-label="Confirm player name"
        [disabled]="!value().trim()"
        (click)="onConfirm()"
        class="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0
               bg-felt-600 text-white cursor-pointer outline-none transition-opacity
               focus-visible:ring-2 focus-visible:ring-felt-400
               disabled:opacity-35 disabled:cursor-not-allowed"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M2 7l4 4 6-6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  `,
})
export class PlayerInputComponent implements AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  value = input.required<string>();
  avatarPosition = input.required<number>();
  valueChange = output<string>();
  confirm = output<void>();
  dismissed = output<void>();

  private theme = inject(ThemeService);

  protected previewInitial = computed(() => {
    const v = this.value().trim();
    return v ? v.charAt(0).toUpperCase() : '';
  });

  protected avatarColor = computed(() =>
    getAvatarColor(this.avatarPosition(), this.theme.isDark()),
  );

  ngAfterViewInit(): void {
    this.nameInput.nativeElement.focus();
  }

  protected onConfirm(): void {
    if (this.value().trim()) {
      this.confirm.emit();
    }
  }
}
