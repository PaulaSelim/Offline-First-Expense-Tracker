import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenState } from '../../services/token.state';

export const authGuard: CanActivateFn = () => {
  const tokenState: TokenState = inject(TokenState);
  const router: Router = inject(Router);

  const accessToken: string | null = tokenState.getAccessToken();

  if (accessToken) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
