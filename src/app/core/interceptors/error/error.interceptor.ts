import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { ROUTER_LINKS } from '../../../../routes.model';
import { ERROR_MESSAGES } from './error.messages';

export const ErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const toast: ToastrService = inject(ToastrService);
  const router: Router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage: string;

      if (error.error?.detail?.message) {
        errorMessage = error.error.detail.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      } else {
        switch (error.status) {
          case 400:
            errorMessage = ERROR_MESSAGES.BAD_REQUEST;
            break;
          case 401:
            errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
            break;
          case 403:
            errorMessage = ERROR_MESSAGES.FORBIDDEN;
            router.navigate([ROUTER_LINKS.UNAUTHORIZED]);
            break;
          case 404:
            errorMessage = ERROR_MESSAGES.NOT_FOUND;
            break;
          case 409:
            errorMessage = ERROR_MESSAGES.CONFLICT;
            break;
          case 422:
            errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
            break;
          case 500:
            errorMessage = ERROR_MESSAGES.SERVER_ERROR;
            break;
          default:
            errorMessage = ERROR_MESSAGES.UNEXPECTED;
        }
      }

      toast.error(errorMessage);
      return throwError(() => error);
    }),
  );
};
