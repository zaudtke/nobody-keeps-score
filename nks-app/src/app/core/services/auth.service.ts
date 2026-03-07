import { Injectable, inject } from '@angular/core';
import { Auth, signInAnonymously, user } from '@angular/fire/auth';
import { from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  readonly currentUser$ = user(this.auth);

  signInAnonymously() {
    return from(signInAnonymously(this.auth));
  }

  get uid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}
