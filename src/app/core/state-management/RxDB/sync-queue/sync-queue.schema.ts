// sync-queue/sync-queue.schema.ts
import { RxJsonSchema } from 'rxdb';

export type SyncActionType = 'create' | 'update' | 'delete';
export type SyncEntityType = 'expense' | 'group' | 'user';

export interface SyncQueueDocument {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  action: SyncActionType;
  data: Record<string, unknown>;
  groupId?: string; // For expense operations
  timestamp: string;
  retryCount: number;
  lastError?: string;
  isProcessing: boolean;
}

export const syncQueueSchema: RxJsonSchema<SyncQueueDocument> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    entityType: { enum: ['expense', 'group', 'user'] },
    entityId: { type: 'string', maxLength: 100 },
    action: { enum: ['create', 'update', 'delete'] },
    data: { type: 'object' },
    groupId: { type: 'string', maxLength: 100 },
    timestamp: { type: 'string', format: 'date-time' },
    retryCount: { type: 'number', default: 0 },
    lastError: { type: 'string' },
    isProcessing: { type: 'boolean', default: false },
  },
  required: ['id', 'entityType', 'entityId', 'action', 'data', 'timestamp'],
};
