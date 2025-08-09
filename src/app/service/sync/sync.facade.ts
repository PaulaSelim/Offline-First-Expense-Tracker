import { computed, inject, Injectable, Signal } from '@angular/core';
import { take } from 'rxjs';
import { HealthStatus, SyncChange } from '../../core/api/syncApi/syncApi.model';
import { SyncApiService } from '../../core/api/syncApi/syncApi.service';
import { BackgroundSyncService } from '../../core/services/background-sync.service';
import { NetworkStatusService } from '../../core/services/network-status.service';
import { SyncQueueDBState } from '../../core/state-management/RxDB/sync-queue/sync-queueDB.state';
import { setSyncError } from '../../core/state-management/sync.state';
import { SyncStats } from './sync.model';

@Injectable({ providedIn: 'root' })
export class SyncFacade {
  private readonly syncApi: SyncApiService = inject(SyncApiService);
  private readonly networkStatus: NetworkStatusService =
    inject(NetworkStatusService);
  private readonly backgroundSync: BackgroundSyncService = inject(
    BackgroundSyncService,
  );
  private readonly syncQueueDB: SyncQueueDBState = inject(SyncQueueDBState);

  readonly isOnline: Signal<boolean> = computed(() =>
    this.networkStatus.isOnline(),
  );
  readonly isBackendReachable: Signal<boolean> = computed(() =>
    this.networkStatus.isBackendReachable(),
  );
  readonly syncStats: Signal<SyncStats> = computed(() =>
    this.backgroundSync.getQueueStats(),
  );
  readonly pendingItemsCount: Signal<number> = computed(() => {
    return 0;
  });
  readonly networkStatusClass: Signal<string> = computed(() => {
    if (this.isOnline() && this.isBackendReachable()) {
      return 'network-status online';
    } else if (this.isOnline() && !this.isBackendReachable()) {
      return 'network-status backend-offline';
    } else {
      return 'network-status offline';
    }
  });

  forcSync(): Promise<void> {
    return this.backgroundSync.forcSync();
  }

  bulkSync(changes: SyncChange[]): void {
    this.syncApi.bulkSync(changes).subscribe();
  }

  getSyncStatus(operationId: string): void {
    this.syncApi.getSyncStatus(operationId).subscribe();
  }

  async isBackendAlive(): Promise<boolean> {
    try {
      return await new Promise((resolve: (value: boolean) => void) => {
        this.syncApi
          .ping()
          .pipe(take(1))
          .subscribe({
            next: (isAlive: HealthStatus) => {
              resolve(isAlive === HealthStatus.Healthy);
            },
            error: () => {
              resolve(false);
            },
          });
      });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setSyncError(err.message || 'Failed to load local groups');
      return false;
    }
  }
}
