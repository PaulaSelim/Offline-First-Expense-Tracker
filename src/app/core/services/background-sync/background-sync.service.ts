import { Injectable, Signal, effect, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { switchMap, take } from 'rxjs';
import {
  Expense,
  ExpenseRequest,
  ExpenseUpdateRequest,
} from '../../api/expenseApi/expenseApi.model';
import { ExpenseApiService } from '../../api/expenseApi/expenseApi.service';
import { Group, GroupRequest } from '../../api/groupApi/groupApi.model';
import { GroupApiService } from '../../api/groupApi/groupApi.service';
import { ExpensesDBState } from '../../state-management/RxDB/expenses/expensesDB.state';
import { GroupDBState } from '../../state-management/RxDB/group/groupDB.state';

import { SyncQueueDocument } from '../../state-management/RxDB/sync-queue/sync-queue.schema';
import { SyncQueueDBState } from '../../state-management/RxDB/sync-queue/sync-queueDB.state';
import { NetworkStatusService } from '../network-status/network-status.service';

import { WebSocketApi } from '../../api/webSocketApi/web-socket-api';
import {
  EntityType,
  WebSocketResponse,
  WebSocketSyncChange,
  WebSocketSyncRequest,
  WebSocketSyncResponse,
  WebSocketSyncType,
} from '../../api/webSocketApi/webSocket.model';
import {
  failedItems,
  hasFailedItems,
  isSyncing,
  setFailedItems,
  setIsSyncing,
  setSyncProgress,
  setTotalItems,
  syncProgress,
  totalItems,
} from '../../state-management/sync.state';

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

  readonly isSyncing: Signal<boolean> = isSyncing;
  readonly syncProgress: Signal<number> = syncProgress;
  readonly totalItems: Signal<number> = totalItems;
  readonly failedItems: Signal<number> = failedItems;
  readonly hasFailedItems: Signal<boolean> = hasFailedItems;

  private isInitialized: boolean = false;
  private readonly MAX_RETRIES: number = 3;

  private readonly webSocketApi: WebSocketApi = inject(WebSocketApi);

  private readonly useWebSocketSync: boolean = true;

  private syncTimeout: number | null = null;

  constructor() {
    this.initBackgroundSync();

    effect(() => {
      const isFullyOnline: boolean =
        this.networkStatus.isOnline() &&
        this.networkStatus.isBackendReachable();
      if (isFullyOnline && !isSyncing()) {
        if (this.syncTimeout) clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(() => this.startSync(), 1000);
      }
    });
  }

  private initBackgroundSync(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.syncQueueDB.clearProcessingFlags$().pipe(take(1)).subscribe();

    if (this.networkStatus.isFullyOnline() && !isSyncing()) {
      setTimeout(() => this.startSync(), 1000);
    }
  }

  async startSync(): Promise<void> {
    if (isSyncing()) {
      return;
    }

    if (!this.networkStatus.isFullyOnline()) {
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setFailedItems(0);

    try {
      const pendingItems: SyncQueueDocument[] = await this.getPendingItems();

      if (pendingItems.length === 0) {
        return;
      }

      setTotalItems(pendingItems.length);

      if (this.useWebSocketSync) {
        try {
          await this.syncViaWebSocket(pendingItems);
        } catch (wsError) {
          console.error(
            'WebSocket sync failed, falling back to HTTP:',
            wsError,
          );
          this.toast.warning('WebSocket sync failed, using HTTP sync');
          await this.syncViaHttp(pendingItems);
        }
      } else {
        await this.syncViaHttp(pendingItems);
      }

      await new Promise<void>((resolve: () => void) => {
        this.syncQueueDB
          .clearQueue$()
          .pipe(take(1))
          .subscribe({
            next: () => resolve(),
          });
      });
    } catch (error) {
      console.error('Sync process failed:', error);
      this.toast.error('Sync process encountered an error');
    } finally {
      setIsSyncing(false);
    }
  }

  private async syncViaWebSocket(
    pendingItems: SyncQueueDocument[],
  ): Promise<void> {
    for (const item of pendingItems) {
      await this.processSyncItem(item);
    }

    const changes: WebSocketSyncChange[] = pendingItems.map(
      (item: SyncQueueDocument) => {
        const change: WebSocketSyncChange = {
          type: item.action as WebSocketSyncType,
          entity: item.entityType as EntityType,
          entity_id: item.entityId,
          data: item.action !== 'delete' ? item.data : undefined,
          timestamp: item.timestamp,
        };

        if (item.entityType === EntityType.EXPENSE && item.groupId) {
          if (change.data && typeof change.data === 'object') {
            (change.data as { group_id: string }).group_id = item.groupId;
          } else if (item.action !== 'delete') {
            change.data = { group_id: item.groupId };
          }
        }

        return change;
      },
    );

    const request: WebSocketSyncRequest = { changes };

    return new Promise(
      (resolve: () => void, reject: (reason?: unknown) => void) => {
        let processedCount: number = 0;
        let hasCompleted: boolean = false;

        this.webSocketApi.bulkSyncWebSocket(request).subscribe({
          next: (response: WebSocketSyncResponse) => {
            switch (response.type) {
              case WebSocketResponse.ACK:
                this.toast.info(
                  `Sync operation started: ${response.operation_id}`,
                );
                break;

              case WebSocketResponse.COMPLETED:
                if (!hasCompleted) {
                  hasCompleted = true;
                  this.toast.success(
                    `Sync completed: ${response.operation_id}`,
                  );
                  this.processWebSocketNotifications(
                    response.notifications,
                    pendingItems,
                  );
                  processedCount = pendingItems.length;
                  setSyncProgress(processedCount);
                }
                break;

              case WebSocketResponse.ERROR:
                this.toast.error(`Sync error: ${response.error}`);
                this.resetProcessingFlags(pendingItems);
                throw new Error(response.error);
            }
          },
          error: (error: unknown) => {
            this.toast.error(`WebSocket sync failed: ${error}`);
            this.resetProcessingFlags(pendingItems);
            reject(error);
          },
          complete: () => {
            if (processedCount > 0) {
              this.toast.success(`Successfully synced ${processedCount} items`);
            }
            resolve();
          },
        });
      },
    );
  }

  private async resetProcessingFlags(
    items: SyncQueueDocument[],
  ): Promise<void> {
    for (const item of items) {
      await new Promise<void>((resolve: (value: void) => void) => {
        this.syncQueueDB
          .updateRetryCount$(item.id)
          .pipe(take(1))
          .subscribe({
            next: () => resolve(),
            error: () => resolve(),
          });
      });
    }
  }
  private async syncViaHttp(pendingItems: SyncQueueDocument[]): Promise<void> {
    let processedCount: number = 0;
    let failedCount: number = 0;

    for (const item of pendingItems) {
      try {
        await this.processSyncItem(item);

        if (item.entityType === EntityType.EXPENSE) {
          await this.syncExpense(item);
        } else if (item.entityType === EntityType.GROUP) {
          await this.syncGroup(item);
        }

        await this.removeFromQueue(item.id);
        processedCount++;
        setSyncProgress(processedCount);
      } catch (error) {
        await this.handleSyncError(item, error);
        failedCount++;
      }
    }

    setFailedItems(failedCount);

    if (processedCount > 0) {
      this.toast.success(`Successfully synced ${processedCount} items`);
    }

    if (failedCount > 0) {
      this.toast.warning(
        `${failedCount} items failed to sync and will be retried`,
      );
    }
  }

  private async processWebSocketNotifications(
    notifications: string[],
    originalItems: SyncQueueDocument[],
  ): Promise<void> {
    for (const notification of notifications) {
      const parts: string[] = notification.split(':');
      if (parts.length >= 3) {
        const entity: string = parts[0];
        const entityId: string = parts[1];
        const action: string = parts[2];

        const item: SyncQueueDocument | undefined = originalItems.find(
          (i: SyncQueueDocument) =>
            i.entityType === entity &&
            i.entityId === entityId &&
            i.action === action,
        );

        if (item) {
          await this.removeFromQueue(item.id);
        }
      }
    }
  }

  private async removeFromQueue(itemId: string): Promise<void> {
    return new Promise<void>((resolve: (value: void) => void) => {
      this.syncQueueDB
        .removeFromQueue$(itemId)
        .pipe(take(1))
        .subscribe({
          next: () => resolve(),
          error: () => resolve(),
        });
    });
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
      error instanceof Error ? error.message : String(error) || 'Unknown error';

    if (item.retryCount >= this.MAX_RETRIES) {
      await this.removeFromQueue(item.id);

      this.toast.error(
        `Failed to sync ${item.entityType} after ${this.MAX_RETRIES} attempts`,
      );
    } else {
      await new Promise<void>((resolve: (value: void) => void) => {
        this.syncQueueDB
          .updateRetryCount$(item.id, errorMessage)
          .pipe(take(1))
          .subscribe({
            next: () => resolve(),
            error: () => {
              resolve();
            },
          });
      });
    }
  }

  async forceSync(): Promise<void> {
    if (!this.networkStatus.isFullyOnline()) {
      this.toast.warning('Cannot sync while offline');
      return;
    }
    if (this.getQueueStats().isSyncing) {
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
