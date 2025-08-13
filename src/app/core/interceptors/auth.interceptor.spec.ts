import { TestBed } from '@angular/core/testing';
import { HttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { TokenState } from '../services/token-state/token.state';
import { AuthFacade } from '../../service/auth/auth.facade';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideZonelessChangeDetection } from '@angular/core';
import { ROUTER_LINKS } from '../../../routes.model';
import { AuthInterceptor } from './auth/auth.interceptor';
describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let tokenState: jasmine.SpyObj<TokenState>;
  let authFacade: jasmine.SpyObj<AuthFacade>;

  beforeEach(() => {
    tokenState = jasmine.createSpyObj<TokenState>('TokenState', [
      'getAccessToken',
      'getRefreshToken',
    ]);
    authFacade = jasmine.createSpyObj<AuthFacade>('AuthFacade', [
      'refreshToken',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenState, useValue: tokenState },
        { provide: AuthFacade, useValue: authFacade },
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideToastr(),
        provideZonelessChangeDetection(),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header if access token exists', () => {
    tokenState.getAccessToken.and.returnValue('token123');
    httpClient.get('/test').subscribe();
    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
    req.flush({});
  });

  it('should not add Authorization header if no access token', () => {
    tokenState.getAccessToken.and.returnValue(null);
    httpClient.get('/test').subscribe();
    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should not retry if error is not 403', () => {
    tokenState.getAccessToken.and.returnValue('token123');
    httpClient.get(ROUTER_LINKS.DASHBOARD).subscribe({
      error: (err) => {
        expect(err.status).toBe(500);
      },
    });
    const req = httpMock.expectOne(ROUTER_LINKS.DASHBOARD);
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('should not retry if error message does not contain token', () => {
    tokenState.getAccessToken.and.returnValue('token123');
    tokenState.getRefreshToken.and.returnValue('refreshToken');
    httpClient.get(ROUTER_LINKS.DASHBOARD).subscribe({
      error: (err) => {
        expect(err.status).toBe(403);
      },
    });
    const req = httpMock.expectOne(ROUTER_LINKS.DASHBOARD);
    req.flush(
      { detail: { message: 'Other error' } },
      { status: 403, statusText: 'Forbidden' },
    );
  });

  it('should not retry if refreshToken is missing', () => {
    tokenState.getAccessToken.and.returnValue('token123');
    tokenState.getRefreshToken.and.returnValue(null);
    httpClient.get(ROUTER_LINKS.DASHBOARD).subscribe({
      error: (err) => {
        expect(err.status).toBe(403);
      },
    });
    const req = httpMock.expectOne(ROUTER_LINKS.DASHBOARD);
    req.flush(
      { detail: { message: 'Token expired' } },
      { status: 403, statusText: 'Forbidden' },
    );
  });
});
