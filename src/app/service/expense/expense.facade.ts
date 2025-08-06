import { computed, inject, Injectable, Signal } from '@angular/core';
import { ExpenseApiService } from '../../core/api/expenseApi/expenseApi.service';
import {
  ExpenseRequest,
  ExpenseListResponse,
  ExpenseResponse,
  Expense,
  UserBalanceResponse,
  ExpenseUpdateRequest,
  Participant,
} from '../../core/api/expenseApi/expenseApi.model';
import {
  setExpenses,
  setSelectedExpense,
  setExpenseError,
  setExpenseLoading,
  setExpensePagination,
  expenses,
  selectedExpense,
  expenseError,
  expenseLoading,
  _userBalance,
} from '../../core/state-management/expense.state';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ExpenseFacade {
  private readonly api: ExpenseApiService = inject(ExpenseApiService);
  private readonly toast: ToastrService = inject(ToastrService);

  private readonly _expenses: Signal<Expense[]> = computed(() => expenses());
  private readonly _selectedExpense: Signal<Expense | null> = computed(() =>
    selectedExpense(),
  );

  private readonly _userBalance: Signal<number | null> = computed(() =>
    _userBalance(),
  );

  fetchExpenses(groupId: string): void {
    setExpenseLoading(true);
    setExpenseError(null);

    this.api.getExpenses(groupId).subscribe({
      next: (data: ExpenseListResponse) => {
        setExpenses(data.data.expenses);
        setExpensePagination(data.data.pagination);
      },
      error: () => {
        const msg: string = 'Failed to load expenses.';
        setExpenseError(msg);
        this.toast.error(msg);
      },
      complete: () => setExpenseLoading(false),
    });
  }

  fetchExpenseById(groupId: string, expenseId: string): void {
    setExpenseLoading(true);
    setExpenseError(null);

    this.api.getExpenseById(groupId, expenseId).subscribe({
      next: (res: ExpenseResponse) => {
        setSelectedExpense(res.data.expense);
      },
      error: () => {
        setExpenseError('Failed to load expense.');
        this.toast.error('Could not load the expense.');
      },
      complete: () => setExpenseLoading(false),
    });
  }

  createExpense(groupId: string, data: ExpenseRequest): void {
    setExpenseLoading(true);
    setExpenseError(null);

    this.api.createExpense(data, groupId).subscribe({
      next: () => {
        this.toast.success('Expense created!');
        this.fetchExpenses(groupId);
      },
      error: () => {
        setExpenseError('Failed to create expense.');
        this.toast.error('Could not create expense.');
      },
      complete: () => setExpenseLoading(false),
    });
  }

  updateExpense(
    groupId: string,
    expenseId: string,
    data: ExpenseUpdateRequest,
  ): void {
    setExpenseLoading(true);
    setExpenseError(null);

    this.api.updateExpense(groupId, expenseId, data).subscribe({
      next: (res: ExpenseResponse) => {
        this.toast.success('Expense updated!');
        setSelectedExpense(res.data.expense);
        this.fetchExpenses(groupId); // Optional
      },
      error: () => {
        setExpenseError('Update failed.');
        this.toast.error('Could not update expense.');
      },
      complete: () => setExpenseLoading(false),
    });
  }

  deleteExpense(groupId: string, expenseId: string): void {
    setExpenseLoading(true);
    setExpenseError(null);

    this.api.deleteExpense(groupId, expenseId).subscribe({
      next: () => {
        this.toast.success('Expense deleted.');
        this.fetchExpenses(groupId);
        setSelectedExpense(null);
      },
      error: () => {
        setExpenseError('Delete failed.');
        this.toast.error('Could not delete expense.');
      },
      complete: () => setExpenseLoading(false),
    });
  }

  fetchUserBalance(groupId: string, userId: string): void {
    setExpenseLoading(true);
    setExpenseError(null);

    this.api.getUserBalance(groupId, userId).subscribe({
      next: (res: UserBalanceResponse) => {
        _userBalance.set(res.data.net_balance);
      },
      error: () => {
        setExpenseError('Failed to load user balance.');
        this.toast.error('Could not load user balance.');
      },
      complete: () => setExpenseLoading(false),
    });
  }

  // --- Generic Accessors ---
  getError(): typeof expenseError {
    return expenseError;
  }

  isLoading(): typeof expenseLoading {
    return expenseLoading;
  }

  setLoading(value: boolean): void {
    setExpenseLoading(value);
  }

  setError(message: string): void {
    setExpenseError(message);
  }

  getExpenses(groupId: string): Signal<Expense[]> {
    if (this._expenses() === null) {
      this.fetchExpenses(groupId);
    }
    return this._expenses;
  }

  getSelectedExpense(): Signal<Expense | null> {
    return this._selectedExpense;
  }

  getUserBalance(): Signal<number | null> {
    return this._userBalance;
  }

  getExpenseParticipants(): Signal<Participant[]> {
    return computed(() => this._selectedExpense()?.participants || []);
  }
}
