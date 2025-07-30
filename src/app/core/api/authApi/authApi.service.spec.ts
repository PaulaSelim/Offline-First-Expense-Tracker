import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import {
  AuthenticationData,
  AuthenticationResponse,
  AuthenticationTokens,
  LoginRequest,
  RegisterRequest,
  User,
} from './authApi.model';
import { environment } from '../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthApiService } from './authApi.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and return authentication response', () => {
    const loginRequest: LoginRequest = {
      email: 'testuser@mail.com',
      password: 'password123',
    };

    const mockResponse: AuthenticationResponse = {
      data: {
        token: 'mock-token',
        refresh_token: 'mock-refresh',
        user: {
          id: '1',
          username: 'testuser',
          email: 'testuser@mail.com',
        },
      },
    };

    service.login(loginRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginRequest);
    req.flush(mockResponse);
  });

  it('should register and return authentication response', () => {
    const registerRequest: RegisterRequest = {
      username: 'newuser',
      password: 'newpass123',
      email: 'new@example.com',
    };

    const mockResponse: AuthenticationResponse = {
      data: {
        token: 'new-token',
        refresh_token: 'refresh-token',
        user: {
          id: '2',
          username: 'newuser',
          email: 'new@example.com',
        },
      },
    };

    service.register(registerRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerRequest);
    req.flush(mockResponse);
  });

  it('should fetch user profile', () => {
    const mockUser: User = {
      id: '3',
      username: 'profileUser',
      email: 'profile@example.com',
    };

    const apiResponse = {
      data: {
        user: mockUser,
      },
    };

    service.getProfile().subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${baseUrl}/me`);
    expect(req.request.method).toBe('GET');
    req.flush(apiResponse);
  });

  it('should refresh token and return new tokens', () => {
    const refreshToken = 'existing-refresh-token';
    const mockTokens: AuthenticationTokens = {
      token: 'new-token',
      refresh_token: 'new-refresh-token',
    };

    const apiResponse = {
      data: mockTokens,
    };

    service.refreshToken(refreshToken).subscribe((tokens) => {
      expect(tokens).toEqual(mockTokens);
    });

    const req = httpMock.expectOne(`${baseUrl}/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refresh_token: refreshToken });
    req.flush(apiResponse);
  });
});
