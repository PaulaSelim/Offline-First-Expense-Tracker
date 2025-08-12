import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocketEnvironment } from '../../../../environments/environment';
import { TokenState } from '../../services/token.state';
import {
  WebSocketCloseCode,
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
          observer.error(new Error('No access token available'));
          return;
        }

        const wsUrl: string | undefined = webSocketEnvironment.webSocketUrl;
        if (!wsUrl) {
          observer.error(new Error('WebSocket URL not configured'));
          return;
        }

        // Track completion state
        let isCompleted: boolean = false;

        this.socket = new WebSocket(
          `${wsUrl}/sync/bulk/ws?token=${accessToken}`,
        );

        this.socket.onopen = (): void => {
          console.error('[WebSocket] Connection opened');
          console.error('[WebSocket] Sending request:', request);
          this.socket!.send(JSON.stringify(request));
        };

        this.socket.onmessage = (event: MessageEvent): void => {
          console.error('[WebSocket] Message received:', event.data);
          try {
            const response: WebSocketSyncResponse = JSON.parse(event.data);
            observer.next(response);

            if (response.type === 'completed' || response.type === 'error') {
              console.error(
                '[WebSocket] Completed or error received, closing...',
              );
              isCompleted = true;
              observer.complete();
            }
          } catch (error) {
            console.error('Failed to parse WebSocket response:', error);
            isCompleted = true;
            observer.error(
              new Error(
                `Invalid JSON response from server: ${error instanceof Error ? error.message : 'Unknown error'}`,
              ),
            );
          }
        };

        this.socket.onerror = (): void => {
          console.error('[WebSocket] Connection error');
          if (!isCompleted) {
            isCompleted = true;
            observer.error(new Error('WebSocket connection error'));
          }
        };

        this.socket.onclose = (event: CloseEvent): void => {
          console.error(`[WebSocket] Connection closed (code: ${event.code})`);
          if (isCompleted) return;

          switch (event.code) {
            case WebSocketCloseCode.MissingToken:
              observer.error(new Error('Missing authentication token'));
              break;
            case WebSocketCloseCode.InvalidToken:
              observer.error(new Error('Invalid authentication token'));
              break;
            case WebSocketCloseCode.InvalidPayload:
              observer.error(new Error('Invalid request payload'));
              break;
            case WebSocketCloseCode.InternalError:
              observer.error(new Error('Internal server error'));
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

        // Cleanup function
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
