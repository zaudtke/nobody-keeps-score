import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/unauthorized/unauthorized.component').then(
        m => m.UnauthorizedComponent,
      ),
  },
  {
    path: 'game-setup',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/game-setup/game-setup.component').then(m => m.GameSetupComponent),
  },
  {
    path: 'game/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/scoreboard/scoreboard.component').then(m => m.ScoreboardComponent),
  },
];
