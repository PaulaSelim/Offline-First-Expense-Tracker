import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { signal } from '@angular/core';
import { ExpenseDetail } from './expense-detail';
import { ExpenseFacade } from '../../service/expense/expense.facade';
import { GroupFacade } from '../../service/group/group.facade';
import { Expense } from '../../core/api/expenseApi/expenseApi.model';
import { GroupRole } from '../../core/api/groupApi/groupApi.model';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

describe('ExpenseDetail', () => {
  let component: ExpenseDetail;
  let fixture: ComponentFixture<ExpenseDetail>;
  let mockExpenseFacade: jasmine.SpyObj<ExpenseFacade>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let paramMapSpy: jasmine.SpyObj<ParamMap>;

  const mockExpense: Expense = {
    id: 'expense1',
    group_id: 'group1',
    title: 'Test Expense',
    amount: 100.0,
    category: 'Food',
    date: '2025-01-15T00:00:00Z',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    payer_id: 'user1',
  };

  beforeEach(async () => {
    paramMapSpy = jasmine.createSpyObj('ParamMap', ['get']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: paramMapSpy,
      },
    };
    mockExpenseFacade = jasmine.createSpyObj('ExpenseFacade', [
      'getSelectedExpense',
      'fetchExpenseById',
    ]);
    mockGroupFacade = jasmine.createSpyObj('GroupFacade', [
      'fetchGroupById',
      'fetchGroupMembers',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get'),
        },
      },
    } as any;

    mockExpenseFacade.getSelectedExpense.and.returnValue(signal(mockExpense));

    await TestBed.configureTestingModule({
      imports: [ExpenseDetail],
      providers: [
        { provide: ExpenseFacade, useValue: mockExpenseFacade },
        { provide: GroupFacade, useValue: mockGroupFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideZonelessChangeDetection(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading state as true', () => {
    expect(component.isLoading()).toBe(true);
  });

  it('should have access to GroupRole constant', () => {
    expect(component.GroupRole).toBe(GroupRole);
  });

  it('should navigate to dashboard when groupId is missing', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to dashboard when expenseId is missing', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((param: string) => {
      return param === 'id' ? 'group1' : null;
    });

    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should load expense data when both groupId and expenseId are present', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((param: string) => {
      return param === 'id' ? 'group1' : 'expense1';
    });

    component.ngOnInit();

    expect(mockGroupFacade.fetchGroupById).toHaveBeenCalledWith('group1');
    expect(mockGroupFacade.fetchGroupMembers).toHaveBeenCalledWith('group1');
    expect(mockExpenseFacade.fetchExpenseById).toHaveBeenCalledWith(
      'group1',
      'expense1',
    );
  });

  it('should navigate back to expenses when onBackToExpenses is called', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.callFake((param: string) => {
      return param === 'id' ? 'group1' : 'expense1';
    });
    component.ngOnInit();

    component.onBackToExpenses();

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/groups',
      'group1',
      'expenses',
    ]);
  });

  it('should get selected expense from facade', () => {
    expect(component.selectedExpense()).toEqual(mockExpense);
    expect(mockExpenseFacade.getSelectedExpense).toHaveBeenCalled();
  });
});
