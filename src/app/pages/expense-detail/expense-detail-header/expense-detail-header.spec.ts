import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { signal } from '@angular/core';
import { ExpenseDetailHeader } from './expense-detail-header';
import { ExpenseFacade } from '../../../service/expense/expense.facade';
import { GroupFacade } from '../../../service/group/group.facade';
import { AuthFacade } from '../../../service/auth/auth.facade';
import { Group, GroupRole } from '../../../core/api/groupApi/groupApi.model';
import {
  Expense,
  Participant,
} from '../../../core/api/expenseApi/expenseApi.model';
import { CategoryIconPipe } from '../../../shared/category-icon/category-icon-pipe';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ExpenseDetailHeader', () => {
  let component: ExpenseDetailHeader;
  let fixture: ComponentFixture<ExpenseDetailHeader>;
  let mockExpenseFacade: jasmine.SpyObj<ExpenseFacade>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;
  let mockAuthFacade: jasmine.SpyObj<AuthFacade>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;
  const mockExpense: Expense = {
    id: 'expense1',
    group_id: 'group1',
    title: 'Test Expense',
    amount: 150.0,
    category: 'Food',
    date: '2025-01-15T00:00:00Z',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    payer_id: 'user1',
  };

  const mockGroup: Group = {
    id: 'group1',
    name: 'Test Group',
    created_by: 'user1',
    member_count: 5,
    description: 'Test Description',
    user_role: GroupRole.ADMIN,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const mockParticipants: Participant[] = [
    { id: 'user1', user_id: 'user1', username: 'John Doe' },
    { id: 'user2', user_id: 'user2', username: 'Jane Smith' },
    { id: 'user3', user_id: 'user3', username: 'Bob' },
  ];

  beforeEach(async () => {
    paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: paramMapSpy,
      },
    };
    mockExpenseFacade = jasmine.createSpyObj('ExpenseFacade', [
      'getSelectedExpense',
      'getExpenseParticipants',
      'deleteExpense',
    ]);
    mockGroupFacade = jasmine.createSpyObj('GroupFacade', ['getSelectedGroup']);
    mockAuthFacade = jasmine.createSpyObj('AuthFacade', ['getCurrentUserId']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get'),
        },
      },
    } as any;

    mockExpenseFacade.getSelectedExpense.and.returnValue(signal(mockExpense));
    mockExpenseFacade.getExpenseParticipants.and.returnValue(
      signal(mockParticipants),
    );
    mockGroupFacade.getSelectedGroup.and.returnValue(signal(mockGroup));
    mockAuthFacade.getCurrentUserId.and.returnValue(signal('user1'));

    await TestBed.configureTestingModule({
      imports: [ExpenseDetailHeader, CategoryIconPipe],
      providers: [
        { provide: ExpenseFacade, useValue: mockExpenseFacade },
        { provide: GroupFacade, useValue: mockGroupFacade },
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseDetailHeader);
    component = fixture.componentInstance;

    mockActivatedRoute.snapshot.paramMap.get.and.callFake((param: string) => {
      return param === 'id' ? 'group1' : 'expense1';
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to edit expense page when onEditExpense is called', () => {
    component.onEditExpense();

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/groups',
      'group1',
      'expenses',
      'expense1',
      'edit',
    ]);
  });

  it('should delete expense and navigate when onDeleteExpense is confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.onDeleteExpense();

    expect(mockExpenseFacade.deleteExpense).toHaveBeenCalledWith(
      'group1',
      'expense1',
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/groups',
      'group1',
      'expenses',
    ]);
  });

  it('should not delete expense when onDeleteExpense is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.onDeleteExpense();

    expect(mockExpenseFacade.deleteExpense).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should navigate back to expenses when onBackToExpenses is called', () => {
    component.onBackToExpenses();

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/groups',
      'group1',
      'expenses',
    ]);
  });

  it('should return true for isCurrentUserAdmin when user is admin', () => {
    const result = component.isCurrentUserAdmin();
    expect(result).toBe(true);
  });

  it('should return true for canEditExpense when user is admin', () => {
    const result = component.canEditExpense();
    expect(result).toBe(true);
  });

  it('should format date string correctly', () => {
    const result = component.getFormattedDate('2025-01-15T00:00:00Z');
    expect(result).toContain('1/15/2025');
  });

  it('should format amount as USD currency', () => {
    const result = component.getFormattedAmount(150.0);
    expect(result).toBe('$150.00');
  });
});
