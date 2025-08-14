import { ErrorInterceptor } from './error.interceptor';
import { ERROR_MESSAGES } from './error.messages';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { runInInjectionContext, Injector } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ErrorInterceptor', () => {
  let toastSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let next: jasmine.Spy<HttpHandlerFn>;
  let req: HttpRequest<unknown>;
  let injector: Injector;

  beforeEach(() => {
    toastSpy = jasmine.createSpyObj('ToastrService', ['error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToastrService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    req = new HttpRequest('GET', '/test');
    next = jasmine.createSpy('next');
    injector = TestBed.inject(Injector);
  });

  it('should show detail message if present', (done) => {
    const errorResponse = new HttpErrorResponse({
      error: { detail: { message: 'Custom error' } },
      status: 400,
    });
    next.and.returnValue(throwError(() => errorResponse));

    runInInjectionContext(injector, () => {
      ErrorInterceptor(req, next).subscribe({
        error: () => {
          expect(toastSpy.error).toHaveBeenCalledWith('Custom error');
          done();
        },
      });
    });
  });

  it('should show unable to connect for status 0', (done) => {
    const errorResponse = new HttpErrorResponse({ status: 0 });
    next.and.returnValue(throwError(() => errorResponse));

    runInInjectionContext(injector, () => {
      ErrorInterceptor(req, next).subscribe({
        error: () => {
          expect(toastSpy.error).toHaveBeenCalledWith(
            'Unable to connect to server',
          );
          done();
        },
      });
    });
  });

  it('should show correct message for 401', (done) => {
    const errorResponse = new HttpErrorResponse({ status: 401 });
    next.and.returnValue(throwError(() => errorResponse));

    runInInjectionContext(injector, () => {
      ErrorInterceptor(req, next).subscribe({
        error: () => {
          expect(toastSpy.error).toHaveBeenCalledWith(
            ERROR_MESSAGES.UNAUTHORIZED,
          );
          done();
        },
      });
    });
  });

  it('should navigate to unauthorized for 403', (done) => {
    const errorResponse = new HttpErrorResponse({ status: 403 });
    next.and.returnValue(throwError(() => errorResponse));

    runInInjectionContext(injector, () => {
      ErrorInterceptor(req, next).subscribe({
        error: () => {
          expect(routerSpy.navigate).toHaveBeenCalled();
          expect(toastSpy.error).toHaveBeenCalledWith(ERROR_MESSAGES.FORBIDDEN);
          done();
        },
      });
    });
  });

  it('should show unexpected error for unknown status', (done) => {
    const errorResponse = new HttpErrorResponse({ status: 999 });
    next.and.returnValue(throwError(() => errorResponse));

    runInInjectionContext(injector, () => {
      ErrorInterceptor(req, next).subscribe({
        error: () => {
          expect(toastSpy.error).toHaveBeenCalledWith(
            ERROR_MESSAGES.UNEXPECTED,
          );
          done();
        },
      });
    });
  });
});
