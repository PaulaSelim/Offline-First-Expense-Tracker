export interface WebSocketSyncRequest {
  changes: WebSocketSyncChange[];
}

export enum WebSocketStatus {
  STARTED = 'started',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum WebSocketCloseReason {
  MISSING_TOKEN = 'Missing Access Token',
  INVALID_TOKEN = 'Invalid Access Token',
  INVALID_PAYLOAD = 'Invalid Payload',
  INTERNAL_ERROR = 'Internal Server Error',
  NORMAL_CLOSURE = 'Normal Closure',
  INVALID_URL = 'Invalid or Malformed WebSocket URL',
  CONNECTION_ERROR = 'WebSocket Connection Error',
  SUCCESS_SYNC = 'WebSocket sync completed successfully',
}

export enum WebSocketResponse {
  ACK = 'ack',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum EntityType {
  EXPENSE = 'expense',
  GROUP = 'group',
}

export enum WebSocketSyncType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface WebSocketSyncChange {
  type:
    | WebSocketSyncType.CREATE
    | WebSocketSyncType.UPDATE
    | WebSocketSyncType.DELETE;
  entity: EntityType.EXPENSE | EntityType.GROUP;
  entity_id: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface WebSocketSyncAckResponse {
  type: WebSocketResponse.ACK;
  operation_id: string;
  status: WebSocketStatus.STARTED;
  created_at: string;
}

export interface WebSocketSyncCompletedResponse {
  type: WebSocketResponse.COMPLETED;
  operation_id: string;
  status: WebSocketStatus.COMPLETED;
  completed_at: string;
  notifications: string[];
}

export interface WebSocketSyncErrorResponse {
  type: WebSocketResponse.ERROR;
  operation_id: string;
  status: WebSocketStatus.FAILED;
  error: string;
}

export type WebSocketSyncResponse =
  | WebSocketSyncAckResponse
  | WebSocketSyncCompletedResponse
  | WebSocketSyncErrorResponse;

export enum WebSocketCloseCode {
  MissingToken = 4401,
  InvalidToken = 4403,
  InvalidPayload = 4400,
  InternalError = 1011,
  NormalClosure = 1000,
}
