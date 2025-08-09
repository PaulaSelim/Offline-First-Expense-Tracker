import { RxJsonSchema } from 'rxdb';

export enum SyncActionTypeENUM {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export enum SyncEntityTypeENUM {
  Expense = 'expense',
  Group = 'group',
  User = 'user',
}

export type SyncActionType = `${SyncActionTypeENUM}`;
export type SyncEntityType = `${SyncEntityTypeENUM}`;

export interface SyncQueueDocument {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  action: SyncActionType;
  data: Record<string, unknown>;
  groupId?: string;
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
    entityType: { enum: Object.values(SyncEntityTypeENUM) },
    entityId: { type: 'string', maxLength: 100 },
    action: { enum: Object.values(SyncActionTypeENUM) },
    data: { type: 'object' },
    groupId: { type: 'string', maxLength: 100 },
    timestamp: { type: 'string', format: 'date-time' },
    retryCount: { type: 'number', default: 0 },
    lastError: { type: 'string' },
    isProcessing: { type: 'boolean', default: false },
  },
  required: ['id', 'entityType', 'entityId', 'action', 'data', 'timestamp'],
};
