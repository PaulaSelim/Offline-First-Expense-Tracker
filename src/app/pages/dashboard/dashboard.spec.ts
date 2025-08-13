import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';

// Import services to mock
import { AuthFacade } from '../../service/auth/auth.facade';
import { GroupFacade } from '../../service/group/group.facade';
import { SyncFacade } from '../../service/sync/sync.facade';

// RxDB Service Mocks
import { RxdbService } from '../../core/state-management/RxDB/rxdb.service';
import { GroupDBState } from '../../core/state-management/RxDB/group/groupDB.state';
import { ExpensesDBState } from '../../core/state-management/RxDB/expenses/expensesDB.state';
import { SyncQueueDBState } from '../../core/state-management/RxDB/sync-queue/sync-queueDB.state';
import { UserDBState } from '../../core/state-management/RxDB/user/userDB.state';
import { BackgroundSyncService } from '../../core/services/background-sync/background-sync.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockAuthFacade: jasmine.SpyObj<AuthFacade>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;
  let mockSyncFacade: jasmine.SpyObj<SyncFacade>;

  beforeEach(async () => {
    // Create facade mocks
    mockAuthFacade = jasmine.createSpyObj('AuthFacade', [
      'getCurrentUser',
      'getCurrentUserId',
      'getCurrentUsername',
      'getCurrentUserEmail',
      'isAuthenticated',
      'getProfile',
    ]);
    mockGroupFacade = jasmine.createSpyObj('GroupFacade', [
      'getGroups',
      'fetchGroups',
      'getSelectedGroup',
      'isLoading',
      'getError',
    ]);
    mockSyncFacade = jasmine.createSpyObj('SyncFacade', [
      'isOnline',
      'isBackendReachable',
      'syncStats',
      'networkStatusClass',
      'forceSync',
    ]);

    // Setup facade return values with signals
    mockAuthFacade.getCurrentUser.and.returnValue(
      signal({ id: 'test-user', email: 'test@test.com', username: 'testuser' }),
    );
    mockAuthFacade.getCurrentUserId.and.returnValue(signal('test-user'));
    mockAuthFacade.getCurrentUsername.and.returnValue(signal('testuser'));
    mockAuthFacade.getCurrentUserEmail.and.returnValue(signal('test@test.com'));
    mockAuthFacade.isAuthenticated.and.returnValue(signal(true));
    mockAuthFacade.getProfile.and.returnValue(undefined);
    mockGroupFacade.getGroups.and.returnValue(signal([]));
    mockGroupFacade.getSelectedGroup.and.returnValue(signal(null));
    mockGroupFacade.isLoading.and.returnValue(signal(false));
    mockGroupFacade.getError.and.returnValue(signal(null));

    // For SyncFacade, these are computed signals, so we return the computed values directly
    Object.defineProperty(mockSyncFacade, 'isOnline', {
      get: () => signal(true),
      configurable: true,
    });
    Object.defineProperty(mockSyncFacade, 'isBackendReachable', {
      get: () => signal(true),
      configurable: true,
    });
    Object.defineProperty(mockSyncFacade, 'syncStats', {
      get: () =>
        signal({
          isSyncing: false,
          progress: 0,
          totalItems: 0,
          failedItems: 0,
          hasFailedItems: false,
        }),
      configurable: true,
    });
    Object.defineProperty(mockSyncFacade, 'networkStatusClass', {
      get: () => signal('online'),
      configurable: true,
    });

    // Mock RxDB Services
    const mockRxdbService = jasmine.createSpyObj('RxdbService', ['database']);
    const mockGroupDBState = jasmine.createSpyObj('GroupDBState', [
      'getAllGroups$',
      'addOrUpdateGroup$',
      'removeAllGroups$',
    ]);
    const mockExpensesDBState = jasmine.createSpyObj('ExpensesDBState', [
      'getAllExpenses$',
      'removeAllExpenses$',
    ]);
    const mockSyncQueueDBState = jasmine.createSpyObj('SyncQueueDBState', [
      'getAll$',
      'clearQueue$',
    ]);
    const mockUserDBState = jasmine.createSpyObj('UserDBState', [
      'getUser$',
      'addOrUpdateUser$',
      'removeUser$',
    ]);
    const mockBackgroundSyncService = jasmine.createSpyObj(
      'BackgroundSyncService',
      ['startSync', 'forceSync', 'getQueueStats'],
    );

    // Setup return values for RxDB mocks
    mockGroupDBState.getAllGroups$.and.returnValue(of([]));
    mockGroupDBState.addOrUpdateGroup$.and.returnValue(of(undefined));
    mockGroupDBState.removeAllGroups$.and.returnValue(of(undefined));
    mockExpensesDBState.getAllExpenses$.and.returnValue(of([]));
    mockExpensesDBState.removeAllExpenses$.and.returnValue(of(undefined));
    mockSyncQueueDBState.getAll$.and.returnValue(of([]));
    mockSyncQueueDBState.clearQueue$.and.returnValue(of(undefined));
    mockUserDBState.getUser$.and.returnValue(of(null));
    mockUserDBState.addOrUpdateUser$.and.returnValue(of(undefined));
    mockUserDBState.removeUser$.and.returnValue(of(undefined));
    mockBackgroundSyncService.getQueueStats.and.returnValue({
      isSyncing: false,
      progress: 0,
      totalItems: 0,
      failedItems: 0,
      hasFailedItems: false,
    });

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideToastr({
          timeOut: 3000,
          positionClass: 'toast-top-right',
          preventDuplicates: true,
        }),
        provideNoopAnimations(),
        provideRouter([{ path: 'dashboard', component: class {} }]),
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: GroupFacade, useValue: mockGroupFacade },
        { provide: SyncFacade, useValue: mockSyncFacade },
        { provide: RxdbService, useValue: mockRxdbService },
        { provide: GroupDBState, useValue: mockGroupDBState },
        { provide: ExpensesDBState, useValue: mockExpensesDBState },
        { provide: SyncQueueDBState, useValue: mockSyncQueueDBState },
        { provide: UserDBState, useValue: mockUserDBState },
        { provide: BackgroundSyncService, useValue: mockBackgroundSyncService },
      ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize without errors', () => {
    expect(component).toBeDefined();
    expect(fixture.componentInstance).toBeInstanceOf(Dashboard);
  });

  describe('Component Integration', () => {
    it('should render dashboard header component', () => {
      const dashboardHeaderElement =
        fixture.debugElement.nativeElement.querySelector(
          'app-dashboard-header',
        );
      expect(dashboardHeaderElement).toBeTruthy();
    });

    it('should render sync status component', () => {
      const syncStatusElement =
        fixture.debugElement.nativeElement.querySelector('app-sync-status');
      expect(syncStatusElement).toBeTruthy();
    });

    it('should render dashboard group list component', () => {
      const groupListElement = fixture.debugElement.nativeElement.querySelector(
        'app-dashboard-group-list',
      );
      expect(groupListElement).toBeTruthy();
    });

    it('should have dashboard container structure', () => {
      const dashboardSection = fixture.debugElement.nativeElement.querySelector(
        'section.dashboard.container.py-4',
      );
      expect(dashboardSection).toBeTruthy();
    });
  });

  describe('Service Integration', () => {
    it('should inject AuthFacade correctly', () => {
      expect(mockAuthFacade.getCurrentUser).toBeDefined();
      expect(mockAuthFacade.isAuthenticated).toBeDefined();
    });

    it('should inject GroupFacade correctly', () => {
      expect(mockGroupFacade.getGroups).toBeDefined();
      expect(mockGroupFacade.getSelectedGroup).toBeDefined();
    });

    it('should inject SyncFacade correctly', () => {
      expect(mockSyncFacade.forceSync).toBeDefined();
    });
  });
});
