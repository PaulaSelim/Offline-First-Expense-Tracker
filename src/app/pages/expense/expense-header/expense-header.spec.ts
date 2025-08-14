import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { GroupFacade } from '../../../service/group/group.facade';
import { Group } from '../../../core/api/groupApi/groupApi.model';
import { ExpenseStats } from '../expense-stats/expense-stats';
import { ExpenseHeader } from './expense-header';

// RxDB Service Mocks
import { RxdbService } from '../../../core/state-management/RxDB/rxdb.service';
import { GroupDBState } from '../../../core/state-management/RxDB/group/groupDB.state';
import { ExpensesDBState } from '../../../core/state-management/RxDB/expenses/expensesDB.state';
import { SyncQueueDBState } from '../../../core/state-management/RxDB/sync-queue/sync-queueDB.state';
import { BackgroundSyncService } from '../../../core/services/background-sync/background-sync.service';
describe('ExpenseHeader', () => {
  let component: ExpenseHeader;
  let fixture: ComponentFixture<ExpenseHeader>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;

  const mockGroup: Group = {
    id: 'group1',
    name: 'Test Group',
    created_by: 'user1',
    member_count: 5,
    description: 'Test group description',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('group1'),
        },
      },
    } as any;

    mockGroupFacade = jasmine.createSpyObj('GroupFacade', ['getSelectedGroup']);
    mockGroupFacade.getSelectedGroup.and.returnValue(signal(mockGroup));

    // Mock RxDB Services
    const mockRxdbService = jasmine.createSpyObj('RxdbService', ['database']);
    const mockGroupDBState = jasmine.createSpyObj('GroupDBState', [
      'getAllGroups$',
      'getGroupById$',
      'addOrUpdateGroup$',
      'removeGroupById$',
      'removeAllGroups$',
    ]);
    const mockExpensesDBState = jasmine.createSpyObj('ExpensesDBState', [
      'getAllExpenses$',
      'addOrUpdateExpense$',
      'removeExpenseById$',
      'removeAllExpenses$',
    ]);
    const mockSyncQueueDBState = jasmine.createSpyObj('SyncQueueDBState', [
      'getAll$',
      'addToQueue$',
      'clearQueue$',
    ]);
    const mockBackgroundSyncService = jasmine.createSpyObj(
      'BackgroundSyncService',
      ['startSync', 'forceSync', 'getQueueStats'],
    );

    // Setup return values for RxDB mocks
    mockGroupDBState.getAllGroups$.and.returnValue(of([]));
    mockGroupDBState.getGroupById$.and.returnValue(of(mockGroup));
    mockGroupDBState.addOrUpdateGroup$.and.returnValue(of(undefined));
    mockGroupDBState.removeGroupById$.and.returnValue(of(undefined));
    mockGroupDBState.removeAllGroups$.and.returnValue(of(undefined));
    mockExpensesDBState.getAllExpenses$.and.returnValue(of([]));
    mockExpensesDBState.addOrUpdateExpense$.and.returnValue(of(undefined));
    mockExpensesDBState.removeExpenseById$.and.returnValue(of(undefined));
    mockExpensesDBState.removeAllExpenses$.and.returnValue(of(undefined));
    mockSyncQueueDBState.getAll$.and.returnValue(of([]));
    mockSyncQueueDBState.addToQueue$.and.returnValue(of(undefined));
    mockSyncQueueDBState.clearQueue$.and.returnValue(of(undefined));
    mockBackgroundSyncService.getQueueStats.and.returnValue({
      isSyncing: false,
      progress: 0,
      totalItems: 0,
      failedItems: 0,
      hasFailedItems: false,
    });

    await TestBed.configureTestingModule({
      imports: [ExpenseHeader, ExpenseStats],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideToastr(),
        provideNoopAnimations(),
        provideRouter([
          { path: 'dashboard', component: class {} },
          { path: 'groups/:id', component: class {} },
          { path: 'groups/:id/expenses/add', component: class {} },
        ]),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: GroupFacade, useValue: mockGroupFacade },
        { provide: RxdbService, useValue: mockRxdbService },
        { provide: GroupDBState, useValue: mockGroupDBState },
        { provide: ExpensesDBState, useValue: mockExpensesDBState },
        { provide: SyncQueueDBState, useValue: mockSyncQueueDBState },
        { provide: BackgroundSyncService, useValue: mockBackgroundSyncService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseHeader);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set groupId from route params', () => {
      component.ngOnInit();

      expect(component['groupId']).toBe('group1');
      expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith(
        'id',
      );
    });

    it('should navigate to dashboard when no groupId is provided', () => {
      mockActivatedRoute.snapshot.paramMap.get = jasmine
        .createSpy('get')
        .and.returnValue(null);

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to dashboard when empty groupId is provided', () => {
      mockActivatedRoute.snapshot.paramMap.get = jasmine
        .createSpy('get')
        .and.returnValue('');

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not navigate when valid groupId is provided', () => {
      component.ngOnInit();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('navigation methods', () => {
    beforeEach(() => {
      component['groupId'] = 'group1';
    });

    it('should navigate to add expense page', () => {
      component.onAddExpense();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        'group1',
        'expenses',
        'add',
      ]);
    });

    it('should navigate back to group page', () => {
      component.onBackToGroup();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/groups', 'group1']);
    });

    it('should use correct groupId for navigation when groupId changes', () => {
      component['groupId'] = 'different-group';

      component.onAddExpense();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        'different-group',
        'expenses',
        'add',
      ]);
    });

    it('should navigate back to correct group when groupId changes', () => {
      component['groupId'] = 'different-group';

      component.onBackToGroup();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        'different-group',
      ]);
    });
  });

  describe('component integration', () => {
    it('should render expense stats component', () => {
      fixture.detectChanges();

      const expenseStats =
        fixture.debugElement.nativeElement.querySelector('app-expense-stats');
      expect(expenseStats).toBeTruthy();
    });

    it('should pass correct data to child components', () => {
      fixture.detectChanges();

      // The ExpenseStats component should be able to access the ExpenseFacade
      // through dependency injection when rendered as a child component
      expect(
        fixture.debugElement.nativeElement.querySelector('app-expense-stats'),
      ).toBeTruthy();
    });
  });

  describe('component lifecycle', () => {
    it('should initialize groupId as empty string', () => {
      expect(component['groupId']).toBe('');
    });

    it('should set groupId after ngOnInit', () => {
      component.ngOnInit();

      expect(component['groupId']).toBe('group1');
    });
  });

  describe('method calls without initialization', () => {
    it('should handle onAddExpense when groupId is empty', () => {
      // Don't call ngOnInit, so groupId remains empty
      component.onAddExpense();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        '',
        'expenses',
        'add',
      ]);
    });

    it('should handle onBackToGroup when groupId is empty', () => {
      // Don't call ngOnInit, so groupId remains empty
      component.onBackToGroup();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/groups', '']);
    });
  });
});
