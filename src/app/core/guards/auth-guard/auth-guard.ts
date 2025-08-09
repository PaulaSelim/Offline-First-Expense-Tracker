import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from '../../../service/auth/auth.facade';
import { setAuthError } from '../../state-management/auth.state';

export const authGuard: CanActivateFn = async () => {
  const router: Router = inject(Router);
  const authFacade: AuthFacade = inject(AuthFacade);

  try {
    const isTokenValid: boolean = await authFacade.isTokenValid();

    if (!isTokenValid) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  } catch (error: unknown) {
    setAuthError((error as Error).message || 'Authentication error');
    return true;
  }
};
