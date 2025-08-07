import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BulkSyncRequest,
  BulkSyncResponse,
  HealthStatus,
  SyncChange,
  SyncStatusResponse,
} from './syncApi.model';

@Injectable({
  providedIn: 'root',
})
export class SyncApiService {
  constructor(private http: HttpClient) {}

  bulkSync(changes: SyncChange[]): Observable<BulkSyncResponse> {
    const request: BulkSyncRequest = { changes };
    return this.http.post<BulkSyncResponse>(
      `${environment.apiUrl}/sync/bulk`,
      request,
    );
  }

  getSyncStatus(operationId: string): Observable<SyncStatusResponse> {
    return this.http.get<SyncStatusResponse>(
      `${environment.apiUrl}/sync/status/${operationId}`,
    );
  }

  ping(): Observable<HealthStatus> {
    return this.http
      .get<{ data: { status: string } }>(`${environment.apiUrl}/health`)
      .pipe(
        timeout(100),
        map((res: { data: { status: string } }) => {
          return res.data?.status === 'ok'
            ? HealthStatus.Healthy
            : HealthStatus.Unhealthy;
        }),
        catchError(() => {
          return of(HealthStatus.Dead);
        }),
      );
  }
}
