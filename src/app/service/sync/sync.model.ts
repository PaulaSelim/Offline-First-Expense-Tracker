export interface SyncStats {
  isSyncing: boolean;
  progress: number;
  totalItems: number;
  hasFailedItems: boolean;
  failedItems: number;
}
