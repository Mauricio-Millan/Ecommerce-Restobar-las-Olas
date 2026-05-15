import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    await auth.ensureProfileLoaded();
    if (auth.isAdmin()) {
      return true;
    }
  } catch {
    // Fall through to redirect.
  }

  await router.navigateByUrl('/');
  return false;
};
