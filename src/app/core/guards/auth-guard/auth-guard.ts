import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from '../../../service/auth/auth.facade';

export const authGuard: CanActivateFn = async () => {
  const router: Router = inject(Router);

  const authFacade: AuthFacade = inject(AuthFacade);

  const isTokenValidGuard: boolean = await authFacade.isTokenValid();
  if (!isTokenValidGuard) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
