import {
  Injectable,
  signal,
  computed,
  effect,
  Signal,
  WritableSignal,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenState {
  private readonly _accessToken: WritableSignal<string | null> = signal<
    string | null
  >(this.getTokenFromStorage('token'));

  private readonly _refreshToken: WritableSignal<string | null> = signal<
    string | null
  >(this.getTokenFromStorage('refresh_token'));

  public readonly accessToken: Signal<string | null> =
    this._accessToken.asReadonly();
  public readonly refreshToken: Signal<string | null> =
    this._refreshToken.asReadonly();
  public readonly isAuthenticated: Signal<boolean> = computed(
    () => !!this._accessToken(),
  );

  constructor() {
    effect(() => {
      const token: string | null = this._accessToken();
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    });

    effect(() => {
      const refreshToken: string | null = this._refreshToken();
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      } else {
        localStorage.removeItem('refresh_token');
      }
    });
  }

  private getTokenFromStorage(key: string): string | null {
    return localStorage.getItem(key);
  }

  getAccessToken(): string | null {
    return this._accessToken();
  }

  getRefreshToken(): string | null {
    return this._refreshToken();
  }

  setTokens(token: string, refreshToken: string): void {
    this._accessToken.set(token);
    this._refreshToken.set(refreshToken);
  }

  clearTokens(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
  }

  setAccessToken(token: string): void {
    this._accessToken.set(token);
  }

  setRefreshToken(refreshToken: string): void {
    this._refreshToken.set(refreshToken);
  }
}
