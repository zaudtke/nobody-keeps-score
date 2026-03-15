import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameType } from '../../core/models/game.model';
import { SessionService } from '../../core/services/session.service';
import { AddPlayerRowComponent } from './components/add-player-row.component';
import { GameCardComponent } from './components/game-card.component';
import { PlayerInputComponent } from './components/player-input.component';
import { PlayerRowComponent } from './components/player-row.component';
import { ReturningBannerComponent } from './components/returning-banner.component';
import { WinDirectionPanelComponent } from './components/win-direction-panel.component';
import { ALL_GAMES, GAME_CONSTRAINTS, GAME_LABELS, SetupPlayer } from './game-setup.constants';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  imports: [
    GameCardComponent,
    WinDirectionPanelComponent,
    PlayerRowComponent,
    PlayerInputComponent,
    AddPlayerRowComponent,
    ReturningBannerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col h-full bg-cream-50 dark:bg-ink-950' },
  template: `
    <!-- App Bar -->
    <header
      class="flex items-center justify-between px-4 py-2.5 shrink-0
             bg-felt-600 dark:bg-ink-900"
    >
      <!-- Back button -->
      <button
        (click)="goBack()"
        aria-label="Back to Home"
        class="w-8 h-8 rounded-full flex items-center justify-center
               text-white text-[1rem] leading-none cursor-pointer outline-none
               bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(255,255,255,0.07)] dark:text-ink-200
               focus-visible:ring-2 focus-visible:ring-white"
      >
        ‹
      </button>

      <!-- Title -->
      <div class="text-center">
        <p class="font-display font-bold text-[1rem] leading-tight text-cream-100">
          {{ isReturning() ? 'New Game' : 'Game Setup' }}
        </p>
        <small
          class="block font-body font-light text-[0.58rem] tracking-[0.04em] opacity-65 text-cream-100"
        >
          {{ isReturning() ? 'Same night · adjust if needed' : 'Pick a game · Add players' }}
        </small>
      </div>

      <!-- Spacer (mirrors back button) -->
      <div class="w-8" aria-hidden="true"></div>
    </header>

    <!-- Scrollable body -->
    <div
      class="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <!-- Returning banner -->
      @if (isReturning()) {
        <app-returning-banner [previousGame]="previousGame()" />
      }

      <!-- Game Type Section -->
      <section aria-label="Game Type">
        <div
          class="text-[0.62rem] font-semibold tracking-[0.09em] uppercase
                 pt-3.5 pb-2 px-4
                 text-ink-400 dark:text-ink-600"
        >
          Game Type
        </div>

        <div class="px-3 flex flex-col gap-1.5" role="radiogroup" aria-label="Game Type">
          @for (game of gameCardList(); track game) {
            <app-game-card
              [game]="game"
              [selected]="selectedGame() === game"
              [attachPanel]="game === 'open' && selectedGame() === 'open'"
              (picked)="selectGame(game)"
            />
            @if (game === 'open' && selectedGame() === 'open') {
              <app-win-direction-panel
                [winDirection]="winDirection()"
                [gameName]="gameName()"
                (directionChange)="setWinDirection($event)"
                (nameChange)="gameName.set($event)"
              />
            }
          }
        </div>
      </section>

      <!-- Hairline divider -->
      <div class="h-px my-3 mx-4 bg-cream-200 dark:bg-[rgba(255,255,255,0.06)]"></div>

      <!-- Players Section -->
      <section aria-label="Players">
        <!-- Section header -->
        <div class="flex items-center justify-between px-4 pb-2">
          <span
            class="text-[0.62rem] font-semibold tracking-[0.09em] uppercase
                   text-ink-400 dark:text-ink-600"
          >
            Players
          </span>
          <span
            [class]="countBadgeClasses()"
            aria-live="polite"
            [attr.aria-label]="countBadgeLabel()"
          >
            {{ countBadgeLabel() }}
          </span>
        </div>

        <!-- Player rows -->
        <div class="px-3 flex flex-col gap-1.5">
          @for (player of players(); track player.id) {
            <app-player-row [player]="player" (remove)="removePlayer(player.id)" />
          }

          @if (isAddingPlayer()) {
            <app-player-input
              [value]="addPlayerInput()"
              [avatarPosition]="playerCount() + 1"
              (valueChange)="addPlayerInput.set($event)"
              (confirm)="confirmPlayer()"
              (dismissed)="isAddingPlayer.set(false)"
            />
          } @else if (selectedGame() && playerCount() >= gameConstraints().max) {
            <p class="text-center text-[0.65rem] py-1.5 px-4 text-ink-400 dark:text-ink-600">
              Maximum {{ gameConstraints().max }} players for {{ selectedGameLabel() }}
            </p>
          } @else {
            <app-add-player-row
              [disabled]="!selectedGame()"
              [hasPlayers]="playerCount() > 0"
              (add)="beginAddPlayer()"
            />
          }
        </div>
      </section>

      <!-- CTA Area -->
      <div class="px-3 pt-3.5 pb-2">
        <button
          [disabled]="!canStart()"
          (click)="startGame()"
          [attr.aria-label]="'Start ' + ctaLabel()"
          [attr.aria-disabled]="!canStart()"
          class="relative w-full py-3.5 px-4 rounded-[12px] border-none font-display text-[1rem]
                 font-semibold tracking-[-0.01em] text-white cursor-pointer overflow-hidden
                 flex items-center justify-center
                 bg-linear-to-br from-felt-600 to-felt-700
                 transition-all outline-none focus-visible:ring-2 focus-visible:ring-felt-400
                 disabled:opacity-35 disabled:cursor-not-allowed"
          [class]="
            canStart()
              ? 'shadow-[0_4px_16px_rgba(26,127,75,0.25)] dark:shadow-[0_4px_20px_rgba(26,127,75,0.35)]'
              : ''
          "
        >
          <!-- Watermark icon -->
          <span
            class="absolute right-4 text-[2rem] opacity-[0.12] leading-none pointer-events-none select-none"
            aria-hidden="true"
          >
            {{ watermarkIcon() }}
          </span>
          {{ ctaLabel() }}
        </button>

        <p class="text-center text-[0.63rem] mt-1.5 text-ink-400 dark:text-ink-700">
          {{ ctaHint() }}
        </p>
      </div>
    </div>
  `,
})
export class GameSetupComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);

  // ── Game selection ─────────────────────────────
  selectedGame = signal<GameType | null>(null);

  // ── Open Scoring config ────────────────────────
  winDirection = signal<'high' | 'low'>('high');
  gameName = signal<string>('');

  // ── Players ────────────────────────────────────
  players = signal<SetupPlayer[]>([]);
  addPlayerInput = signal<string>('');
  isAddingPlayer = signal<boolean>(false);

  // ── Returning mode ─────────────────────────────
  isReturning = signal<boolean>(false);
  previousGame = signal<string>('');

  // ── Derived ────────────────────────────────────
  protected gameConstraints = computed(() => GAME_CONSTRAINTS[this.selectedGame() ?? 'open']);

  protected playerCount = computed(() => this.players().length);

  protected countIsValid = computed(
    () =>
      this.playerCount() >= this.gameConstraints().min &&
      this.playerCount() <= this.gameConstraints().max,
  );

  protected canStart = computed(
    () => this.selectedGame() !== null && this.countIsValid() && !this.isAddingPlayer(),
  );

  protected selectedGameLabel = computed(() => {
    const game = this.selectedGame();
    if (!game) return '';
    if (game === 'open') {
      const name = this.gameName().trim();
      return name || GAME_LABELS[game];
    }
    return GAME_LABELS[game];
  });

  protected ctaLabel = computed(() => {
    const game = this.selectedGame();
    if (!game) return 'Start Game';
    return `Start ${this.selectedGameLabel()}`;
  });

  protected ctaHint = computed((): string => {
    const game = this.selectedGame();
    const count = this.playerCount();

    if (!game) return 'Select a game and add players to begin';
    if (this.isAddingPlayer()) return 'Confirm player name to continue';
    if (!this.countIsValid()) {
      return `Add at least ${this.gameConstraints().min} players to begin`;
    }

    // Ready state
    const n = count;
    switch (game) {
      case 'dirty-clubs':
        return `${n} players · first to 15 points wins`;
      case 'canasta':
        return `${n} players · most points wins`;
      case '5-crowns':
        return `${n} players · lowest score wins`;
      case 'open':
        return this.winDirection() === 'high'
          ? `${n} players · ↑ high score wins`
          : `${n} players · ↓ low score wins`;
    }
  });

  protected watermarkIcon = computed(() => {
    const game = this.selectedGame();
    if (!game || game !== 'open') return '♣';
    return '✏️';
  });

  protected gameCardList = computed((): GameType[] => {
    const game = this.selectedGame();
    // Collapse to selected card once players start being added
    if (game && this.playerCount() > 0) return [game];
    return [...ALL_GAMES];
  });

  protected countBadgeLabel = computed((): string => {
    const game = this.selectedGame();
    const count = this.playerCount();
    if (!game) return '0 added';
    const { min, max } = this.gameConstraints();
    return `${count} of ${min} – ${max}`;
  });

  protected countBadgeClasses = computed((): string => {
    const base = 'text-[0.65rem] font-semibold font-body px-2 py-0.5 rounded-full border';
    if (this.countIsValid()) {
      return `${base} bg-felt-50 border-felt-100 text-felt-600 dark:bg-[rgba(26,127,75,0.2)] dark:border-transparent dark:text-felt-400`;
    }
    return `${base} bg-cream-100 border-cream-200 text-ink-400 dark:bg-ink-800 dark:border-transparent dark:text-ink-400`;
  });

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session');
    if (sessionId) {
      this.loadReturningSession(sessionId);
    }
  }

  private async loadReturningSession(sessionId: string): Promise<void> {
    // Returning flow — load previous session game type and players
    // This is triggered from the Game Over screen (future feature)
    // For now, the fresh start flow handles all current use cases
    void sessionId;
  }

  // ── Methods ────────────────────────────────────

  protected goBack(): void {
    this.router.navigate(['/']);
  }

  protected selectGame(game: GameType): void {
    const previous = this.selectedGame();
    if (previous === game) return;

    // Reset open scoring config when switching away from open
    if (previous === 'open') {
      this.winDirection.set('high');
      this.gameName.set('');
    }

    // Reset players when switching games
    if (this.playerCount() > 0) {
      this.players.set([]);
      this.isAddingPlayer.set(false);
      this.addPlayerInput.set('');
    }

    this.selectedGame.set(game);
  }

  protected setWinDirection(direction: 'high' | 'low'): void {
    this.winDirection.set(direction);
  }

  protected beginAddPlayer(): void {
    this.isAddingPlayer.set(true);
    this.addPlayerInput.set('');
  }

  protected confirmPlayer(): void {
    const name = this.addPlayerInput().trim();
    if (!name) return;

    const nextPosition = this.playerCount() + 1;
    this.players.update((list) => [
      ...list,
      { id: crypto.randomUUID(), name, avatarPosition: nextPosition },
    ]);
    this.addPlayerInput.set('');
    this.isAddingPlayer.set(false);
  }

  protected removePlayer(id: string): void {
    this.players.update((list) => list.filter((p) => p.id !== id));
  }

  protected async startGame(): Promise<void> {
    if (!this.canStart()) return;

    const game = this.selectedGame()!;
    const config =
      game === 'open'
        ? {
            winDirection: this.winDirection(),
            gameName: this.gameName().trim() || 'Open Game',
          }
        : null;

    const playerNames = this.players().map((p) => p.name);
    const sessionId = await this.sessionService.createSession(game, config, playerNames);
    this.router.navigate(['/game', sessionId]);
  }
}
