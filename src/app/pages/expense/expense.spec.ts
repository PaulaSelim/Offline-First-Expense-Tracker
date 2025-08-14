import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { ExpenseFacade } from '../../service/expense/expense.facade';
import { GroupFacade } from '../../service/group/group.facade';
import { Expense } from '../../core/api/expenseApi/expenseApi.model';
import { Group } from '../../core/api/groupApi/groupApi.model';
import { ExpenseComponent } from './expense';
import { provideToastr } from 'ngx-toastr';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('ExpenseComponent', () => {
  let component: ExpenseComponent;
  let fixture: ComponentFixture<ExpenseComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockExpenseFacade: jasmine.SpyObj<ExpenseFacade>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;

  const mockExpenses: Expense[] = [
    {
      id: '1',
      group_id: 'group1',
      title: 'Test Expense 1',
      amount: 100.5,
      category: 'Food',
      date: '2025-01-15T00:00:00Z',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
      payer_id: 'user1',
    },
    {
      id: '2',
      group_id: 'group1',
      title: 'Test Expense 2',
      amount: 75.25,
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
    description: 'Test Description',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    member_count: 5,
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

    await TestBed.configureTestingModule({
      imports: [ExpenseComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideToastr(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ExpenseFacade, useValue: mockExpenseFacade },
        { provide: GroupFacade, useValue: mockGroupFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseComponent);
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
  });

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
});
