import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SyncApiService } from './syncApi.service';
import { HealthStatus, SyncStatus } from './syncApi.model';
import { environment } from '../../../../environments/environment';

describe('SyncApiService', () => {
  let service: SyncApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/sync`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SyncApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(SyncApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send bulkSync request', () => {
    const changes = [
      { type: 'create' as const, entity: 'expense' as const, timestamp: 'now' },
    ];
    const mockResponse = { data: { operation_id: 'op123' } };
    service.bulkSync(changes).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${baseUrl}/bulk`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ changes });
    req.flush(mockResponse);
  });

  it('should get sync status', () => {
    const opId = 'op123';
    const mockResponse = {
      data: {
        operation_id: opId,
        status: SyncStatus.Completed,
        created_at: '2025-08-13',
        completed_at: '2025-08-13',
        notifications: [],
        errors: [],
      },
    };
    service.getSyncStatus(opId).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${baseUrl}/status/${opId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should return Healthy on ping with ok status', () => {
    service.ping().subscribe((res) => {
      expect(res).toBe(HealthStatus.Healthy);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/health`);
    req.flush({ data: { status: 'ok' } });
  });

  it('should return Unhealthy on ping with not ok status', () => {
    service.ping().subscribe((res) => {
      expect(res).toBe(HealthStatus.Unhealthy);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/health`);
    req.flush({ data: { status: 'fail' } });
  });

  it('should return Dead on ping error', () => {
    service.ping().subscribe((res) => {
      expect(res).toBe(HealthStatus.Dead);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/health`);
    req.error(new ErrorEvent('Network error'));
  });

  it('should handle timeout in ping as Dead', () => {
    // Simulate timeout by not flushing response
    let result: HealthStatus | undefined;
    service.ping().subscribe((res) => {
      result = res;
      expect(result).toBe(HealthStatus.Dead);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/health`);
    req.error(new ErrorEvent('Timeout'), { status: 408 });
  });

  it('should send correct request body for bulkSync', () => {
    const changes = [
      {
        type: 'update' as const,
        entity: 'group' as const,
        entity_id: 'g1',
        timestamp: 'now',
      },
    ];
    service.bulkSync(changes).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/bulk`);
    expect(req.request.body.changes[0].entity).toBe('group');
    req.flush({ data: { operation_id: 'op456' } });
  });

  it('should handle errors in getSyncStatus', () => {
    const opId = 'op789';
    service.getSyncStatus(opId).subscribe({
      error: (err) => {
        expect(err.status).toBe(404);
      },
    });
    const req = httpMock.expectOne(`${baseUrl}/status/${opId}`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });
});
