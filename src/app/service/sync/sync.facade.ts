import { inject, Injectable } from '@angular/core';
import { SyncApiService } from '../../core/api/syncApi/syncApi.service';
import { SyncChange } from '../../core/api/syncApi/syncApi.model';

@Injectable({ providedIn: 'root' })
export class GroupFacade {
  private readonly syncApi: SyncApiService = inject(SyncApiService);

  bulkSync(changes: SyncChange[]): void {
    this.syncApi.bulkSync(changes).subscribe();
  }

  getSyncStatus(operationId: string): void {
    this.syncApi.getSyncStatus(operationId).subscribe();
  }
}
