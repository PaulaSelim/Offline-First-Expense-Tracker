import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { ExpenseEdit } from './expense-edit';
import { ExpenseFacade } from '../../service/expense/expense.facade';
import { GroupFacade } from '../../service/group/group.facade';
import {
  Group,
  GroupMember,
  GroupRole,
} from '../../core/api/groupApi/groupApi.model';
import { Expense } from '../../core/api/expenseApi/expenseApi.model';
import { provideZonelessChangeDetection } from '@angular/core';
// Mock services
class MockExpenseFacade {
  getSelectedExpense = jasmine
    .createSpy('getSelectedExpense')
    .and.returnValue(signal(null));
  fetchExpenseById = jasmine.createSpy('fetchExpenseById');
  updateExpense = jasmine.createSpy('updateExpense');
}

class MockGroupFacade {
  getSelectedGroup = jasmine
    .createSpy('getSelectedGroup')
    .and.returnValue(signal(null));
  getGroupMembers = jasmine
    .createSpy('getGroupMembers')
    .and.returnValue(signal([]));
  fetchGroupById = jasmine.createSpy('fetchGroupById');
  fetchGroupMembers = jasmine.createSpy('fetchGroupMembers');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockActivatedRoute {
  snapshot = {
    paramMap: {
      get: jasmine.createSpy('get').and.returnValue('test-id'),
    },
  };
}

describe('ExpenseEdit', () => {
  let component: ExpenseEdit;
  let fixture: ComponentFixture<ExpenseEdit>;
  let mockExpenseFacade: MockExpenseFacade;
  let mockGroupFacade: MockGroupFacade;
  let mockRouter: MockRouter;
  let mockActivatedRoute: MockActivatedRoute;

  const mockExpense: Expense = {
    id: 'expense1',
    title: 'Test Expense',
    amount: 100,
    payer_id: 'user1',
    category: 'Food',
    date: '2023-12-01',
    group_id: 'group1',
    created_at: '2023-12-01',
    updated_at: '2023-12-01',
  };

  const mockGroupMembers: GroupMember[] = [
    {
      id: 'user1',
      username: 'John',
      email: 'john@test.com',
      role: GroupRole.ADMIN,
    },
    {
      id: 'user2',
      username: 'Jane',
      email: 'jane@test.com',
      role: GroupRole.MEMBER,
    },
  ];

  beforeEach(async () => {
    mockExpenseFacade = new MockExpenseFacade();
    mockGroupFacade = new MockGroupFacade();
    mockRouter = new MockRouter();
    mockActivatedRoute = new MockActivatedRoute();

    await TestBed.configureTestingModule({
      imports: [ExpenseEdit, ReactiveFormsModule],
      providers: [
        FormBuilder,
        provideZonelessChangeDetection(),
        { provide: ExpenseFacade, useValue: mockExpenseFacade },
        { provide: GroupFacade, useValue: mockGroupFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseEdit);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isSubmitting()).toBe(false);
    expect(component.isLoading()).toBe(true);
    expect(component.expenseForm).toBeDefined();
  });

  it('should navigate to dashboard when groupId is missing', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should call updateExpense on valid form submission', () => {
    component['groupId'] = 'group123';
    component['expenseId'] = 'expense123';

    component.expenseForm.patchValue({
      title: 'Test Expense',
      amount: 100,
      payer_id: 'user1',
      category: 'Food',
      date: '2023-12-01',
      participants_id: ['user1'],
    });

    component.onSubmit();
    expect(component.isSubmitting()).toBe(true);
    expect(mockExpenseFacade.updateExpense).toHaveBeenCalled();
  });

  it('should not submit invalid form', () => {
    component.expenseForm.patchValue({ title: '' }); // Make form invalid
    spyOn(component as any, 'markFormGroupTouched');

    component.onSubmit();
    expect(mockExpenseFacade.updateExpense).not.toHaveBeenCalled();
    expect(component['markFormGroupTouched']).toHaveBeenCalled();
  });

  it('should add participant when toggling unselected member', () => {
    component.expenseForm.patchValue({ participants_id: ['user1'] });
    component.onParticipantToggle('user2');
    expect(component.expenseForm.value.participants_id).toEqual([
      'user1',
      'user2',
    ]);
  });

  it('should remove participant when toggling selected member', () => {
    component.expenseForm.patchValue({ participants_id: ['user1', 'user2'] });
    component.onParticipantToggle('user1');
    expect(component.expenseForm.value.participants_id).toEqual(['user2']);
  });

  it('should return correct participant selection status', () => {
    component.expenseForm.patchValue({ participants_id: ['user1'] });
    expect(component.isParticipantSelected('user1')).toBe(true);
    expect(component.isParticipantSelected('user2')).toBe(false);
  });
});
