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
            errorMessage = 'Bad Request: Invalid request data';
            break;
          case 401:
            errorMessage = 'Authentication required or invalid';
            break;
          case 403:
            errorMessage = 'Access denied';
            router.navigate(['/unauthorized']);
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 409:
            errorMessage = 'Resource conflict (e.g., duplicate email)';
            break;
          case 422:
            errorMessage = 'Validation errors';
            break;
          case 500:
            errorMessage = 'Internal Server Error';
            break;
          default:
            errorMessage = 'An unexpected error occurred';
        }
      }

      toast.error(errorMessage);
      return throwError(() => error);
    }),
  );
};
