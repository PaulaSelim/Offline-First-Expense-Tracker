// components/sync-status/sync-status.component.ts
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { SyncFacade } from '../../service/sync/sync.facade';

interface SyncStats {
  isSyncing: boolean;
  progress: number;
  hasFailedItems: boolean;
  failedItems: number;
}

@Component({
  selector: 'app-sync-status',
  standalone: true,
  imports: [NgClass],
  templateUrl: './sync-status.html',
  styleUrls: ['./sync-status.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SyncStatusComponent {
  private readonly syncFacade: SyncFacade = inject(SyncFacade);

  readonly isOnline: Signal<boolean> = this.syncFacade.isOnline;
  readonly isBackendReachable: Signal<boolean> =
    this.syncFacade.isBackendReachable;
  readonly syncStats: Signal<SyncStats> = this.syncFacade.syncStats;
  readonly pendingItemsCount: Signal<number> =
    this.syncFacade.pendingItemsCount;
  readonly networkStatusClass: Signal<string> =
    this.syncFacade.networkStatusClass;

  forceSync(): Promise<void> {
    return this.syncFacade.forceSync();
  }
}
