import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router } from '@angular/router';

import { LocalStorage } from '../../services/local-storage';
import { TokenState } from '../../services/token.state';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let tokenState: TokenState;
  let localStorage: LocalStorage;
  let router: Router;

  // Mock localStorage
  let mockLocalStorage: { [key: string]: string } = {};

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    mockLocalStorage = {};

    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(Storage.prototype, 'setItem').and.callFake(
      (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
    );

    spyOn(Storage.prototype, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'login', component: {} as any },
          { path: 'dashboard', component: {} as any },
        ]),
        TokenState,
        LocalStorage,
      ],
    });

    tokenState = TestBed.inject(TokenState);
    localStorage = TestBed.inject(LocalStorage);
    router = TestBed.inject(Router);

    spyOn(router, 'navigate');
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when user has valid token', () => {
    mockLocalStorage['token'] = 'valid-token';
    tokenState.setAccessToken('valid-token');

    const result = executeGuard({} as any, { url: '/dashboard' } as any);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user has no token', () => {
    mockLocalStorage = {};
    tokenState.clearTokens();

    const result = executeGuard({} as any, { url: '/dashboard' } as any);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login when token is null', () => {
    mockLocalStorage['token'] = '';
    tokenState.clearTokens();

    const result = executeGuard({} as any, { url: '/protected' } as any);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should work with different routes', () => {
    mockLocalStorage['token'] = 'another-valid-token';
    tokenState.setAccessToken('another-valid-token');

    let result = executeGuard({} as any, { url: '/admin' } as any);
    expect(result).toBe(true);

    result = executeGuard({} as any, { url: '/profile' } as any);
    expect(result).toBe(true);

    tokenState.clearTokens();
    mockLocalStorage = {};

    result = executeGuard({} as any, { url: '/admin' } as any);
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should react to token state changes', () => {
    tokenState.clearTokens();
    mockLocalStorage = {};

    let result = executeGuard({} as any, { url: '/dashboard' } as any);
    expect(result).toBe(false);

    mockLocalStorage['token'] = 'new-token';
    tokenState.setAccessToken('new-token');

    result = executeGuard({} as any, { url: '/dashboard' } as any);
    expect(result).toBe(true);

    tokenState.clearTokens();
    mockLocalStorage = {};

    result = executeGuard({} as any, { url: '/dashboard' } as any);
    expect(result).toBe(false);
  });

  it('should verify token state management', () => {
    tokenState.setAccessToken('test-token');
    expect(tokenState.getAccessToken()).toBe('test-token');

    tokenState.clearTokens();
    expect(tokenState.getAccessToken()).toBe(null);
  });

  it('should handle malformed tokens gracefully', () => {
    mockLocalStorage['token'] = 'malformed-or-expired-token';
    tokenState.setAccessToken('malformed-or-expired-token');

    const result = executeGuard({} as any, { url: '/dashboard' } as any);

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle empty string token as no token', () => {
    mockLocalStorage['token'] = '';
    tokenState.setAccessToken('');

    const result = executeGuard({} as any, { url: '/dashboard' } as any);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
