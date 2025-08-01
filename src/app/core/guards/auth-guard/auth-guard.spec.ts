import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router } from '@angular/router';

import { AuthService } from '../../service/auth/auth.service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;

  // Mock localStorage
  let mockLocalStorage: { [key: string]: string } = {};

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake(
      (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
    );

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(router, 'navigate');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when user is logged in', () => {
    // Set up authenticated state
    authService.currentUser.set({
      id: '1',
      username: 'testuser',
      role: 'user',
      createdAt: '',
    });

    const result = executeGuard({} as any, { url: '/dashboard' } as any);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not logged in', () => {
    // Ensure user is not logged in (default state)
    expect(authService.isLoggedIn()).toBe(false);

    const result = executeGuard({} as any, { url: '/dashboard' } as any);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard' },
    });
  });

  it('should redirect to login with correct return URL for protected routes', () => {
    // Ensure user is not logged in
    authService.currentUser.set(null);

    const protectedRoute = '/protected/page';
    const result = executeGuard({} as any, { url: protectedRoute } as any);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: protectedRoute },
    });
  });

  it('should react to changes in authentication state', () => {
    // Start logged out
    expect(authService.isLoggedIn()).toBe(false);

    let result = executeGuard({} as any, { url: '/dashboard' } as any);
    expect(result).toBe(false);

    // Log in user
    authService.currentUser.set({
      id: '1',
      username: 'testuser',
      role: 'user',
      createdAt: '',
    });
    expect(authService.isLoggedIn()).toBe(true);

    result = executeGuard({} as any, { url: '/dashboard' } as any);
    expect(result).toBe(true);

    // Log out user
    authService.currentUser.set(null);
    expect(authService.isLoggedIn()).toBe(false);

    result = executeGuard({} as any, { url: '/dashboard' } as any);
    expect(result).toBe(false);
  });
});
