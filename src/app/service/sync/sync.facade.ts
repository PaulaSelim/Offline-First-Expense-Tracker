import { inject, Injectable } from '@angular/core';
import { SyncApiService } from '../../core/api/syncApi/syncApi.service';
import { HealthStatus, SyncChange } from '../../core/api/syncApi/syncApi.model';
import { take } from 'rxjs';
import { setSyncError } from '../../core/state-management/sync.state';

@Injectable({ providedIn: 'root' })
export class SyncFacade {
  private readonly syncApi: SyncApiService = inject(SyncApiService);

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
