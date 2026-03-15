import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Scoreboard — coming soon</p>`,
})
export class ScoreboardComponent {}
