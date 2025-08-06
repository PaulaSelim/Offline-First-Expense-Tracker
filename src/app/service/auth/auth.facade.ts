import { computed, inject, Injectable, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/internal/operators/take';
import { ROUTER_LINKS } from '../../../routes.model';
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
  userCreatedAt,
  userEmail,
  userId,
  userName,
} from '../../core/state-management/auth.state';
import { UserDBState } from '../../core/state-management/RxDB/user/userDB.state';
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private api: AuthApiService = inject(AuthApiService);
  private readonly toast: ToastrService = inject(ToastrService);
  private readonly tokenState: TokenState = inject(TokenState);
  private router: Router = inject(Router);
  readonly ROUTER_LINKS: typeof ROUTER_LINKS = ROUTER_LINKS;
  private readonly userDB: UserDBState = inject(UserDBState);

  isOnline(): boolean {
    return window.navigator.onLine;
  }

  login(data: LoginRequest): void {
    setAuthLoading(true);
    setAuthError(null);

    this.api.login(data).subscribe({
      next: (res: AuthenticationResponse) => {
        const user: User = res.data.user;
        setAuthData(res);
        this.tokenState.setTokens(res.data.token, res.data.refresh_token);

        this.userDB.addOrUpdateUser$(user).subscribe();

        this.toast.success('Login successful!');
        this.router.navigate([ROUTER_LINKS.DASHBOARD]);
      },
      error: () => {
        setAuthError('Invalid username or password');
        this.toast.error('Login failed. Please try again.');
      },
      complete: () => setAuthLoading(false),
    });
  }

  register(data: RegisterRequest): void {
    setAuthLoading(true);
    setAuthError(null);

    this.api.register(data).subscribe({
      next: (res: AuthenticationResponse) => {
        const user: User = res.data.user;
        setAuthData(res);
        this.tokenState.setTokens(res.data.token, res.data.refresh_token);

        this.userDB.addOrUpdateUser$(user).subscribe();

        this.toast.success('Registration successful!');
        this.router.navigate([ROUTER_LINKS.DASHBOARD]);
      },
      error: () => {
        setAuthError('Registration failed. Try again.');
        this.toast.error('Registration failed. Try again.');
      },
      complete: () => setAuthLoading(false),
    });
  }

  isAuthenticated(): Signal<boolean> {
    return computed(() => !!authData()?.data.token);
  }

  getCurrentUser(): Signal<User | null> {
    return computed(() => authData()?.data.user ?? null);
  }

  getCurrentUsername(): Signal<string> {
    return userName;
  }

  getCurrentUserEmail(): Signal<string> {
    return userEmail;
  }

  getCurrentUserId(): Signal<string> {
    return userId;
  }

  getCurrentUserCreatedAt(): Signal<string | undefined> {
    return userCreatedAt;
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

  confirmLogout(): boolean {
    return window.confirm('Are you sure you want to logout?');
  }

  logout(): void {
    if (!this.confirmLogout()) {
      return;
    }
    this.userDB.removeUser$().pipe(take(1)).subscribe();
    this.tokenState.clearTokens();
    resetAuthState();

    this.toast.success('Logout successful!');
    this.router.navigate([ROUTER_LINKS.LOGIN]);
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
  private setProfile(user: User): void {
    const current: AuthenticationResponse | null = authData();
    if (current) {
      setAuthData({
        ...current,
        data: {
          ...current.data,
          user,
        },
      });
    } else {
      setAuthData({
        data: {
          user,
          token: '',
          refresh_token: '',
        },
      });
    }
  }

  getProfile(): void {
    setAuthLoading(true);
    setAuthError(null);

    if (!this.isOnline()) {
      const uid: string | null = this.getCurrentUserId().toString();
      if (!uid) {
        this.toast.error('Offline and no user ID available.');
        setAuthLoading(false);
        return;
      }

      this.userDB.getUser$().subscribe({
        next: (user: User | null) => {
          if (user) {
            this.setProfile(user);
            this.toast.info('Loaded user from offline cache.');
          } else {
            this.toast.warning('User not found in offline cache.');
          }
        },
        error: () => this.toast.error('Failed to load offline profile.'),
        complete: () => setAuthLoading(false),
      });

      return;
    }

    this.api.getProfile().subscribe({
      next: (user: User) => {
        this.setProfile(user);
        this.userDB.addOrUpdateUser$(user).subscribe();
      },
      error: () => {
        this.setError('Failed to fetch user profile.');
        this.toast.error('Could not fetch profile.');
      },
      complete: () => setAuthLoading(false),
    });
  }

  isTokenValid(): Promise<boolean> {
    return new Promise((resolve: (value: boolean) => void) => {
      this.api.getProfile().subscribe({
        next: (user: User) => {
          this.setProfile(user);
          resolve(true);
        },
        error: () => {
          this.setError('Failed to fetch user profile.');
          resolve(false);
        },
      });
    });
  }
}
