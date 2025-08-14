import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { GroupEdit } from './group-edit';
import { GroupFacade } from '../../service/group/group.facade';
import { RxdbService } from '../../core/state-management/RxDB/rxdb.service';
import { GroupDBState } from '../../core/state-management/RxDB/group/groupDB.state';
import { ExpensesDBState } from '../../core/state-management/RxDB/expenses/expensesDB.state';
import { SyncQueueDBState } from '../../core/state-management/RxDB/sync-queue/sync-queueDB.state';
import { Group } from '../../core/api/groupApi/groupApi.model';
import { BackgroundSyncService } from '../../core/services/background-sync/background-sync.service';

describe('GroupEdit', () => {
  let component: GroupEdit;
  let fixture: ComponentFixture<GroupEdit>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockGroup: Group = {
    id: 'test-id',
    name: 'Test Group',
    description: 'Test Description',
    created_by: 'user-id',
    member_count: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    // Mock GroupFacade
    mockGroupFacade = jasmine.createSpyObj('GroupFacade', [
      'getSelectedGroup',
      'fetchGroupById',
      'updateGroup',
    ]);
    mockGroupFacade.getSelectedGroup.and.returnValue(signal(mockGroup));

    // Mock Router
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Mock ActivatedRoute
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('test-id'),
        },
      },
    };

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
      'removeAllExpenses$',
    ]);
    const mockSyncQueueDBState = jasmine.createSpyObj('SyncQueueDBState', [
      'getAll$',
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
    mockExpensesDBState.removeAllExpenses$.and.returnValue(of(undefined));
    mockSyncQueueDBState.getAll$.and.returnValue(of([]));
    mockSyncQueueDBState.clearQueue$.and.returnValue(of(undefined));
    mockBackgroundSyncService.getQueueStats.and.returnValue({
      isSyncing: false,
      progress: 0,
      totalItems: 0,
      failedItems: 0,
      hasFailedItems: false,
    });

    await TestBed.configureTestingModule({
      imports: [GroupEdit, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        provideToastr(),
        provideNoopAnimations(),
        provideHttpClient(),
        provideRouter([
          { path: 'dashboard', component: class {} },
          { path: 'groups/:id', component: class {} },
        ]),
        FormBuilder,
        { provide: GroupFacade, useValue: mockGroupFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: RxdbService, useValue: mockRxdbService },
        { provide: GroupDBState, useValue: mockGroupDBState },
        { provide: ExpensesDBState, useValue: mockExpensesDBState },
        { provide: SyncQueueDBState, useValue: mockSyncQueueDBState },
        { provide: BackgroundSyncService, useValue: mockBackgroundSyncService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should fetch group by id on init', () => {
      expect(mockGroupFacade.fetchGroupById).toHaveBeenCalledWith('test-id');
    });

    it('should navigate to dashboard if no group id', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('Form Validation', () => {
    it('should require group name', () => {
      const nameControl = component.groupForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();
      expect(nameControl?.hasError('required')).toBeTruthy();
    });

    it('should validate minimum length for group name', () => {
      const nameControl = component.groupForm.get('name');
      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBeTruthy();
    });

    it('should validate maximum length for description', () => {
      const descriptionControl = component.groupForm.get('description');
      descriptionControl?.setValue('a'.repeat(256));
      expect(descriptionControl?.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should call updateGroup on valid form submission', () => {
      component.groupForm.patchValue({
        name: 'Updated Group Name',
        description: 'Updated Description',
      });

      component.onSubmit();

      expect(mockGroupFacade.updateGroup).toHaveBeenCalledWith('test-id', {
        name: 'Updated Group Name',
        description: 'Updated Description',
      });
    });

    it('should not submit invalid form', () => {
      component.groupForm.patchValue({
        name: '',
        description: 'Test',
      });

      component.onSubmit();

      expect(mockGroupFacade.updateGroup).not.toHaveBeenCalled();
    });

    it('should trim form values before submission', () => {
      component.groupForm.patchValue({
        name: 'Test Group',
        description: '  Test Description  ',
      });

      component.onSubmit();

      expect(mockGroupFacade.updateGroup).toHaveBeenCalledWith('test-id', {
        name: 'Test Group',
        description: 'Test Description',
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to group detail on cancel', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/groups', 'test-id']);
    });
  });
});
