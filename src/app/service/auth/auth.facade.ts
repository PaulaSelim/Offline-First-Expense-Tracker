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
import { HealthStatus } from '../../core/api/syncApi/syncApi.model';
import { SyncApiService } from '../../core/api/syncApi/syncApi.service';
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
import { ExpensesDBState } from '../../core/state-management/RxDB/expenses/expensesDB.state';
import { GroupDBState } from '../../core/state-management/RxDB/group/groupDB.state';
import { RxdbService } from '../../core/state-management/RxDB/rxdb.service';
import { UserDBState } from '../../core/state-management/RxDB/user/userDB.state';
import { isAppOnline } from '../../core/state-management/sync.state';
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private api: AuthApiService = inject(AuthApiService);
  private syncApi: SyncApiService = inject(SyncApiService);
  private readonly toast: ToastrService = inject(ToastrService);
  private readonly tokenState: TokenState = inject(TokenState);
  private readonly rxdbService: RxdbService = inject(RxdbService);
  private router: Router = inject(Router);
  readonly ROUTER_LINKS: typeof ROUTER_LINKS = ROUTER_LINKS;
  private readonly userDB: UserDBState = inject(UserDBState);
  private readonly groupDB: GroupDBState = inject(GroupDBState);
  private readonly expensesDB: ExpensesDBState = inject(ExpensesDBState);

  private readonly _isAppOnline: Signal<boolean> = computed(() =>
    isAppOnline(),
  );

  login(data: LoginRequest): void {
    setAuthLoading(true);
    setAuthError(null);

    this.api.login(data).subscribe({
      next: async (res: AuthenticationResponse) => {
        const user: User = res.data.user;
        setAuthData(res);
        this.tokenState.setTokens(res.data.token, res.data.refresh_token);

        try {
          await new Promise<void>(
            (resolve: () => void, reject: (reason?: unknown) => void) => {
              this.userDB.addOrUpdateUser$(user).subscribe({
                next: () => resolve(),
                error: (error: unknown) => reject(error),
              });
            },
          );

          this.toast.success('Login successful!');

          setTimeout(() => {
            this.router.navigate([ROUTER_LINKS.DASHBOARD]);
          }, 100);
        } catch (error: unknown) {
          this.toast.error(
            'Login Failed!',
            error instanceof Error ? error.message : String(error),
          );
          this.router.navigate([ROUTER_LINKS.LOGIN]);
        }
      },
      complete: () => setAuthLoading(false),
    });
  }

  register(data: RegisterRequest): void {
    setAuthLoading(true);
    setAuthError(null);

    this.api.register(data).subscribe({
      next: (res: AuthenticationResponse) => {
        setAuthData(res);

        this.toast.success('Registration successful!');
        this.router.navigate([ROUTER_LINKS.LOGIN]);
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

  async logout(): Promise<void> {
    if (!this.confirmLogout()) {
      return;
    }
    this.clearDB();
    this.tokenState.clearTokens();
    resetAuthState();
    this.toast.success('Logout successful!');
    this.router.navigate([ROUTER_LINKS.LOGIN]);
  }

  clearDB(): void {
    this.userDB.removeUser$().pipe(take(1)).subscribe();
    this.groupDB.removeAllGroups$().pipe(take(1)).subscribe();
    this.expensesDB.removeAllExpenses$().pipe(take(1)).subscribe();
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

  isTokenValid(): Promise<boolean> {
    return new Promise((resolve: (value: boolean) => void) => {
      this.syncApi.ping().subscribe({
        next: (status: HealthStatus) => {
          switch (status) {
            case HealthStatus.Healthy:
              this.api.getProfile().subscribe({
                next: (user: User) => {
                  this.setProfile(user);
                  this.userDB.addOrUpdateUser$(user).pipe(take(1)).subscribe();
                  resolve(true);
                },
                error: () => {
                  this.setError('Failed to fetch user profile.');
                  resolve(false);
                },
              });
              break;

            case HealthStatus.Unhealthy:
              resolve(false);
              break;

            case HealthStatus.Dead:
              this.loadProfileFromCache()
                .then((success: boolean) => {
                  resolve(success);
                })
                .catch(() => {
                  resolve(false);
                });
              break;
          }
        },
        error: () => {
          this.loadProfileFromCache()
            .then((success: boolean) => {
              resolve(success);
            })
            .catch(() => {
              resolve(false);
            });
        },
      });
    });
  }

  private async loadProfileFromCache(): Promise<boolean> {
    return new Promise((resolve: (value: boolean) => void) => {
      this.userDB
        .getUser$()
        .pipe(take(1))
        .subscribe({
          next: (user: User | null) => {
            if (user) {
              this.setProfile(user);
              this.toast.info('Using cached profile (offline mode)');
              resolve(true);
            } else {
              this.toast.warning('No offline profile data available');
              resolve(false);
            }
          },
        });
    });
  }

  getProfile(): void {
    setAuthLoading(true);
    setAuthError(null);

    const online: boolean = this._isAppOnline();

    if (!online) {
      this.loadProfileFromCache()
        .then((success: boolean) => {
          if (!success) {
            this.setError('No offline profile data available');
          }
        })
        .finally(() => {
          setAuthLoading(false);
        });
      return;
    }

    this.api.getProfile().subscribe({
      next: (user: User) => {
        this.setProfile(user);
        this.userDB.addOrUpdateUser$(user).pipe(take(1)).subscribe();
      },
      error: () => {
        this.loadProfileFromCache().then((success: boolean) => {
          if (!success) {
            this.setError('Failed to fetch user profile.');
            this.toast.error('Could not fetch profile.');
          }
        });
      },
      complete: () => setAuthLoading(false),
    });
  }
}
