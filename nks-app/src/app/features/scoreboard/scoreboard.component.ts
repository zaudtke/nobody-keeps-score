import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { SessionService } from '../../core/services/session.service';
import { Game } from '../../core/models/game.model';
import { Player } from '../../core/models/player.model';
import { DirtyClubsScoreboardComponent } from '../dirty-clubs/dirty-clubs-scoreboard.component';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [DirtyClubsScoreboardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col h-full' },
  template: `
    @if (loading()) {
      <div class="flex-1 flex items-center justify-center bg-cream-50 dark:bg-ink-950">
        <p class="font-body text-ink-400 dark:text-ink-600 text-[0.88rem]">Loading…</p>
      </div>
    } @else if (game(); as g) {
      @switch (g.gameType) {
        @case ('dirty-clubs') {
          <app-dirty-clubs-scoreboard
            [sessionId]="sessionId"
            [gameId]="g.id"
            [players]="players()"
            [currentRound]="g.currentRound"
            (back)="goHome()"
            (navigateToSetup)="goToSetup($event)"
            (sessionArchived)="archiveAndGoHome()"
          />
        }
        @default {
          <div class="flex-1 flex items-center justify-center bg-cream-50 dark:bg-ink-950">
            <p class="font-body text-ink-400 dark:text-ink-600 text-[0.88rem]">
              Scoring for {{ g.gameType }} coming soon
            </p>
          </div>
        }
      }
    } @else {
      <div class="flex-1 flex items-center justify-center bg-cream-50 dark:bg-ink-950">
        <p class="font-body text-ruby-600 dark:text-ruby-400 text-[0.88rem]">Game not found.</p>
      </div>
    }
  `,
})
export class ScoreboardComponent {
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private destroyRef = inject(DestroyRef);

  protected readonly sessionId: string;
  protected game = signal<Game | null>(null);
  protected players = signal<Player[]>([]);
  protected loading = signal(true);

  constructor() {
    // Route params are available synchronously at construction time
    this.sessionId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

    // combineLatest + takeUntilDestroyed must run inside the injection context (constructor)
    // so that AngularFire's collectionData can resolve NgZone via inject()
    combineLatest([
      this.sessionService.getActiveGame$(this.sessionId),
      this.sessionService.getPlayers$(this.sessionId),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([game, players]) => {
        // Once a game is loaded, don't replace it with null if the status flips to
        // 'complete' — the child scoreboard handles its own game-over screen and will
        // navigate away when the user is done.
        if (game !== null || this.game() === null) {
          this.game.set(game);
        }
        this.players.set(players);
        this.loading.set(false);
      });
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }

  protected goToSetup(sessionId: string): void {
    this.router.navigate(['/game-setup'], { queryParams: { session: sessionId } });
  }

  protected async archiveAndGoHome(): Promise<void> {
    await this.sessionService.archiveSession(this.sessionId);
    this.router.navigate(['/']);
  }
}
