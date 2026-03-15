import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-game-setup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Game Setup — coming soon</p>`,
})
export class GameSetupComponent {}
