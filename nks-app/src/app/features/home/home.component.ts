import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- App Bar -->
    <header
      class="flex items-center justify-between px-4 py-2.5 shrink-0
                   bg-felt-600 dark:bg-ink-900"
    >
      <div class="font-display font-bold text-base tracking-tight leading-tight text-cream-100">
        NKS
        <small class="block font-body font-light text-[0.58rem] tracking-[0.04em] opacity-65">
          Nobody's Keeping Score
        </small>
      </div>

      @if (isAuthenticated()) {
        <div
          [attr.aria-label]="'Signed in as ' + (authService.currentUser()?.displayName ?? '')"
          class="w-7.5 h-7.5 rounded-full flex items-center justify-center
                 text-[0.75rem] font-bold font-body shrink-0 border-2
                 bg-gold-100 border-gold-300 text-gold-700
                 dark:bg-[rgba(161,98,7,0.2)] dark:border-[rgba(234,179,8,0.4)] dark:text-gold-400"
        >
          {{ hostInitial() }}
        </div>
      } @else {
        <app-theme-toggle />
      }
    </header>

    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-5">
      @if (isAuthenticated()) {
        <!-- ── Authenticated State ── -->

        <!-- Greeting hero -->
        <div class="relative overflow-hidden px-4.5 pt-5 pb-4">
          <!-- dark glow -->
          <div
            class="absolute inset-0 pointer-events-none
                      bg-[radial-gradient(ellipse_100%_80%_at_10%_50%,rgba(26,127,75,0.12)_0%,transparent_65%)]
                      hidden dark:block"
          ></div>
          <div
            class="text-[0.68rem] font-medium tracking-[0.06em] uppercase mb-0.5
                      text-felt-600 dark:text-felt-400"
          >
            {{ greeting() }}
          </div>
          <div
            class="font-display text-[1.45rem] font-bold leading-[1.05] tracking-[-0.02em] relative
                      text-ink-900 dark:text-cream-100"
          >
            {{ hostName() }}
          </div>
          <div
            class="absolute right-4 top-1/2 -translate-y-1/2 text-[1.6rem] leading-none tracking-[-0.05em] pointer-events-none select-none
                      text-[rgba(26,127,75,0.12)] dark:text-[rgba(71,184,122,0.2)]"
          >
            ♠♣
          </div>
        </div>

        <!-- Start Game Night CTA -->
        <div class="px-3.5 pt-1">
          <button
            (click)="startGameNight()"
            aria-label="Start Game Night"
            class="relative w-full py-3.75 px-4 rounded-xl border-none font-display text-[1.05rem]
                   font-semibold tracking-[-0.01em] text-white cursor-pointer overflow-hidden
                   flex items-center justify-center gap-2
                   bg-linear-to-br from-felt-600 to-felt-700
                   shadow-[0_4px_16px_rgba(26,127,75,0.25)] dark:shadow-[0_4px_20px_rgba(26,127,75,0.35)]
                   focus-visible:ring-2 focus-visible:ring-felt-400 outline-none
                   after:content-['♣'] after:absolute after:right-4 after:text-[2rem] after:opacity-[0.12] after:leading-none"
          >
            🃏&nbsp; Start Game Night
          </button>
          <p
            class="text-center text-[0.63rem] mt-1.75
                    text-ink-400 dark:text-ink-700"
          >
            Routes to Game Setup
          </p>
        </div>

        <!-- Available games pills -->
        <div class="px-3.5 pt-4">
          <div
            class="text-[0.6rem] font-semibold tracking-[0.09em] uppercase mb-2
                      text-ink-400 dark:text-ink-600"
          >
            Available Games
          </div>
          <div class="flex flex-wrap gap-1.25">
            @for (game of games; track game.name) {
              <span
                class="px-2.25 py-1 rounded-full text-[0.65rem] font-medium flex items-center gap-1
                           bg-felt-50 border border-felt-100 text-felt-700
                           dark:bg-ink-800 dark:border-[rgba(255,255,255,0.05)] dark:text-felt-300"
              >
                {{ game.icon }} {{ game.name }}
              </span>
            }
          </div>
        </div>

        <!-- Sign out -->
        <div class="px-3.5 pt-5 flex justify-center">
          <button
            (click)="signOut()"
            aria-label="Sign out"
            class="font-body text-[0.68rem] font-medium bg-transparent border-none cursor-pointer
                   px-2 py-1 rounded-md flex items-center gap-1.25
                   text-ink-400 dark:text-ink-600
                   focus-visible:ring-2 focus-visible:ring-felt-400 outline-none"
          >
            Sign out
          </button>
        </div>
      } @else {
        <!-- ── Unauthenticated State ── -->

        <!-- Hero -->
        <div class="relative overflow-hidden px-5 pt-7 pb-5.5 text-center">
          <!-- light glow -->
          <div
            class="absolute inset-0 pointer-events-none
                      bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(26,127,75,0.10)_0%,transparent_70%)]
                      block dark:hidden"
          ></div>
          <!-- dark glow -->
          <div
            class="absolute inset-0 pointer-events-none
                      bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(26,127,75,0.18)_0%,transparent_70%)]
                      hidden dark:block"
          ></div>
          <div
            class="text-[1.1rem] tracking-[0.18em] mb-2.5 relative
                      text-[rgba(26,127,75,0.35)] dark:text-[rgba(71,184,122,0.45)]"
          >
            ♠ ♥ ♦ ♣
          </div>
          <h1
            class="font-display text-[1.55rem] font-bold leading-[1.05] tracking-[-0.025em] mb-1.5 relative
                     text-ink-900 dark:text-cream-100"
          >
            Nobody's<br />Keeping <em class="not-italic font-normal text-gold-400">Score</em>
          </h1>
          <p
            class="text-[0.72rem] font-light tracking-[0.03em] relative
                    text-ink-400 dark:text-ink-500"
          >
            Not that anyone's counting
          </p>
        </div>

        <!-- Description blurb -->
        <div class="px-4.5 mb-3.5 text-center">
          <p
            class="text-[0.75rem] leading-[1.55]
                    text-ink-500 dark:text-ink-400"
          >
            A personal scorekeeper for card game nights — fast to start, simple to track, satisfying
            to settle.
          </p>
        </div>

        <!-- Supported games grid -->
        <div class="px-3.5 mb-4">
          <div
            class="text-[0.62rem] font-semibold tracking-[0.09em] uppercase mb-2 text-center
                      text-ink-400 dark:text-ink-600"
          >
            Supported Games
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            @for (game of gameChips; track game.name) {
              <div
                class="rounded-[10px] p-[9px_10px] flex items-center gap-1.75
                          bg-white border border-cream-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)]
                          dark:bg-ink-800 dark:border-[rgba(255,255,255,0.05)] dark:shadow-none"
              >
                <span class="text-base leading-none shrink-0">{{ game.icon }}</span>
                <div>
                  <span
                    class="block text-[0.72rem] font-semibold leading-[1.2]
                               text-ink-700 dark:text-ink-200"
                    >{{ game.name }}</span
                  >
                  <span
                    class="block text-[0.58rem] font-normal leading-none mt-px
                               text-ink-400 dark:text-ink-600"
                    >{{ game.tag }}</span
                  >
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Hairline -->
        <div
          class="h-px mx-4 mb-4
                    bg-cream-200 dark:bg-[rgba(255,255,255,0.06)]"
        ></div>

        <!-- Google Sign-In -->
        <div class="px-3.5">
          <button
            (click)="signIn()"
            [disabled]="signingIn()"
            aria-label="Sign in with Google"
            class="w-full py-2.75 px-4 rounded-[10px] border border-cream-300 font-body text-[0.88rem]
                   font-semibold cursor-pointer flex items-center justify-center gap-2
                   bg-white text-ink-800 shadow-[0_1px_4px_rgba(0,0,0,0.07)]
                   dark:bg-transparent dark:border-ink-600 dark:text-ink-100 dark:shadow-none
                   disabled:opacity-60 disabled:cursor-not-allowed
                   focus-visible:ring-2 focus-visible:ring-felt-400 outline-none"
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {{ signingIn() ? 'Signing in…' : 'Sign in with Google' }}
          </button>
          <p
            class="text-center text-[0.62rem] mt-1.75
                    text-ink-400 dark:text-ink-700"
          >
            Host access only · Private use
          </p>
        </div>
      }
    </div>
  `,
  host: {
    class: 'flex flex-col h-full',
  },
})
export class HomeComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  protected signingIn = signal(false);

  protected isAuthenticated = computed(() => this.authService.currentUser() !== null);

  protected hostName = computed(() => {
    const name = this.authService.currentUser()?.displayName ?? '';
    return name.split(' ')[0];
  });

  protected hostInitial = computed(() => this.hostName().charAt(0).toUpperCase());

  protected greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  });

  protected readonly games = [
    { icon: '♣', name: 'Dirty Clubs' },
    { icon: '🃏', name: 'Canasta' },
    { icon: '👑', name: '5 Crowns' },
    { icon: '✏️', name: 'Open' },
  ];

  protected readonly gameChips = [
    { icon: '♣', name: 'Dirty Clubs', tag: 'Trump trick-taking' },
    { icon: '🃏', name: 'Canasta', tag: 'Meld & draw' },
    { icon: '👑', name: '5 Crowns', tag: 'Rummy variant' },
    { icon: '✏️', name: 'Open Scoring', tag: 'Any game' },
  ];

  async signIn(): Promise<void> {
    this.signingIn.set(true);
    try {
      const user = await this.authService.signInWithGoogle();
      if (!user) return;
      const allowed = await this.authService.checkAllowlist(user.uid);
      if (!allowed) {
        await this.authService.signOut();
        this.router.navigate(['/unauthorized']);
      }
      // allowed: currentUser signal updates → template re-renders automatically
    } finally {
      this.signingIn.set(false);
    }
  }

  startGameNight(): void {
    this.router.navigate(['/game-setup']);
  }

  signOut(): void {
    this.authService.signOut();
  }
}
