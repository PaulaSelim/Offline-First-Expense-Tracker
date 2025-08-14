import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocketEnvironment } from '../../../../environments/environment';
import { TokenState } from '../../services/token-state/token.state';
import {
  WebSocketCloseCode,
  WebSocketCloseReason,
  WebSocketResponse,
  WebSocketSyncRequest,
  WebSocketSyncResponse,
} from './webSocket.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketApi {
  private readonly tokenState: TokenState = inject(TokenState);
  private socket: WebSocket | null = null;

  bulkSyncWebSocket(
    request: WebSocketSyncRequest,
  ): Observable<WebSocketSyncResponse> {
    return new Observable(
      (observer: import('rxjs').Observer<WebSocketSyncResponse>) => {
        const accessToken: string | null = this.tokenState.getAccessToken();

        if (!accessToken) {
          observer.error(new Error(WebSocketCloseReason.MISSING_TOKEN));
          return;
        }

        const wsUrl: string | undefined = webSocketEnvironment.webSocketUrl;
        if (!wsUrl) {
          observer.error(new Error(WebSocketCloseReason.INVALID_URL));
          return;
        }

        let isCompleted: boolean = false;

        this.socket = new WebSocket(
          `${wsUrl}/sync/bulk/ws?token=${accessToken}`,
        );

        this.socket.onopen = (): void => {
          this.socket!.send(JSON.stringify(request));
        };

        this.socket.onmessage = (event: MessageEvent): void => {
          try {
            const response: WebSocketSyncResponse = JSON.parse(event.data);
            observer.next(response);

            if (
              response.type === WebSocketResponse.COMPLETED ||
              response.type === WebSocketResponse.ERROR
            ) {
              isCompleted = true;
              observer.complete();
            }
          } catch (error) {
            isCompleted = true;
            observer.error(
              new Error(
                `Invalid JSON response from server: ${error instanceof Error ? error.message : 'Unknown error'}`,
              ),
            );
          }
        };

        this.socket.onerror = (): void => {
          if (!isCompleted) {
            isCompleted = true;
            observer.error(new Error(WebSocketCloseReason.CONNECTION_ERROR));
          }
        };

        this.socket.onclose = (event: CloseEvent): void => {
          if (isCompleted) return;

          switch (event.code) {
            case WebSocketCloseCode.MissingToken:
              observer.error(new Error(WebSocketCloseReason.MISSING_TOKEN));
              break;
            case WebSocketCloseCode.InvalidToken:
              observer.error(new Error(WebSocketCloseReason.INVALID_TOKEN));
              break;
            case WebSocketCloseCode.InvalidPayload:
              observer.error(new Error(WebSocketCloseReason.INVALID_PAYLOAD));
              break;
            case WebSocketCloseCode.InternalError:
              observer.error(new Error(WebSocketCloseReason.INTERNAL_ERROR));
              break;
            case WebSocketCloseCode.NormalClosure:
              observer.complete();
              break;
            default:
              observer.error(
                new Error(`WebSocket closed with code: ${event.code}`),
              );
          }
        };

        return () => {
          isCompleted = true;
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close(WebSocketCloseCode.NormalClosure);
          }
          this.socket = null;
        };
      },
    );
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(WebSocketCloseCode.NormalClosure);
      this.socket = null;
    }
  }
}
