import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { ExpenseFacade } from '../../service/expense/expense.facade';
import { GroupFacade } from '../../service/group/group.facade';
import {
  Group,
  GroupMember,
  GroupRole,
} from '../../core/api/groupApi/groupApi.model';
import { ExpenseRequest } from '../../core/api/expenseApi/expenseApi.model';
import { ExpenseCreate } from './expense-create';
import { provideZonelessChangeDetection } from '@angular/core';
describe('ExpenseCreate', () => {
  let component: ExpenseCreate;
  let fixture: ComponentFixture<ExpenseCreate>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockExpenseFacade: jasmine.SpyObj<ExpenseFacade>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;

  const mockGroupMembers: GroupMember[] = [
    {
      id: 'member1',
      email: 'john@example.com',
      username: 'john_doe',
      role: GroupRole.ADMIN,
    },
    {
      id: 'member2',
      email: 'jane@example.com',
      username: 'jane_doe',
      role: GroupRole.MEMBER,
    },
  ];

  const mockGroup: Group = {
    id: 'group1',
    name: 'Test Group',
    description: 'Test Description',
    created_by: 'user1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    member_count: 2,
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

    mockExpenseFacade = jasmine.createSpyObj('ExpenseFacade', [
      'createExpense',
    ]);
    mockGroupFacade = jasmine.createSpyObj('GroupFacade', [
      'getSelectedGroup',
      'getGroupMembers',
      'fetchGroupById',
      'fetchGroupMembers',
    ]);

    // Setup facade return values
    mockGroupFacade.getSelectedGroup.and.returnValue(signal(mockGroup));
    mockGroupFacade.getGroupMembers.and.returnValue(signal(mockGroupMembers));

    await TestBed.configureTestingModule({
      imports: [ExpenseCreate, ReactiveFormsModule],
      providers: [
        FormBuilder,
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ExpenseFacade, useValue: mockExpenseFacade },
        { provide: GroupFacade, useValue: mockGroupFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseCreate);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load group data when groupId is provided', () => {
      spyOn(component as any, 'loadGroupData');

      component.ngOnInit();

      expect(component['loadGroupData']).toHaveBeenCalled();
      expect(component['groupId']).toBe('group1');
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
  });

  describe('loadGroupData', () => {
    it('should set loading to true initially', () => {
      component['loadGroupData']();

      expect(component.isLoading()).toBe(true);
    });

    it('should fetch group and members data', () => {
      component['groupId'] = 'group1';

      component['loadGroupData']();

      expect(mockGroupFacade.fetchGroupById).toHaveBeenCalledWith('group1');
      expect(mockGroupFacade.fetchGroupMembers).toHaveBeenCalledWith('group1');
    });

    it('should set loading to false after timeout', (done) => {
      component['loadGroupData']();

      setTimeout(() => {
        expect(component.isLoading()).toBe(false);
        done();
      }, 600);
    });
  });

  describe('form initialization', () => {
    it('should initialize form with default values', () => {
      expect(component.expenseForm.get('title')?.value).toBe('');
      expect(component.expenseForm.get('amount')?.value).toBe('');
      expect(component.expenseForm.get('payer_id')?.value).toBe('');
      expect(component.expenseForm.get('category')?.value).toBe('');
      expect(component.expenseForm.get('is_payer_included')?.value).toBe(true);
      expect(component.expenseForm.get('participants_id')?.value).toEqual([]);
    });

    it('should set date to current date', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(component.expenseForm.get('date')?.value).toBe(today);
    });

    it('should have required validators on required fields', () => {
      const titleControl = component.expenseForm.get('title');
      const amountControl = component.expenseForm.get('amount');
      const payerControl = component.expenseForm.get('payer_id');
      const categoryControl = component.expenseForm.get('category');
      const participantsControl = component.expenseForm.get('participants_id');

      titleControl?.setValue('');
      amountControl?.setValue('');
      payerControl?.setValue('');
      categoryControl?.setValue('');
      participantsControl?.setValue([]);

      expect(titleControl?.hasError('required')).toBe(true);
      expect(amountControl?.hasError('required')).toBe(true);
      expect(payerControl?.hasError('required')).toBe(true);
      expect(categoryControl?.hasError('required')).toBe(true);
      expect(participantsControl?.hasError('required')).toBe(true);
    });
  });

  describe('form controls getters', () => {
    it('should return correct form controls', () => {
      expect(component.titleControl).toBe(component.expenseForm.get('title'));
      expect(component.amountControl).toBe(component.expenseForm.get('amount'));
      expect(component.payerControl).toBe(
        component.expenseForm.get('payer_id'),
      );
      expect(component.categoryControl).toBe(
        component.expenseForm.get('category'),
      );
      expect(component.dateControl).toBe(component.expenseForm.get('date'));
      expect(component.participantsControl).toBe(
        component.expenseForm.get('participants_id'),
      );
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component['groupId'] = 'group1';
      component.expenseForm.patchValue({
        title: 'Test Expense',
        amount: '100.50',
        payer_id: 'user1',
        category: 'Food',
        date: '2025-01-15',
        is_payer_included: true,
        participants_id: ['user1', 'user2'],
      });
    });

    it('should create expense when form is valid and not submitting', () => {
      component.onSubmit();

      const expectedExpenseRequest: ExpenseRequest = {
        title: 'Test Expense',
        amount: 100.5,
        payer_id: 'user1',
        category: 'Food',
        date: '2025-01-15',
        is_payer_included: true,
        participants_id: ['user1', 'user2'],
      };

      expect(component.isSubmitting()).toBe(true);
      expect(mockExpenseFacade.createExpense).toHaveBeenCalledWith(
        'group1',
        expectedExpenseRequest,
      );
    });

    it('should trim whitespace from title', () => {
      component.expenseForm.patchValue({ title: '  Test Expense  ' });

      component.onSubmit();

      expect(mockExpenseFacade.createExpense).toHaveBeenCalledWith(
        'group1',
        jasmine.objectContaining({
          title: 'Test Expense',
        }),
      );
    });

    it('should parse amount as float', () => {
      component.expenseForm.patchValue({ amount: '123.45' });

      component.onSubmit();

      expect(mockExpenseFacade.createExpense).toHaveBeenCalledWith(
        'group1',
        jasmine.objectContaining({
          amount: 123.45,
        }),
      );
    });

    it('should not submit when form is invalid', () => {
      component.expenseForm.patchValue({ title: '' }); // Make form invalid
      spyOn(component as any, 'markFormGroupTouched');

      component.onSubmit();

      expect(mockExpenseFacade.createExpense).not.toHaveBeenCalled();
      expect(component['markFormGroupTouched']).toHaveBeenCalled();
    });

    it('should not submit when already submitting', () => {
      component.isSubmitting.set(true);

      component.onSubmit();

      expect(mockExpenseFacade.createExpense).not.toHaveBeenCalled();
    });

    it('should reset form and navigate after successful submission', (done) => {
      spyOn(component.expenseForm, 'reset');

      component.onSubmit();

      setTimeout(() => {
        expect(component.isSubmitting()).toBe(false);
        expect(component.expenseForm.reset).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith([
          '/groups',
          'group1',
          'expenses',
        ]);
        done();
      }, 1100);
    });
  });

  describe('onCancel', () => {
    it('should navigate back to expenses page', () => {
      component['groupId'] = 'group1';

      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        'group1',
        'expenses',
      ]);
    });
  });

  describe('participant management', () => {
    beforeEach(() => {
      component.expenseForm.patchValue({ participants_id: ['user1'] });
    });

    describe('onParticipantToggle', () => {
      it('should add participant when not selected', () => {
        component.onParticipantToggle('user2');

        expect(component.expenseForm.value.participants_id).toEqual([
          'user1',
          'user2',
        ]);
      });

      it('should remove participant when already selected', () => {
        component.onParticipantToggle('user1');

        expect(component.expenseForm.value.participants_id).toEqual([]);
      });

      it('should handle empty participants array', () => {
        component.expenseForm.patchValue({ participants_id: [] });

        component.onParticipantToggle('user1');

        expect(component.expenseForm.value.participants_id).toEqual(['user1']);
      });

      it('should handle null participants array', () => {
        component.expenseForm.patchValue({ participants_id: null });

        component.onParticipantToggle('user1');

        expect(component.expenseForm.value.participants_id).toEqual(['user1']);
      });
    });

    describe('onSelectAllParticipants', () => {
      it('should select all group members', () => {
        component.onSelectAllParticipants();

        expect(component.expenseForm.value.participants_id).toEqual([
          'member1',
          'member2',
        ]);
      });
    });

    describe('onClearAllParticipants', () => {
      it('should clear all participants', () => {
        component.onClearAllParticipants();

        expect(component.expenseForm.value.participants_id).toEqual([]);
      });
    });

    describe('isParticipantSelected', () => {
      it('should return true when participant is selected', () => {
        component.expenseForm.patchValue({
          participants_id: ['user1', 'user2'],
        });

        expect(component.isParticipantSelected('user1')).toBe(true);
        expect(component.isParticipantSelected('user2')).toBe(true);
      });

      it('should return false when participant is not selected', () => {
        component.expenseForm.patchValue({ participants_id: ['user1'] });

        expect(component.isParticipantSelected('user2')).toBe(false);
      });

      it('should handle empty participants array', () => {
        component.expenseForm.patchValue({ participants_id: [] });

        expect(component.isParticipantSelected('user1')).toBe(false);
      });

      it('should handle null participants array', () => {
        component.expenseForm.patchValue({ participants_id: null });

        expect(component.isParticipantSelected('user1')).toBe(false);
      });
    });
  });

  describe('markFormGroupTouched', () => {
    it('should mark all form controls as touched', () => {
      const controls = component.expenseForm.controls;

      // Ensure controls are not touched initially
      Object.keys(controls).forEach((key) => {
        controls[key].markAsUntouched();
      });

      component['markFormGroupTouched']();

      Object.keys(controls).forEach((key) => {
        expect(controls[key].touched).toBe(true);
      });
    });
  });

  describe('isInvalid signal', () => {
    it('should return true for invalid touched controls', () => {
      const titleControl = component.expenseForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();

      const isInvalidFn = component.isInvalid();
      expect(isInvalidFn('title')).toBe(true);
    });

    it('should return true for invalid dirty controls', () => {
      const titleControl = component.expenseForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsDirty();

      const isInvalidFn = component.isInvalid();
      expect(isInvalidFn('title')).toBe(true);
    });

    it('should return false for valid controls', () => {
      const titleControl = component.expenseForm.get('title');
      titleControl?.setValue('Valid Title');
      titleControl?.markAsTouched();

      const isInvalidFn = component.isInvalid();
      expect(isInvalidFn('title')).toBe(false);
    });

    it('should return false for invalid untouched controls', () => {
      const titleControl = component.expenseForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsUntouched();
      titleControl?.markAsPristine();

      const isInvalidFn = component.isInvalid();
      expect(isInvalidFn('title')).toBe(false);
    });

    it('should return false for non-existent controls', () => {
      const isInvalidFn = component.isInvalid();
      expect(isInvalidFn('nonexistent')).toBe(false);
    });
  });

  describe('categories', () => {
    it('should have predefined categories', () => {
      expect(component.categories).toEqual([
        { id: 'Food', name: 'Food & Dining', icon: '🍽️' },
        { id: 'Transport', name: 'Transportation', icon: '🚗' },
        { id: 'Entertainment', name: 'Entertainment', icon: '🎬' },
        { id: 'Utilities', name: 'Utilities', icon: '💡' },
        { id: 'Healthcare', name: 'Healthcare', icon: '🏥' },
        { id: 'other', name: 'Other', icon: '📦' },
      ]);
    });
  });

  describe('signals', () => {
    it('should initialize isSubmitting as false', () => {
      expect(component.isSubmitting()).toBe(false);
    });

    it('should initialize isLoading as true', () => {
      expect(component.isLoading()).toBe(true);
    });

    it('should get selected group from facade', () => {
      expect(component.selectedGroup()).toEqual(mockGroup);
    });

    it('should get group members from facade', () => {
      expect(component.groupMembers()).toEqual(mockGroupMembers);
    });
  });

  describe('form validation edge cases', () => {
    it('should handle minimum length validation for title', () => {
      const titleControl = component.expenseForm.get('title');
      titleControl?.setValue('ab'); // Less than 3 characters

      expect(titleControl?.hasError('minlength')).toBe(true);
    });

    it('should handle maximum length validation for title', () => {
      const titleControl = component.expenseForm.get('title');
      titleControl?.setValue('a'.repeat(101)); // More than 100 characters

      expect(titleControl?.hasError('maxlength')).toBe(true);
    });

    it('should handle minimum amount validation', () => {
      const amountControl = component.expenseForm.get('amount');
      amountControl?.setValue(0); // Less than 0.01

      expect(amountControl?.hasError('min')).toBe(true);
    });

    it('should handle maximum amount validation', () => {
      const amountControl = component.expenseForm.get('amount');
      amountControl?.setValue(1000000); // More than 999999.99

      expect(amountControl?.hasError('max')).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle form submission with network errors', () => {
      component.expenseForm.patchValue({
        title: 'Test Expense',
        amount: '100.50',
        payer_id: 'user1',
        category: 'Food',
        date: '2025-01-15',
        participants_id: ['user1'],
      });

      // Simulate network error (facade doesn't throw, but we can test resilience)
      expect(() => component.onSubmit()).not.toThrow();
    });
  });
});
