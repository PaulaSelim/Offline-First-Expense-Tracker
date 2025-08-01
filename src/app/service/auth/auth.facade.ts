import { computed, inject, Injectable, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  AuthenticationResponse,
  AuthenticationTokens,
  LoginRequest,
  RegisterRequest,
  User,
} from '../../core/api/authApi/authApi.model';
import { AuthApiService } from '../../core/api/authApi/authApi.service';
import { TokenState } from '../../core/services/token.state';
import {
  authData,
  authError,
  authLoading,
  resetAuthState,
  setAuthData,
  setAuthError,
  setAuthLoading,
} from '../../core/state-management/auth.state';
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private api: AuthApiService = inject(AuthApiService);
  private readonly toast: ToastrService = inject(ToastrService);
  private readonly tokenState: TokenState = inject(TokenState);
  private router: Router = inject(Router);
  login(data: LoginRequest): void {
    setAuthLoading(true);
    setAuthError(null);

    this.api.login(data).subscribe({
      next: (res: AuthenticationResponse) => {
        setAuthData(res);
        this.tokenState.setTokens(res.data.token, res.data.refresh_token);
        this.toast.success('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        setAuthError('Invalid username or password');
        this.toast.error('Login failed. Please try again.');
      },
      complete: () => {
        setAuthLoading(false);
      },
    });
  }

  register(data: RegisterRequest): void {
    setAuthLoading(true);
    setAuthError(null);

    this.api.register(data).subscribe({
      next: (res: AuthenticationResponse) => {
        setAuthData(res);
        this.tokenState.setTokens(res.data.token, res.data.refresh_token);
        this.toast.success('Registration successful!');
      },
      error: () => {
        setAuthError('Registration failed. Try again.');
        this.toast.error('Registration failed. Try again.');
      },
      complete: () => {
        setAuthLoading(false);
      },
    });
  }

  isAuthenticated(): Signal<boolean> {
    return computed(() => !!authData()?.data.token);
  }

  getCurrentUser(): Signal<User | null> {
    return computed(() => authData()?.data.user ?? null);
  }

  getCurrentUsername(): Signal<string> {
    return computed(() => authData()?.data.user?.username ?? '');
  }
  getError(): typeof authError {
    return authError;
  }
  setError(message: string): void {
    setAuthError(message);
  }

  isLoading(): typeof authLoading {
    return authLoading;
  }

  logout(): void {
    localStorage.removeItem('token');
    resetAuthState();
    this.toast.success('Logout successful!');
  }

  refreshToken(refreshToken: string): Promise<void> {
    return new Promise((resolve: () => void) => {
      this.api.refreshToken(refreshToken).subscribe({
        next: (data: AuthenticationTokens) => {
          this.tokenState.setTokens(data.token, data.refresh_token);
          resolve();
        },
        error: () => {
          this.tokenState.clearTokens();
          resetAuthState();
          resolve();
        },
      });
    });
  }

  getToken(): string | null {
    const refresh_token: string | null = this.tokenState.getRefreshToken();
    this.refreshToken(refresh_token!);
    return this.tokenState.getAccessToken();
  }
}
