import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- App Bar (minimal) -->
    <header class="flex items-center justify-between px-4 py-2.5 shrink-0
                   bg-felt-600 dark:bg-ink-900">
      <div class="font-display font-bold text-base tracking-tight leading-tight text-cream-100">
        NKS
        <small class="block font-body font-light text-[0.58rem] tracking-[0.04em] opacity-65">
          Nobody's Keeping Score
        </small>
      </div>
      <app-theme-toggle />
    </header>

    <!-- Centred content -->
    <div class="relative flex-1 flex flex-col items-center justify-center px-5 py-6 text-center overflow-hidden">
      <!-- Ruby glow -->
      <div class="absolute inset-0 pointer-events-none
                  bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(159,20,32,0.06)_0%,transparent_70%)]
                  block dark:hidden"></div>
      <div class="absolute inset-0 pointer-events-none
                  bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(159,20,32,0.12)_0%,transparent_70%)]
                  hidden dark:block"></div>

      <div class="text-[2.8rem] leading-none mb-4 relative">🃏</div>

      <h1 class="font-display text-[1.25rem] font-bold tracking-[-0.02em] leading-[1.1] mb-2.5 relative
                 text-ink-900 dark:text-cream-100">
        This app is for<br>private use
      </h1>

      <p class="text-[0.78rem] leading-[1.6] font-normal mb-7 relative max-w-60
                text-ink-500 dark:text-ink-400">
        You've signed in with a Google account that doesn't have access to this app.
      </p>

      <button
        (click)="tryAgain()"
        aria-label="Try a different Google account"
        class="relative w-full max-w-55 py-2.75 px-4 rounded-[10px] border border-cream-300 font-body text-[0.88rem]
               font-semibold cursor-pointer flex items-center justify-center gap-2
               bg-white text-ink-600
               dark:bg-transparent dark:border-ink-600 dark:text-ink-300
               focus-visible:ring-2 focus-visible:ring-felt-400 outline-none">
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Try a different account
      </button>

      <!-- NKS signature -->
      <div class="absolute bottom-7 left-0 right-0 text-center font-display text-[0.68rem] font-light italic tracking-[0.03em]
                  text-ink-300 dark:text-ink-700">
        Nobody's Keeping Score
      </div>
    </div>
  `,
  host: {
    class: 'flex flex-col h-full',
  },
})
export class UnauthorizedComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  async tryAgain(): Promise<void> {
    await this.authService.signOut();
    const user = await this.authService.signInWithGoogle();
    if (!user) return;
    const allowed = await this.authService.checkAllowlist(user.uid);
    if (allowed) {
      this.router.navigate(['/']);
    } else {
      await this.authService.signOut();
      // already on /unauthorized — no navigation needed
    }
  }
}
