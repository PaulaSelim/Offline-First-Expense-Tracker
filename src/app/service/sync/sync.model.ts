export interface SyncStats {
  isSyncing: boolean;
  progress: number;
  hasFailedItems: boolean;
  failedItems: number;
}
