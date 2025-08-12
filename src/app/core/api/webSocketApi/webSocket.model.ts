export interface WebSocketSyncRequest {
  changes: WebSocketSyncChange[];
}

export interface WebSocketSyncChange {
  type: 'create' | 'update' | 'delete';
  entity: 'expense' | 'group';
  entity_id: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface WebSocketSyncAckResponse {
  type: 'ack';
  operation_id: string;
  status: 'started';
  created_at: string;
}

export interface WebSocketSyncCompletedResponse {
  type: 'completed';
  operation_id: string;
  status: 'completed';
  completed_at: string;
  notifications: string[];
}

export interface WebSocketSyncErrorResponse {
  type: 'error';
  operation_id: string;
  status: 'failed';
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
