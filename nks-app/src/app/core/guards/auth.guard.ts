import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (!user) {
    router.navigate(['/']);
    return false;
  }

  const allowed = await auth.checkAllowlist(user.uid);
  if (!allowed) {
    await auth.signOut();
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
