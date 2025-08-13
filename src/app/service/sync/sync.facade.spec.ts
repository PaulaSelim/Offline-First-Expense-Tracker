import { TestBed } from '@angular/core/testing';
import { SyncFacade } from './sync.facade';
import { SyncApiService } from '../../core/api/syncApi/syncApi.service';
import { BackgroundSyncService } from '../../core/services/background-sync/background-sync.service';
import { NetworkStatusService } from '../../core/services/network-status/network-status.service';
import { SyncQueueDBState } from '../../core/state-management/RxDB/sync-queue/sync-queueDB.state';
import { HealthStatus, SyncChange } from '../../core/api/syncApi/syncApi.model';
import { NetworkStatusClassEnum } from '../../core/services/network-status/network-status.model';
import { of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';
// Mocks
class MockSyncApiService {
  bulkSync = jasmine.createSpy('bulkSync').and.returnValue(of(undefined));
  getSyncStatus = jasmine
    .createSpy('getSyncStatus')
    .and.returnValue(of(undefined));
  ping = jasmine.createSpy('ping').and.returnValue(of(HealthStatus.Healthy));
}
class MockBackgroundSyncService {
  forceSync = jasmine.createSpy('forceSync').and.resolveTo();
  getQueueStats = jasmine.createSpy('getQueueStats').and.returnValue({
    isSyncing: false,
    progress: 2,
    totalItems: 5,
    hasFailedItems: false,
    failedItems: 0,
  });
}
class MockNetworkStatusService {
  isOnline = jasmine.createSpy('isOnline').and.returnValue(true);
  isBackendReachable = jasmine
    .createSpy('isBackendReachable')
    .and.returnValue(true);
}
class MockSyncQueueDBState {}

describe('SyncFacade', () => {
  let facade: SyncFacade;
  let syncApi: MockSyncApiService;
  let backgroundSync: MockBackgroundSyncService;
  let networkStatus: MockNetworkStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SyncFacade,
        provideZonelessChangeDetection(),
        { provide: SyncApiService, useClass: MockSyncApiService },
        { provide: BackgroundSyncService, useClass: MockBackgroundSyncService },
        { provide: NetworkStatusService, useClass: MockNetworkStatusService },
        { provide: SyncQueueDBState, useClass: MockSyncQueueDBState },
      ],
    });
    facade = TestBed.inject(SyncFacade);
    syncApi = TestBed.inject(SyncApiService) as any;
    backgroundSync = TestBed.inject(BackgroundSyncService) as any;
    networkStatus = TestBed.inject(NetworkStatusService) as any;
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should compute isOnline', () => {
    expect(facade.isOnline()).toBeTrue();
  });

  it('should compute isBackendReachable', () => {
    expect(facade.isBackendReachable()).toBeTrue();
  });

  it('should compute syncStats', () => {
    expect(facade.syncStats()).toEqual({
      isSyncing: false,
      progress: 2,
      totalItems: 5,
      hasFailedItems: false,
      failedItems: 0,
    });
  });

  it('should compute pendingItemsCount', () => {
    expect(facade.pendingItemsCount()).toBe(3);
  });

  it('should compute networkStatusClass as Online', () => {
    expect(facade.networkStatusClass()).toBe(NetworkStatusClassEnum.Online);
  });

  it('should call forceSync', async () => {
    await facade.forceSync();
    expect(backgroundSync.forceSync).toHaveBeenCalled();
  });

  it('should call bulkSync', () => {
    const changes: SyncChange[] = [];
    facade.bulkSync(changes);
    expect(syncApi.bulkSync).toHaveBeenCalledWith(changes);
  });

  it('should call getSyncStatus', () => {
    facade.getSyncStatus('op123');
    expect(syncApi.getSyncStatus).toHaveBeenCalledWith('op123');
  });

  it('should resolve isBackendAlive as true when healthy', async () => {
    syncApi.ping.and.returnValue(of(HealthStatus.Healthy));
    await expectAsync(facade.isBackendAlive()).toBeResolvedTo(true);
  });

  it('should resolve isBackendAlive as false when unhealthy', async () => {
    syncApi.ping.and.returnValue(of(HealthStatus.Unhealthy));
    await expectAsync(facade.isBackendAlive()).toBeResolvedTo(false);
  });

  it('should resolve isBackendAlive as false on error', async () => {
    syncApi.ping.and.returnValue(throwError(() => new Error('fail')));
    await expectAsync(facade.isBackendAlive()).toBeResolvedTo(false);
  });
});
