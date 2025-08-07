import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, from, tap } from 'rxjs';
import { TokenState } from '../services/token.state';
import { AuthApiService } from '../../core/api/authApi/authApi.service';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const tokenState: TokenState = inject(TokenState);
  const authApiService: AuthApiService = inject(AuthApiService);

  const accessToken: string | null = tokenState.getAccessToken();
  const refreshToken: string | null = tokenState.getRefreshToken();

  const authReq: HttpRequest<unknown> = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const is403: boolean = error.status === 403;
      const isNotRefreshEndpoint: boolean = !req.url.endsWith('/users/refresh');
      const messageContainsToken: boolean =
        typeof error?.error?.detail?.message === 'string' &&
        error.error.detail.message.toLowerCase().includes('token');

      if (
        is403 &&
        isNotRefreshEndpoint &&
        refreshToken &&
        messageContainsToken
      ) {
        return from(authApiService.refreshToken(refreshToken)).pipe(
          tap((res: { token: string; refresh_token: string }) => {
            tokenState.setAccessToken(res.token);
            tokenState.setRefreshToken(res.refresh_token);
          }),
          switchMap(() => {
            const newAccessToken: string | null = tokenState.getAccessToken();
            if (!newAccessToken) return throwError(() => error);

            const retryReq: HttpRequest<unknown> = req.clone({
              setHeaders: { Authorization: `Bearer ${newAccessToken}` },
            });

            return next(retryReq);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
