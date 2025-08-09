import {
  computed,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { fromEvent, merge, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';
import { HealthStatus } from '../api/syncApi/syncApi.model';
import { SyncApiService } from '../api/syncApi/syncApi.service';
import { setAppOnlineStatus } from '../state-management/sync.state';

@Injectable({
  providedIn: 'root',
})
export class NetworkStatusService {
  private readonly syncApi: SyncApiService = inject(SyncApiService);

  private readonly _isOnline: WritableSignal<boolean> = signal(
    navigator.onLine,
  );
  private readonly _isBackendReachable: WritableSignal<boolean> = signal(false);
  private readonly _lastConnectionCheck: WritableSignal<Date> = signal(
    new Date(),
  );

  readonly isOnline: Signal<boolean> = computed(() => this._isOnline());
  readonly isBackendReachable: Signal<boolean> = computed(() =>
    this._isBackendReachable(),
  );
  readonly isFullyOnline: Signal<boolean> = computed(
    () => this._isOnline() && this._isBackendReachable(),
  );
  readonly lastConnectionCheck: Signal<Date> = computed(() =>
    this._lastConnectionCheck(),
  );

  private checkInterval: number | null = null;

  constructor() {
    this.initNetworkListener();
    this.startPeriodicCheck();
    this.checkBackendHealth();
  }

  private initNetworkListener(): void {
    const online$: Observable<boolean> = fromEvent(window, 'online').pipe(
      map(() => true),
    );
    const offline$: Observable<boolean> = fromEvent(window, 'offline').pipe(
      map(() => false),
    );

    merge(online$, offline$, of(navigator.onLine))
      .pipe(
        startWith(navigator.onLine),
        distinctUntilChanged(),
        debounceTime(100),
      )
      .subscribe((isOnline: boolean) => {
        this._isOnline.set(isOnline);
        setAppOnlineStatus(isOnline);

        if (isOnline) {
          this.checkBackendHealth();
        } else {
          this._isBackendReachable.set(false);
        }
      });
  }

  private startPeriodicCheck(): void {
    this.checkInterval = setInterval(() => {
      if (this._isOnline()) {
        this.checkBackendHealth();
      }
    }, 30000);
  }

  async checkBackendHealth(): Promise<boolean> {
    if (!this._isOnline()) {
      this._isBackendReachable.set(false);
      return false;
    }

    try {
      const isReachable: boolean = await new Promise<boolean>(
        (resolve: (value: boolean) => void) => {
          this.syncApi.ping().subscribe({
            next: (status: HealthStatus) => {
              const healthy: boolean = status === HealthStatus.Healthy;
              resolve(healthy);
            },
            error: () => resolve(false),
          });
        },
      );

      this._isBackendReachable.set(isReachable);
      this._lastConnectionCheck.set(new Date());

      return isReachable;
    } catch {
      this._isBackendReachable.set(false);
      return false;
    }
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}
