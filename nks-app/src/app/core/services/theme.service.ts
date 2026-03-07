import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _dark = signal<boolean>(
    localStorage.getItem('nks-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  readonly isDark = this._dark.asReadonly();

  toggle(): void {
    const next = !this._dark();
    this._dark.set(next);
    localStorage.setItem('nks-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  }

  init(): void {
    document.documentElement.classList.toggle('dark', this._dark());
  }
}
