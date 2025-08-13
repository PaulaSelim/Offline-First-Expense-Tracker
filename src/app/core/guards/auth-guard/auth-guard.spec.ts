import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AuthFacade } from '../../../service/auth/auth.facade';
import { authGuard } from './auth-guard';
import { ROUTER_LINKS } from '../../../../routes.model';

describe('authGuard', () => {
  let router: Router;

  let mockAuthFacade: jasmine.SpyObj<AuthFacade>;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    mockAuthFacade = jasmine.createSpyObj<AuthFacade>('AuthFacade', [
      'isTokenValid',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideNoopAnimations(),
        provideToastr({
          timeOut: 0,
          preventDuplicates: true,
        }),
        provideRouter([
          { path: 'login', component: {} as any },
          { path: 'dashboard', component: {} as any },
        ]),
        { provide: AuthFacade, useValue: mockAuthFacade },
      ],
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when user has valid token', async () => {
    mockAuthFacade.isTokenValid.and.returnValue(Promise.resolve(true));
    const result = await executeGuard(
      {} as any,
      { url: ROUTER_LINKS.DASHBOARD } as any,
    );
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user has no token', async () => {
    mockAuthFacade.isTokenValid.and.returnValue(Promise.resolve(false));
    const result = await executeGuard(
      {} as any,
      { url: ROUTER_LINKS.DASHBOARD } as any,
    );
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith([ROUTER_LINKS.LOGIN]);
  });

  it('should react to token state changes', async () => {
    // Test 1: No token should deny access
    mockAuthFacade.isTokenValid.and.returnValues(
      Promise.resolve(false),
      Promise.resolve(true),
      Promise.resolve(false),
    );
    let result = await executeGuard(
      {} as any,
      { url: ROUTER_LINKS.DASHBOARD } as any,
    );
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith([ROUTER_LINKS.LOGIN]);

    (router.navigate as jasmine.Spy).calls.reset();

    result = await executeGuard(
      {} as any,
      { url: ROUTER_LINKS.DASHBOARD } as any,
    );
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();

    (router.navigate as jasmine.Spy).calls.reset();

    result = await executeGuard(
      {} as any,
      { url: ROUTER_LINKS.DASHBOARD } as any,
    );
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith([ROUTER_LINKS.LOGIN]);
  });

  it('should handle token validation properly', async () => {
    mockAuthFacade.isTokenValid.and.returnValue(Promise.resolve(true));
    const result = await executeGuard(
      {} as any,
      { url: ROUTER_LINKS.DASHBOARD } as any,
    );
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle null token properly', async () => {
    mockAuthFacade.isTokenValid.and.returnValue(Promise.resolve(false));
    const result = await executeGuard(
      {} as any,
      { url: ROUTER_LINKS.DASHBOARD } as any,
    );
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith([ROUTER_LINKS.LOGIN]);
  });
});
