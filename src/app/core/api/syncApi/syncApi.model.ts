export type SyncOperationType = 'create' | 'update' | 'delete';
export type SyncEntityType = 'expense' | 'group' | 'user';

export interface SyncChange {
  type: SyncOperationType;
  entity: SyncEntityType;
  entity_id?: string;
  data?: Record<string, string | number | boolean | null>;
  timestamp: string;
}

export interface BulkSyncRequest {
  changes: SyncChange[];
}

export interface BulkSyncResponse {
  data: {
    operation_id: string;
  };
}

export interface SyncStatusResponse {
  data: {
    operation_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    completed_at?: string;
    notifications: string[];
    errors?: string[];
  };
}
