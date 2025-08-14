import { TestBed } from '@angular/core/testing';
import { webSocketEnvironment } from '../../../../environments/environment';
import { TokenState } from '../../services/token-state/token.state';
import { WebSocketApi } from './web-socket-api';
import {
  WebSocketCloseCode,
  WebSocketCloseReason,
  WebSocketResponse,
  WebSocketStatus,
  WebSocketSyncAckResponse,
  WebSocketSyncCompletedResponse,
  WebSocketSyncRequest,
} from './webSocket.model';
import { provideZonelessChangeDetection } from '@angular/core';

describe('WebSocketApi', () => {
  let service: WebSocketApi;
  let tokenStateMock: jasmine.SpyObj<TokenState>;
  let originalWebSocket: any;
  let wsInstance: any;

  beforeEach(() => {
    tokenStateMock = jasmine.createSpyObj('TokenState', ['getAccessToken']);
    TestBed.configureTestingModule({
      providers: [
        WebSocketApi,
        provideZonelessChangeDetection(),
        { provide: TokenState, useValue: tokenStateMock },
      ],
    });
    service = TestBed.inject(WebSocketApi);
    const g: any = globalThis as any;
    originalWebSocket = g.WebSocket;
    wsInstance = {
      send: jasmine.createSpy('send'),
      close: jasmine.createSpy('close'),
      readyState: 1,
    };
    g.WebSocket = jasmine.createSpy('WebSocket').and.returnValue(wsInstance);
  });

  afterEach(() => {
    (globalThis as any).WebSocket = originalWebSocket;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should error if no access token', (done) => {
    tokenStateMock.getAccessToken.and.returnValue(null);
    service.bulkSyncWebSocket({ changes: [] }).subscribe({
      error: (err) => {
        expect(err.message).toContain(WebSocketCloseReason.MISSING_TOKEN);
        done();
      },
    });
  });

  it('should error if no WebSocket URL', (done) => {
    tokenStateMock.getAccessToken.and.returnValue('token');
    spyOnProperty(webSocketEnvironment, 'webSocketUrl', 'get').and.returnValue(
      undefined,
    );
    service.bulkSyncWebSocket({ changes: [] }).subscribe({
      error: (err) => {
        expect(err.message).toContain(WebSocketCloseReason.INVALID_URL);
        done();
      },
    });
  });

  it('should send request and handle ack/completed', (done) => {
    tokenStateMock.getAccessToken.and.returnValue('token');
    spyOnProperty(webSocketEnvironment, 'webSocketUrl', 'get').and.returnValue(
      'ws://test',
    );
    const req: WebSocketSyncRequest = { changes: [] };
    const ack: WebSocketSyncAckResponse = {
      type: WebSocketResponse.ACK,
      operation_id: '1',
      status: WebSocketStatus.STARTED,
      created_at: 'now',
    };
    const completed: WebSocketSyncCompletedResponse = {
      type: WebSocketResponse.COMPLETED,
      operation_id: '1',
      status: WebSocketStatus.COMPLETED,
      completed_at: 'now',
      notifications: [],
    };
    const results: any[] = [];
    service.bulkSyncWebSocket(req).subscribe({
      next: (msg) => results.push(msg),
      complete: () => {
        expect(wsInstance.send).toHaveBeenCalledWith(JSON.stringify(req));
        expect(results[0]).toEqual(ack);
        expect(results[1]).toEqual(completed);
        done();
      },
    });
    wsInstance.onopen();
    wsInstance.onmessage({ data: JSON.stringify(ack) });
    wsInstance.onmessage({ data: JSON.stringify(completed) });
  });

  it('should error on invalid JSON', (done) => {
    tokenStateMock.getAccessToken.and.returnValue('token');
    spyOnProperty(webSocketEnvironment, 'webSocketUrl', 'get').and.returnValue(
      'ws://test',
    );
    service.bulkSyncWebSocket({ changes: [] }).subscribe({
      error: (err) => {
        expect(err.message).toContain('Invalid JSON');
        done();
      },
    });
    wsInstance.onopen();
    wsInstance.onmessage({ data: 'not-json' });
  });

  it('should error on WebSocket error', (done) => {
    tokenStateMock.getAccessToken.and.returnValue('token');
    spyOnProperty(webSocketEnvironment, 'webSocketUrl', 'get').and.returnValue(
      'ws://test',
    );
    service.bulkSyncWebSocket({ changes: [] }).subscribe({
      error: (err) => {
        expect(err.message).toContain(WebSocketCloseReason.CONNECTION_ERROR);
        done();
      },
    });
    wsInstance.onerror();
  });

  it('should handle WebSocket close codes', (done) => {
    tokenStateMock.getAccessToken.and.returnValue('token');
    spyOnProperty(webSocketEnvironment, 'webSocketUrl', 'get').and.returnValue(
      'ws://test',
    );
    const closeCodes = [
      {
        code: WebSocketCloseCode.MissingToken,
        msg: WebSocketCloseReason.MISSING_TOKEN,
      },
      {
        code: WebSocketCloseCode.InvalidToken,
        msg: WebSocketCloseReason.INVALID_TOKEN,
      },
      {
        code: WebSocketCloseCode.InvalidPayload,
        msg: WebSocketCloseReason.INVALID_PAYLOAD,
      },
      {
        code: WebSocketCloseCode.InternalError,
        msg: WebSocketCloseReason.INTERNAL_ERROR,
      },
      { code: 9999, msg: 'WebSocket closed with code: 9999' },
    ];
    let tested = 0;
    closeCodes.forEach(({ code, msg }) => {
      service.bulkSyncWebSocket({ changes: [] }).subscribe({
        error: (err) => {
          expect(err.message).toContain(msg);
          tested++;
          if (tested === closeCodes.length) done();
        },
      });
      wsInstance.onclose({ code });
    });
  });

  it('should complete on normal closure', (done) => {
    tokenStateMock.getAccessToken.and.returnValue('token');
    spyOnProperty(webSocketEnvironment, 'webSocketUrl', 'get').and.returnValue(
      'ws://test',
    );
    service.bulkSyncWebSocket({ changes: [] }).subscribe({
      complete: () => done(),
    });
    wsInstance.onclose({ code: WebSocketCloseCode.NormalClosure });
  });

  it('should close socket on disconnect', () => {
    tokenStateMock.getAccessToken.and.returnValue('token');
    spyOnProperty(webSocketEnvironment, 'webSocketUrl', 'get').and.returnValue(
      'ws://test',
    );
    service.bulkSyncWebSocket({ changes: [] }).subscribe();
    service.disconnect();
    expect(wsInstance.close).toHaveBeenCalledWith(
      WebSocketCloseCode.NormalClosure,
    );
    expect((service as any).socket).toBeNull();
  });
});
