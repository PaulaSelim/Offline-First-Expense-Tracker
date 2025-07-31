import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AuthApiService } from '../../core/api/authApi/authApi.service';
import { ToastrService } from 'ngx-toastr';
import { TokenState } from '../../core/state-management/token.state';

import {
  LoginRequest,
  RegisterRequest,
  AuthenticationResponse,
  AuthenticationTokens,
} from '../../core/api/authApi/authApi.model';
import { AuthFacade } from './auth.facade';

describe('AuthFacade', () => {
  let service: AuthFacade;
  let mockAuthApi: jasmine.SpyObj<AuthApiService>;
  let mockToast: jasmine.SpyObj<ToastrService>;
  let mockTokenState: jasmine.SpyObj<TokenState>;

  const mockResponse: AuthenticationResponse = {
    data: {
      token: 'mock-token',
      refresh_token: 'mock-refresh',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
      },
    },
  };

  beforeEach(() => {
    const authApiSpy = jasmine.createSpyObj('AuthApiService', [
      'login',
      'register',
      'refreshToken',
    ]);
    const toastSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
    ]);
    const tokenStateSpy = jasmine.createSpyObj('TokenState', [
      'setTokens',
      'clearTokens',
      'getAccessToken',
      'getRefreshToken',
    ]);

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: AuthApiService, useValue: authApiSpy },
        { provide: ToastrService, useValue: toastSpy },
        { provide: TokenState, useValue: tokenStateSpy },
        provideZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(AuthFacade);
    mockAuthApi = TestBed.inject(
      AuthApiService,
    ) as jasmine.SpyObj<AuthApiService>;
    mockToast = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    mockTokenState = TestBed.inject(TokenState) as jasmine.SpyObj<TokenState>;
  });

  describe('login', () => {
    const loginData: LoginRequest = { email: 'test', password: 'password' };

    it('should call login API and handle success', () => {
      mockAuthApi.login.and.returnValue(of(mockResponse));

      service.login(loginData);

      expect(mockAuthApi.login).toHaveBeenCalledWith(loginData);
      expect(mockTokenState.setTokens).toHaveBeenCalledWith(
        'mock-token',
        'mock-refresh',
      );
      expect(mockToast.success).toHaveBeenCalledWith('Login successful!');
    });

    it('should handle login error', () => {
      mockAuthApi.login.and.returnValue(
        throwError(() => new Error('Login failed')),
      );

      service.login(loginData);

      expect(mockAuthApi.login).toHaveBeenCalledWith(loginData);
      expect(mockToast.error).toHaveBeenCalledWith(
        'Login failed. Please try again.',
      );
      expect(mockTokenState.setTokens).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerData: RegisterRequest = {
      username: 'test',
      password: 'password',
      email: 'test@test.com',
    };

    it('should call register API and handle success', () => {
      mockAuthApi.register.and.returnValue(of(mockResponse));

      service.register(registerData);

      expect(mockAuthApi.register).toHaveBeenCalledWith(registerData);
      expect(mockTokenState.setTokens).toHaveBeenCalledWith(
        'mock-token',
        'mock-refresh',
      );
      expect(mockToast.success).toHaveBeenCalledWith(
        'Registration successful!',
      );
    });

    it('should handle registration error', () => {
      mockAuthApi.register.and.returnValue(
        throwError(() => new Error('Registration failed')),
      );

      service.register(registerData);

      expect(mockAuthApi.register).toHaveBeenCalledWith(registerData);
      expect(mockToast.error).toHaveBeenCalledWith(
        'Registration failed. Try again.',
      );
      expect(mockTokenState.setTokens).not.toHaveBeenCalled();
    });
  });

  describe('computed signal methods', () => {
    it('should return signals', () => {
      expect(typeof service.getCurrentUser()).toBe('function');
      expect(typeof service.getCurrentUsername()).toBe('function');
      expect(typeof service.isAuthenticated()).toBe('function');
      expect(typeof service.isLoading()).toBe('function');
      expect(typeof service.getError()).toBe('function');
    });
  });

  describe('logout', () => {
    it('should clear tokens and auth state', () => {
      spyOn(localStorage, 'removeItem');
      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockToast.success).toHaveBeenCalledWith('Logout successful!');
    });
  });

  describe('setError', () => {
    it('should not throw error when calling setError', () => {
      expect(() => service.setError('some error')).not.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should set new tokens if refresh succeeds', async () => {
      const refreshToken = 'mock-refresh';
      const newTokens: AuthenticationTokens = {
        token: 'new-token',
        refresh_token: 'new-refresh',
      };
      mockAuthApi.refreshToken.and.returnValue(of(newTokens));

      await service.refreshToken(refreshToken);

      expect(mockAuthApi.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockTokenState.setTokens).toHaveBeenCalledWith(
        'new-token',
        'new-refresh',
      );
    });

    it('should clear tokens if refresh fails', async () => {
      const refreshToken = 'mock-refresh';
      mockAuthApi.refreshToken.and.returnValue(
        throwError(() => new Error('Refresh failed')),
      );

      await service.refreshToken(refreshToken);

      expect(mockTokenState.clearTokens).toHaveBeenCalled();
    });
  });

  describe('getToken', () => {
    it('should return access token and call refresh', () => {
      mockTokenState.getAccessToken.and.returnValue('existing-token');
      mockTokenState.getRefreshToken.and.returnValue('existing-refresh');
      spyOn(service, 'refreshToken');

      const token = service.getToken();

      expect(token).toBe('existing-token');
      expect(service.refreshToken).toHaveBeenCalledWith('existing-refresh');
    });
  });
});
