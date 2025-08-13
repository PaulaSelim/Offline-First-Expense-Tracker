import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { GroupCreate } from './group-create';
import { GroupFacade } from '../../service/group/group.facade';
import { CardShared } from '../../shared/card-shared/card-shared';
import { GroupCreateForm } from './group-create-form/group-create-form';
import { RxdbService } from '../../core/state-management/RxDB/rxdb.service';
import { GroupDBState } from '../../core/state-management/RxDB/group/groupDB.state';
import { ExpensesDBState } from '../../core/state-management/RxDB/expenses/expensesDB.state';
import { SyncQueueDBState } from '../../core/state-management/RxDB/sync-queue/sync-queueDB.state';
import { BackgroundSyncService } from '../../core/services/background-sync/background-sync.service';

describe('GroupCreate', () => {
  let component: GroupCreate;
  let fixture: ComponentFixture<GroupCreate>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Mock GroupFacade
    mockGroupFacade = jasmine.createSpyObj('GroupFacade', ['createGroup']);

    // Mock Router
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Mock RxDB Services
    const mockRxdbService = jasmine.createSpyObj('RxdbService', ['database']);
    const mockGroupDBState = jasmine.createSpyObj('GroupDBState', [
      'getAllGroups$',
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
      imports: [GroupCreate, CardShared, GroupCreateForm, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideToastr(),
        provideNoopAnimations(),
        provideRouter([{ path: 'dashboard', component: class {} }]),
        FormBuilder,
        { provide: GroupFacade, useValue: mockGroupFacade },
        { provide: Router, useValue: mockRouter },
        { provide: RxdbService, useValue: mockRxdbService },
        { provide: GroupDBState, useValue: mockGroupDBState },
        { provide: ExpensesDBState, useValue: mockExpensesDBState },
        { provide: SyncQueueDBState, useValue: mockSyncQueueDBState },
        { provide: BackgroundSyncService, useValue: mockBackgroundSyncService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.groupForm.get('name')?.value).toBe('');
      expect(component.groupForm.get('description')?.value).toBe('');
    });

    it('should have required validator on name control', () => {
      const nameControl = component.groupForm.get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should validate minimum length for group name', () => {
      const nameControl = component.groupForm.get('name');
      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBeTruthy();
    });

    it('should validate maximum length for group name', () => {
      const nameControl = component.groupForm.get('name');
      nameControl?.setValue('a'.repeat(51));
      expect(nameControl?.hasError('maxlength')).toBeTruthy();
    });

    it('should validate maximum length for description', () => {
      const descriptionControl = component.groupForm.get('description');
      descriptionControl?.setValue('a'.repeat(256));
      expect(descriptionControl?.hasError('maxlength')).toBeTruthy();
    });

    it('should accept valid form data', () => {
      component.groupForm.patchValue({
        name: 'Valid Group Name',
        description: 'Valid description',
      });
      expect(component.groupForm.valid).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should call createGroup on valid form submission', () => {
      component.groupForm.patchValue({
        name: 'Test Group',
        description: 'Test Description',
      });

      component.onSubmit();

      expect(mockGroupFacade.createGroup).toHaveBeenCalledWith({
        name: 'Test Group',
        description: 'Test Description',
      });
    });

    it('should trim form values before submission', () => {
      component.groupForm.patchValue({
        name: '  Test Group  ',
        description: '  Test Description  ',
      });

      component.onSubmit();

      expect(mockGroupFacade.createGroup).toHaveBeenCalledWith({
        name: 'Test Group',
        description: 'Test Description',
      });
    });

    it('should handle empty description', () => {
      component.groupForm.patchValue({
        name: 'Test Group',
        description: '',
      });

      component.onSubmit();

      expect(mockGroupFacade.createGroup).toHaveBeenCalledWith({
        name: 'Test Group',
        description: '',
      });
    });

    it('should reset form after submission', () => {
      component.groupForm.patchValue({
        name: 'Test Group',
        description: 'Test Description',
      });

      spyOn(component.groupForm, 'reset');
      component.onSubmit();

      expect(component.groupForm.reset).toHaveBeenCalled();
    });

    it('should navigate to dashboard after submission', () => {
      component.groupForm.patchValue({
        name: 'Test Group',
        description: 'Test Description',
      });

      component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not submit invalid form', () => {
      component.groupForm.patchValue({
        name: '',
        description: 'Test',
      });

      component.onSubmit();

      expect(mockGroupFacade.createGroup).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard on cancel', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('Utility Methods', () => {
    it('should return correct control references', () => {
      expect(component.nameControl).toBe(component.groupForm.get('name'));
      expect(component.descriptionControl).toBe(
        component.groupForm.get('description'),
      );
    });

    it('should correctly identify invalid controls', () => {
      const nameControl = component.groupForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();

      const isInvalidFn = component.isInvalid();
      expect(isInvalidFn('name')).toBeTruthy();
    });
  });
});
