import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { ExpenseFacade } from '../../../service/expense/expense.facade';
import { GroupFacade } from '../../../service/group/group.facade';
import { Expense } from '../../../core/api/expenseApi/expenseApi.model';
import { Group } from '../../../core/api/groupApi/groupApi.model';
import { CategoryIconPipe } from '../../../shared/category-icon/category-icon-pipe';
import { ExpenseList } from './expense-list';
import { provideZonelessChangeDetection } from '@angular/core';
describe('ExpenseList', () => {
  let component: ExpenseList;
  let fixture: ComponentFixture<ExpenseList>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockExpenseFacade: jasmine.SpyObj<ExpenseFacade>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;
  let confirmSpy: jasmine.Spy;

  const mockExpenses: Expense[] = [
    {
      id: '1',
      group_id: 'group1',
      title: 'Lunch at restaurant',
      amount: 85.5,
      category: 'Food',
      date: '2025-01-15T00:00:00Z',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
      payer_id: 'user1',
    },
    {
      id: '2',
      group_id: 'group1',
      title: 'Uber ride',
      amount: 25.75,
      category: 'Transport',
      date: '2025-01-14T00:00:00Z',
      created_at: '2025-01-14T10:00:00Z',
      updated_at: '2025-01-14T10:00:00Z',
      payer_id: 'user2',
    },
  ];

  const mockGroup: Group = {
    id: 'group1',
    name: 'Test Group',
    created_by: 'user1',
    member_count: 5,
    description: 'Test Description',
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

    mockExpenseFacade = jasmine.createSpyObj('ExpenseFacade', [
      'fetchExpenses',
      'getExpenses',
      'isLoading',
      'getError',
      'deleteExpense',
    ]);

    mockGroupFacade = jasmine.createSpyObj('GroupFacade', [
      'fetchGroupById',
      'getSelectedGroup',
    ]);

    // Setup facade return values
    mockExpenseFacade.getExpenses.and.returnValue(signal(mockExpenses));
    mockExpenseFacade.isLoading.and.returnValue(signal(false));
    mockExpenseFacade.getError.and.returnValue(signal(null));
    mockGroupFacade.getSelectedGroup.and.returnValue(signal(mockGroup));

    confirmSpy = spyOn(window, 'confirm');

    await TestBed.configureTestingModule({
      imports: [ExpenseList, CategoryIconPipe],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ExpenseFacade, useValue: mockExpenseFacade },
        { provide: GroupFacade, useValue: mockGroupFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load expense data when groupId is provided', () => {
      spyOn(component as any, 'loadExpenseData');

      component.ngOnInit();

      expect(component['loadExpenseData']).toHaveBeenCalled();
    });

    it('should navigate to dashboard when no groupId is provided', () => {
      mockActivatedRoute.snapshot.paramMap.get = jasmine
        .createSpy('get')
        .and.returnValue(null);

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should set groupId from route params', () => {
      component.ngOnInit();

      expect(component['groupId']).toBe('group1');
    });
  });

  describe('loadExpenseData', () => {
    it('should set loading to true initially', () => {
      component['loadExpenseData']();

      expect(component.isLoading()).toBe(true);
    });

    it('should fetch group and expenses data', () => {
      component['groupId'] = 'group1';

      component['loadExpenseData']();

      expect(mockGroupFacade.fetchGroupById).toHaveBeenCalledWith('group1');
      expect(mockExpenseFacade.fetchExpenses).toHaveBeenCalledWith('group1');
    });

    it('should set loading to false after timeout', (done) => {
      component['loadExpenseData']();

      setTimeout(() => {
        expect(component.isLoading()).toBe(false);
        done();
      }, 600);
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

    it('should navigate to edit expense page', () => {
      const expenseId = 'expense123';

      component.onEditExpense(expenseId);

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        'group1',
        'expenses',
        expenseId,
        'edit',
      ]);
    });

    it('should navigate to expense detail page', () => {
      const expenseId = 'expense123';

      component.onViewExpenseDetail(expenseId);

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        'group1',
        'expenses',
        expenseId,
      ]);
    });

    it('should navigate back to group page', () => {
      component.onBackToGroup();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/groups', 'group1']);
    });
  });

  describe('onDeleteExpense', () => {
    const mockExpense: Expense = {
      id: 'expense123',
      group_id: 'group1',
      title: 'Test Expense',
      amount: 50.0,
      category: 'Food',
      date: '2025-01-15T00:00:00Z',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
      payer_id: 'user1',
    };

    beforeEach(() => {
      component['groupId'] = 'group1';
    });

    it('should delete expense when user confirms', () => {
      confirmSpy.and.returnValue(true);

      component.onDeleteExpense(mockExpense);

      expect(mockExpenseFacade.deleteExpense).toHaveBeenCalledWith(
        'group1',
        'expense123',
      );
    });

    it('should not delete expense when user cancels', () => {
      confirmSpy.and.returnValue(false);

      component.onDeleteExpense(mockExpense);

      expect(mockExpenseFacade.deleteExpense).not.toHaveBeenCalled();
    });

    it('should show confirmation dialog with expense title', () => {
      confirmSpy.and.returnValue(true);

      component.onDeleteExpense(mockExpense);

      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete the expense "Test Expense"? This action cannot be undone.',
      );
    });
  });

  describe('utility methods', () => {
    describe('getFormattedDate', () => {
      it('should format date string correctly', () => {
        const dateString = '2025-01-15T10:30:00Z';

        const result = component.getFormattedDate(dateString);

        expect(result).toBe(new Date(dateString).toLocaleDateString());
      });

      it('should handle invalid date string', () => {
        const invalidDate = 'invalid-date';

        const result = component.getFormattedDate(invalidDate);

        expect(result).toBe('Invalid Date');
      });
    });

    describe('getFormattedAmount', () => {
      it('should format amount as USD currency', () => {
        const amount = 123.45;

        const result = component.getFormattedAmount(amount);

        expect(result).toBe('$123.45');
      });

      it('should format zero correctly', () => {
        const amount = 0;

        const result = component.getFormattedAmount(amount);

        expect(result).toBe('$0.00');
      });

      it('should format large amounts with commas', () => {
        const amount = 1234567.89;

        const result = component.getFormattedAmount(amount);

        expect(result).toBe('$1,234,567.89');
      });
    });

    describe('getTotalAmount', () => {
      it('should calculate total amount of all expenses', () => {
        const result = component.getTotalAmount();

        // 85.50 + 25.75 = 111.25
        expect(result).toBe(111.25);
      });
    });

    describe('getExpenseCount', () => {
      it('should return correct count of expenses', () => {
        const result = component.getExpenseCount();

        expect(result).toBe(2);
      });
    });
  });

  describe('signals', () => {
    it('should initialize isLoading signal with true', () => {
      expect(component.isLoading()).toBe(true);
    });

    it('should get expenses from facade', () => {
      expect(component.expenses()).toEqual(mockExpenses);
    });

    it('should get selected group from facade', () => {
      expect(component.selectedGroup()).toEqual(mockGroup);
    });

    it('should get loading state from expense facade', () => {
      expect(component.isLoadingExpenses()).toBe(false);
    });

    it('should get error state from expense facade', () => {
      expect(component.expenseError()).toBeNull();
    });
  });

  describe('component lifecycle', () => {
    it('should set loading to false after data loads', (done) => {
      component.ngOnInit();

      expect(component.isLoading()).toBe(true);

      setTimeout(() => {
        expect(component.isLoading()).toBe(false);
        done();
      }, 600);
    });
  });
});
