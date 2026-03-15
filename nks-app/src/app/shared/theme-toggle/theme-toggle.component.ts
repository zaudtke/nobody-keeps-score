import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      (click)="theme.toggle()"
      [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      class="w-8 h-8 rounded-full flex items-center justify-center text-sm border-none cursor-pointer
             bg-white/15 text-white
             dark:bg-white/7 dark:text-ink-300
             focus-visible:ring-2 focus-visible:ring-felt-400 outline-none">
      {{ theme.isDark() ? '☾' : '☀' }}
    </button>
  `,
})
export class ThemeToggleComponent {
  protected theme = inject(ThemeService);
}
