import { inject, Injectable, Signal } from '@angular/core';
import { fromEvent, merge, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';
import { HealthStatus } from '../api/syncApi/syncApi.model';
import { SyncApiService } from '../api/syncApi/syncApi.service';
import {
  isBackendReachable,
  isFullyOnline,
  isOnline,
  lastConnectionCheck,
  setIsBackendReachable,
  setIsOnline,
  setLastConnectionCheck,
} from '../state-management/network-status.state';

@Injectable({
  providedIn: 'root',
})
export class NetworkStatusService {
  private readonly syncApi: SyncApiService = inject(SyncApiService);

  readonly isOnline: Signal<boolean> = isOnline;
  readonly isBackendReachable: Signal<boolean> = isBackendReachable;
  readonly isFullyOnline: Signal<boolean> = isFullyOnline;
  readonly lastConnectionCheck: Signal<Date> = lastConnectionCheck;

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
      .subscribe((isOnlineStatus: boolean) => {
        setIsOnline(isOnlineStatus);

        if (isOnlineStatus) {
          this.checkBackendHealth();
        } else {
          setIsBackendReachable(false);
        }
      });
  }

  private startPeriodicCheck(): void {
    this.checkInterval = setInterval(() => {
      if (this.isOnline()) {
        this.checkBackendHealth();
      }
    }, 30000);
  }

  async checkBackendHealth(): Promise<boolean> {
    if (!this.isOnline()) {
      setIsBackendReachable(false);
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

      setIsBackendReachable(isReachable);
      setLastConnectionCheck(new Date());

      return isReachable;
    } catch {
      setIsBackendReachable(false);
      return false;
    }
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}
