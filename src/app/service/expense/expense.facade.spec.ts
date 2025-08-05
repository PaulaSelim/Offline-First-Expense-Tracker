import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { provideZonelessChangeDetection } from '@angular/core';
import { ExpenseApiService } from '../../core/api/expenseApi/expenseApi.service';
import {
  ExpenseRequest,
  ExpenseListResponse,
  ExpenseResponse,
  Expense,
  Participant,
  UserBalanceResponse,
} from '../../core/api/expenseApi/expenseApi.model';
import {
  setExpenses,
  setSelectedExpense,
  setExpenseError,
  setExpenseLoading,
  expenses,
  selectedExpense,
  expenseError,
  expenseLoading,
  _userBalance,
} from '../../core/state-management/expense.state';
import { ExpenseFacade } from './expense.facade';

describe('ExpenseFacade', () => {
  let service: ExpenseFacade;
  let mockExpenseApiService: jasmine.SpyObj<ExpenseApiService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;

  const mockParticipant: Participant = {
    user_id: 'user1',
    email: 'user1@example.com',
    username: 'user1',
    share_amount: 50,
  };

  const mockExpense: Expense = {
    id: '1',
    group_id: 'group1',
    group_name: 'Test Group',
    title: 'Test Expense',
    amount: 100,
    payer_id: 'user1',
    category: 'Food',
    date: '2024-01-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    payer: mockParticipant,
    participants: [mockParticipant],
    participant_count: 1,
  };

  const mockExpenseListResponse: ExpenseListResponse = {
    data: {
      expenses: [mockExpense],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    },
  };

  const mockExpenseResponse: ExpenseResponse = {
    data: {
      expense: mockExpense,
    },
  };

  const mockExpenseRequest: ExpenseRequest = {
    title: 'Test Expense',
    amount: 100,
    payer_id: 'user1',
    category_id: 'category1',
    date: '2024-01-01',
    is_payer_included: true,
    participants_id: ['user1', 'user2'],
  };

  beforeEach(() => {
    const expenseApiSpy = jasmine.createSpyObj('ExpenseApiService', [
      'getExpenses',
      'getExpenseById',
      'createExpense',
      'updateExpense',
      'deleteExpense',
      'getUserBalance',
    ]);

    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ExpenseFacade,
        provideZonelessChangeDetection(),
        { provide: ExpenseApiService, useValue: expenseApiSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    });

    service = TestBed.inject(ExpenseFacade);
    mockExpenseApiService = TestBed.inject(
      ExpenseApiService,
    ) as jasmine.SpyObj<ExpenseApiService>;
    mockToastrService = TestBed.inject(
      ToastrService,
    ) as jasmine.SpyObj<ToastrService>;

    // Reset state before each test
    setExpenses([]);
    setSelectedExpense(null);
    setExpenseError(null);
    setExpenseLoading(false);
    _userBalance.set(null);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchExpenses', () => {
    it('should fetch expenses successfully', () => {
      const groupId = 'group1';
      mockExpenseApiService.getExpenses.and.returnValue(
        of(mockExpenseListResponse),
      );

      service.fetchExpenses(groupId);

      expect(mockExpenseApiService.getExpenses).toHaveBeenCalledWith(groupId);
      expect(expenses()).toEqual([mockExpense]);
    });

    it('should handle fetch expenses error', () => {
      const groupId = 'group1';
      mockExpenseApiService.getExpenses.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      service.fetchExpenses(groupId);

      expect(mockExpenseApiService.getExpenses).toHaveBeenCalledWith(groupId);
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Failed to load expenses.',
      );
      expect(expenseError()).toBe('Failed to load expenses.');
    });

    it('should set loading state correctly during fetch', () => {
      const groupId = 'group1';
      mockExpenseApiService.getExpenses.and.returnValue(
        of(mockExpenseListResponse),
      );

      service.fetchExpenses(groupId);

      // Loading should be set to false after completion
      expect(expenseLoading()).toBe(false);
    });
  });

  describe('fetchExpenseById', () => {
    it('should fetch expense by id successfully', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';
      mockExpenseApiService.getExpenseById.and.returnValue(
        of(mockExpenseResponse),
      );

      service.fetchExpenseById(groupId, expenseId);

      expect(mockExpenseApiService.getExpenseById).toHaveBeenCalledWith(
        groupId,
        expenseId,
      );
      expect(selectedExpense()).toEqual(mockExpense);
    });

    it('should handle fetch expense by id error', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';
      mockExpenseApiService.getExpenseById.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      service.fetchExpenseById(groupId, expenseId);

      expect(mockExpenseApiService.getExpenseById).toHaveBeenCalledWith(
        groupId,
        expenseId,
      );
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Could not load the expense.',
      );
      expect(expenseError()).toBe('Failed to load expense.');
    });
  });

  describe('createExpense', () => {
    it('should create expense successfully', () => {
      const groupId = 'group1';
      mockExpenseApiService.createExpense.and.returnValue(
        of(mockExpenseResponse),
      );
      mockExpenseApiService.getExpenses.and.returnValue(
        of(mockExpenseListResponse),
      );

      service.createExpense(groupId, mockExpenseRequest);

      expect(mockExpenseApiService.createExpense).toHaveBeenCalledWith(
        mockExpenseRequest,
        groupId,
      );
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Expense created!',
      );
      expect(mockExpenseApiService.getExpenses).toHaveBeenCalledWith(groupId);
    });

    it('should handle create expense error', () => {
      const groupId = 'group1';
      mockExpenseApiService.createExpense.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      service.createExpense(groupId, mockExpenseRequest);

      expect(mockExpenseApiService.createExpense).toHaveBeenCalledWith(
        mockExpenseRequest,
        groupId,
      );
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Could not create expense.',
      );
      expect(expenseError()).toBe('Failed to create expense.');
    });
  });

  describe('updateExpense', () => {
    it('should update expense successfully', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';
      mockExpenseApiService.updateExpense.and.returnValue(
        of(mockExpenseResponse),
      );
      mockExpenseApiService.getExpenses.and.returnValue(
        of(mockExpenseListResponse),
      );

      service.updateExpense(groupId, expenseId, mockExpenseRequest);

      expect(mockExpenseApiService.updateExpense).toHaveBeenCalledWith(
        groupId,
        expenseId,
        mockExpenseRequest,
      );
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Expense updated!',
      );
      expect(selectedExpense()).toEqual(mockExpense);
      expect(mockExpenseApiService.getExpenses).toHaveBeenCalledWith(groupId);
    });

    it('should handle update expense error', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';
      mockExpenseApiService.updateExpense.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      service.updateExpense(groupId, expenseId, mockExpenseRequest);

      expect(mockExpenseApiService.updateExpense).toHaveBeenCalledWith(
        groupId,
        expenseId,
        mockExpenseRequest,
      );
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Could not update expense.',
      );
      expect(expenseError()).toBe('Update failed.');
    });
  });

  describe('deleteExpense', () => {
    it('should delete expense successfully', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';
      mockExpenseApiService.deleteExpense.and.returnValue(of(undefined));
      mockExpenseApiService.getExpenses.and.returnValue(
        of(mockExpenseListResponse),
      );

      service.deleteExpense(groupId, expenseId);

      expect(mockExpenseApiService.deleteExpense).toHaveBeenCalledWith(
        groupId,
        expenseId,
      );
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Expense deleted.',
      );
      expect(mockExpenseApiService.getExpenses).toHaveBeenCalledWith(groupId);
      expect(selectedExpense()).toBeNull();
    });

    it('should handle delete expense error', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';
      mockExpenseApiService.deleteExpense.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      service.deleteExpense(groupId, expenseId);

      expect(mockExpenseApiService.deleteExpense).toHaveBeenCalledWith(
        groupId,
        expenseId,
      );
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Could not delete expense.',
      );
      expect(expenseError()).toBe('Delete failed.');
    });
  });

  describe('fetchUserBalance', () => {
    it('should fetch user balance successfully', () => {
      const groupId = 'group1';
      const userId = 'user1';
      const mockBalanceResponse: UserBalanceResponse = {
        data: {
          user_id: 'user1',
          net_balance: 150.5,
          expenses: [
            { expense_id: 'expense1', amount: 100 },
            { expense_id: 'expense2', amount: 50.5 },
          ],
        },
      };
      mockExpenseApiService.getUserBalance.and.returnValue(
        of(mockBalanceResponse),
      );

      service.fetchUserBalance(groupId, userId);

      expect(mockExpenseApiService.getUserBalance).toHaveBeenCalledWith(
        groupId,
        userId,
      );
      expect(_userBalance()).toBe(150.5);
    });

    it('should handle fetch user balance error', () => {
      const groupId = 'group1';
      const userId = 'user1';
      mockExpenseApiService.getUserBalance.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      service.fetchUserBalance(groupId, userId);

      expect(mockExpenseApiService.getUserBalance).toHaveBeenCalledWith(
        groupId,
        userId,
      );
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Could not load user balance.',
      );
      expect(expenseError()).toBe('Failed to load user balance.');
    });
  });

  describe('Generic Accessors', () => {
    it('should return error signal', () => {
      const errorSignal = service.getError();
      expect(errorSignal).toBe(expenseError);
    });

    it('should return loading signal', () => {
      const loadingSignal = service.isLoading();
      expect(loadingSignal).toBe(expenseLoading);
    });

    it('should set loading state', () => {
      service.setLoading(true);
      expect(expenseLoading()).toBe(true);

      service.setLoading(false);
      expect(expenseLoading()).toBe(false);
    });

    it('should set error message', () => {
      const errorMessage = 'Test error';
      service.setError(errorMessage);
      expect(expenseError()).toBe(errorMessage);
    });

    it('should return expenses signal', () => {
      const expensesSignal = service.getExpenses();
      expect(expensesSignal()).toEqual([]);
    });

    it('should return selected expense signal', () => {
      const selectedExpenseSignal = service.getSelectedExpense();
      expect(selectedExpenseSignal()).toBeNull();
    });

    it('should return user balance signal', () => {
      const userBalanceSignal = service.getUserBalance();
      expect(userBalanceSignal()).toBeNull();
    });
  });

  describe('Computed signals', () => {
    it('should update expenses signal when state changes', () => {
      setExpenses([mockExpense]);
      const expensesSignal = service.getExpenses();
      expect(expensesSignal()).toEqual([mockExpense]);
    });

    it('should update selected expense signal when state changes', () => {
      setSelectedExpense(mockExpense);
      const selectedExpenseSignal = service.getSelectedExpense();
      expect(selectedExpenseSignal()).toEqual(mockExpense);
    });

    it('should update user balance signal when state changes', () => {
      _userBalance.set(100.5);
      const userBalanceSignal = service.getUserBalance();
      expect(userBalanceSignal()).toBe(100.5);
    });
  });
});
