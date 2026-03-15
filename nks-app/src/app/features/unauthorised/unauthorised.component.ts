import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-unauthorised',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Unauthorised — coming soon</p>`,
})
export class UnauthorisedComponent {}
