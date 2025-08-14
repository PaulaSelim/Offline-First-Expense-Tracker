import {
  computed,
  effect,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { LocalStorage } from '../local-storage/local-storage';

@Injectable({ providedIn: 'root' })
export class TokenState {
  private _accessToken!: WritableSignal<string | null>;
  private _refreshToken!: WritableSignal<string | null>;

  public accessToken!: Signal<string | null>;
  public refreshToken!: Signal<string | null>;
  public isAuthenticated!: Signal<boolean>;

  constructor(private readonly storage: LocalStorage) {
    this._accessToken = signal<string | null>(this.storage.getItem('token'));
    this._refreshToken = signal<string | null>(
      this.storage.getItem('refresh_token'),
    );

    this.accessToken = this._accessToken.asReadonly();
    this.refreshToken = this._refreshToken.asReadonly();
    this.isAuthenticated = computed(() => !!this._accessToken());
    effect(() => {
      const token: string | null = this._accessToken();
      if (this._accessToken()) {
        this.storage.setItem('token', token);
      } else {
        this.storage.removeItem('token');
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
