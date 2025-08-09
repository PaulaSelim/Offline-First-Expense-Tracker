import {
  Injectable,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { switchMap, take } from 'rxjs';
import {
  Expense,
  ExpenseRequest,
  ExpenseUpdateRequest,
} from '../api/expenseApi/expenseApi.model';
import { ExpenseApiService } from '../api/expenseApi/expenseApi.service';
import { Group, GroupRequest } from '../api/groupApi/groupApi.model';
import { GroupApiService } from '../api/groupApi/groupApi.service';
import { ExpensesDBState } from '../state-management/RxDB/expenses/expensesDB.state';
import { GroupDBState } from '../state-management/RxDB/group/groupDB.state';

import { SyncQueueDocument } from '../state-management/RxDB/sync-queue/sync-queue.schema';
import { SyncQueueDBState } from '../state-management/RxDB/sync-queue/sync-queueDB.state';
import { NetworkStatusService } from './network-status.service';

@Injectable({
  providedIn: 'root',
})
export class BackgroundSyncService {
  private readonly syncQueueDB: SyncQueueDBState = inject(SyncQueueDBState);
  private readonly networkStatus: NetworkStatusService =
    inject(NetworkStatusService);
  private readonly toast: ToastrService = inject(ToastrService);
  private readonly expenseApi: ExpenseApiService = inject(ExpenseApiService);
  private readonly groupApi: GroupApiService = inject(GroupApiService);
  private readonly expensesDB: ExpensesDBState = inject(ExpensesDBState);
  private readonly groupDB: GroupDBState = inject(GroupDBState);

  private readonly _isSyncing: WritableSignal<boolean> = signal(false);
  private readonly _syncProgress: WritableSignal<number> = signal(0);
  private readonly _totalItems: WritableSignal<number> = signal(0);
  private readonly _failedItems: WritableSignal<number> = signal(0);

  readonly isSyncing: Signal<boolean> = computed(() => this._isSyncing());
  readonly syncProgress: Signal<number> = computed(() => this._syncProgress());
  readonly totalItems: Signal<number> = computed(() => this._totalItems());
  readonly failedItems: Signal<number> = computed(() => this._failedItems());
  readonly hasFailedItems: Signal<boolean> = computed(
    () => this._failedItems() > 0,
  );

  private isInitialized: boolean = false;
  private readonly MAX_RETRIES: number = 3;

  constructor() {
    this.initBackgroundSync();
  }

  private initBackgroundSync(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.syncQueueDB.clearProcessingFlags$().pipe(take(1)).subscribe();

    if (this.networkStatus.isFullyOnline() && !this._isSyncing()) {
      setTimeout(() => this.startSync(), 1000);
    }
  }

  async startSync(): Promise<void> {
    if (this._isSyncing()) {
      console.error('Sync already in progress');
      return;
    }

    if (!this.networkStatus.isFullyOnline()) {
      console.error('Cannot sync: not fully online');
      return;
    }

    this._isSyncing.set(true);
    this._syncProgress.set(0);
    this._failedItems.set(0);

    try {
      const pendingItems: SyncQueueDocument[] = await this.getPendingItems();

      if (pendingItems.length === 0) {
        this._isSyncing.set(false);
        return;
      }

      this._totalItems.set(pendingItems.length);
      console.error(`Starting sync of ${pendingItems.length} items`);

      let processedCount: number = 0;
      let failedCount: number = 0;

      for (const item of pendingItems) {
        try {
          await this.processSyncItem(item);
          processedCount++;
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          failedCount++;
          await this.handleSyncError(item, error);
        }

        this._syncProgress.set(
          ((processedCount + failedCount) / pendingItems.length) * 100,
        );
      }

      this._failedItems.set(failedCount);

      if (processedCount > 0) {
        this.toast.success(
          `Synced ${processedCount} items successfully${
            failedCount > 0 ? `. ${failedCount} items failed.` : ''
          }`,
        );
      }

      if (failedCount > 0) {
        this.toast.warning(
          `${failedCount} items failed to sync and will be retried later`,
        );
      }
    } catch (error) {
      console.error('Sync process failed:', error);
      this.toast.error('Sync process encountered an error');
    } finally {
      this._isSyncing.set(false);
    }
  }

  private async getPendingItems(): Promise<SyncQueueDocument[]> {
    return new Promise((resolve: (value: SyncQueueDocument[]) => void) => {
      this.syncQueueDB
        .getPendingItems$()
        .pipe(take(1))
        .subscribe({
          next: (items: SyncQueueDocument[]) => resolve(items),
          error: () => resolve([]),
        });
    });
  }

  private async processSyncItem(item: SyncQueueDocument): Promise<void> {
    await new Promise<void>((resolve: (value: void) => void) => {
      this.syncQueueDB
        .markAsProcessing$(item.id)
        .pipe(take(1))
        .subscribe({
          next: () => resolve(),
          error: () => resolve(),
        });
    });
  }

  private async syncExpense(item: SyncQueueDocument): Promise<void> {
    if (!item.groupId) {
      throw new Error('Group ID is required for expense operations');
    }

    switch (item.action) {
      case 'create':
        await this.createExpenseOnServer(item);
        break;
      case 'update':
        await this.updateExpenseOnServer(item);
        break;
      case 'delete':
        await this.deleteExpenseOnServer(item);
        break;
      default:
        throw new Error(`Unknown action: ${item.action}`);
    }
  }

  private async syncGroup(item: SyncQueueDocument): Promise<void> {
    switch (item.action) {
      case 'create':
        await this.createGroupOnServer(item);
        break;
      case 'update':
        await this.updateGroupOnServer(item);
        break;
      case 'delete':
        await this.deleteGroupOnServer(item);
        break;
      default:
        throw new Error(`Unknown action: ${item.action}`);
    }
  }

  private async createExpenseOnServer(item: SyncQueueDocument): Promise<void> {
    const expenseData: ExpenseRequest = item.data as unknown as ExpenseRequest;

    return new Promise(
      (resolve: (value: void) => void, reject: (reason?: unknown) => void) => {
        this.expenseApi
          .createExpense(expenseData, item.groupId!)
          .pipe(take(1))
          .subscribe({
            next: (response: { data: { expense: Expense } }) => {
              const serverExpense: Expense = response.data.expense;
              this.expensesDB
                .removeExpenseById$(item.entityId)
                .pipe(
                  switchMap(() =>
                    this.expensesDB.addOrUpdateExpense$(serverExpense),
                  ),
                  take(1),
                )
                .subscribe({
                  next: () => resolve(),
                  error: () => resolve(),
                });
            },
            error: (error: unknown) => reject(error),
          });
      },
    );
  }

  private async updateExpenseOnServer(item: SyncQueueDocument): Promise<void> {
    const expenseData: ExpenseUpdateRequest =
      item.data as unknown as ExpenseUpdateRequest;

    return new Promise(
      (resolve: (value: void) => void, reject: (reason?: unknown) => void) => {
        this.expenseApi
          .updateExpense(item.groupId!, item.entityId, expenseData)
          .pipe(take(1))
          .subscribe({
            next: (response: { data: { expense: Expense } }) => {
              const serverExpense: Expense = response.data.expense;
              this.expensesDB
                .addOrUpdateExpense$(serverExpense)
                .pipe(take(1))
                .subscribe({
                  next: () => resolve(),
                  error: () => resolve(),
                });
            },
            error: (error: unknown) => reject(error),
          });
      },
    );
  }

  private async deleteExpenseOnServer(item: SyncQueueDocument): Promise<void> {
    return new Promise(
      (resolve: (value: void) => void, reject: (reason?: unknown) => void) => {
        this.expenseApi
          .deleteExpense(item.groupId!, item.entityId)
          .pipe(take(1))
          .subscribe({
            next: () => resolve(),
            error: (error: unknown) => reject(error),
          });
      },
    );
  }

  private async createGroupOnServer(item: SyncQueueDocument): Promise<void> {
    const groupData: GroupRequest = item.data as unknown as GroupRequest;

    return new Promise(
      (resolve: (value: void) => void, reject: (reason?: unknown) => void) => {
        this.groupApi
          .createGroup(groupData)
          .pipe(take(1))
          .subscribe({
            next: (response: { data: { group: Group } }) => {
              const serverGroup: Group = response.data.group;
              this.groupDB
                .removeGroupById$(item.entityId)
                .pipe(
                  switchMap(() => this.groupDB.addOrUpdateGroup$(serverGroup)),
                  take(1),
                )
                .subscribe({
                  next: () => resolve(),
                  error: () => resolve(),
                });
            },
            error: (error: unknown) => reject(error),
          });
      },
    );
  }

  private async updateGroupOnServer(item: SyncQueueDocument): Promise<void> {
    const groupData: GroupRequest = item.data as unknown as GroupRequest;

    return new Promise(
      (resolve: (value: void) => void, reject: (reason?: unknown) => void) => {
        this.groupApi
          .updateGroup(item.entityId, groupData)
          .pipe(take(1))
          .subscribe({
            next: (response: { data: { group: Group } }) => {
              const serverGroup: Group = response.data.group;

              this.groupDB
                .addOrUpdateGroup$(serverGroup)
                .pipe(take(1))
                .subscribe({
                  next: () => resolve(),
                  error: () => resolve(),
                });
            },
            error: (error: unknown) => reject(error),
          });
      },
    );
  }

  private async deleteGroupOnServer(item: SyncQueueDocument): Promise<void> {
    return new Promise(
      (resolve: (value: void) => void, reject: (reason?: unknown) => void) => {
        this.groupApi
          .deleteGroup(item.entityId)
          .pipe(take(1))
          .subscribe({
            next: () => resolve(),
            error: (error: unknown) => reject(error),
          });
      },
    );
  }

  private async handleSyncError(
    item: SyncQueueDocument,
    error: unknown,
  ): Promise<void> {
    const errorMessage: string =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error) || 'Unknown error';

    if (item.retryCount >= this.MAX_RETRIES) {
      console.error(
        `Max retries reached for item ${item.id}, removing from queue`,
      );
      await new Promise<void>((resolve: (value: void) => void) => {
        this.syncQueueDB
          .removeFromQueue$(item.id)
          .pipe(take(1))
          .subscribe({
            next: () => resolve(),
            error: () => resolve(),
          });
      });
    } else {
      await new Promise<void>((resolve: (value: void) => void) => {
        this.syncQueueDB
          .updateRetryCount$(item.id, errorMessage)
          .pipe(take(1))
          .subscribe({
            next: () => resolve(),
            error: () => resolve(),
          });
      });
    }
  }

  async forcSync(): Promise<void> {
    if (!this.networkStatus.isFullyOnline()) {
      this.toast.warning('Cannot sync while offline');
      return;
    }

    await this.startSync();
  }

  getQueueStats(): {
    isSyncing: boolean;
    progress: number;
    totalItems: number;
    failedItems: number;
    hasFailedItems: boolean;
  } {
    return {
      isSyncing: this.isSyncing(),
      progress: this.syncProgress(),
      totalItems: this.totalItems(),
      failedItems: this.failedItems(),
      hasFailedItems: this.hasFailedItems(),
    };
  }
}
