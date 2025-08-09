import { DecimalPipe, NgClass } from '@angular/common';
import { Signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SyncFacade } from '../../service/sync/sync.facade';
import { SyncStatusComponent } from './sync-status';

// Mock signals
function createSignal<T>(value: T): Signal<T> {
  return (() => value) as Signal<T>;
}

describe('SyncStatusComponent', () => {
  let component: SyncStatusComponent;
  let fixture: ComponentFixture<SyncStatusComponent>;
  let mockSyncFacade: jasmine.SpyObj<SyncFacade>;

  beforeEach(async () => {
    mockSyncFacade = jasmine.createSpyObj('SyncFacade', ['forceSync'], {
      isOnline: createSignal(true),
      isBackendReachable: createSignal(true),
      syncStats: createSignal({
        isSyncing: false,
        progress: 0,
        hasFailedItems: false,
        failedItems: 0,
      }),
      pendingItemsCount: createSignal(0),
      networkStatusClass: createSignal('network-status online'),
    });

    await TestBed.configureTestingModule({
      imports: [SyncStatusComponent, DecimalPipe, NgClass],
      providers: [{ provide: SyncFacade, useValue: mockSyncFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(SyncStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call forceSync on the facade', async () => {
    mockSyncFacade.forceSync.and.resolveTo();
    await component.forceSync();
    expect(mockSyncFacade.forceSync).toHaveBeenCalled();
  });

  it('should reflect online status', () => {
    expect(component.isOnline()).toBeTrue();
    expect(component.isBackendReachable()).toBeTrue();
    expect(component.networkStatusClass()).toBe('network-status online');
  });

  it('should reflect syncStats and pendingItemsCount', () => {
    expect(component.syncStats()).toEqual({
      isSyncing: false,
      progress: 0,
      hasFailedItems: false,
      failedItems: 0,
    });
    expect(component.pendingItemsCount()).toBe(0);
  });
});
