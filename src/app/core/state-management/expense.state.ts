import { signal, WritableSignal, Signal } from '@angular/core';
import { Expense } from '../api/expenseApi/expenseApi.model';
import { Pagination } from '../api/groupApi/groupApi.model';

// === Writable Signals ===
const _expenses: WritableSignal<Expense[]> = signal([]);
const _selectedExpense: WritableSignal<Expense | null> = signal(null);
const _expensePagination: WritableSignal<Pagination | null> = signal(null);
export const _userBalance: WritableSignal<number | null> = signal(null);

const _expenseLoading: WritableSignal<boolean> = signal(false);
const _expenseError: WritableSignal<string | null> = signal(null);

// === Readonly ===
export const expenses: Signal<Expense[]> = _expenses.asReadonly();
export const selectedExpense: Signal<Expense | null> =
  _selectedExpense.asReadonly();
export const expensePagination: Signal<Pagination | null> =
  _expensePagination.asReadonly();
export const expenseLoading: Signal<boolean> = _expenseLoading.asReadonly();
export const expenseError: Signal<string | null> = _expenseError.asReadonly();

// === Setters ===
export const setExpenses: (value: Expense[]) => void = (
  value: Expense[],
): void => {
  _expenses.set(value);
};

export const setSelectedExpense: (value: Expense | null) => void = (
  value: Expense | null,
): void => {
  _selectedExpense.set(value);
};

export const setExpensePagination: (value: Pagination | null) => void = (
  value: Pagination | null,
): void => {
  _expensePagination.set(value);
};

export const setExpenseLoading: (value: boolean) => void = (
  value: boolean,
): void => {
  _expenseLoading.set(value);
};

export const setExpenseError: (value: string | null) => void = (
  value: string | null,
): void => {
  _expenseError.set(value);
};

export function setUserBalance(balance: number): void {
  _userBalance.set(balance);
}

// === Reset ===
export const resetExpenseState: () => void = (): void => {
  _expenses.set([]);
  _selectedExpense.set(null);
  _expensePagination.set(null);
  _expenseLoading.set(false);
  _expenseError.set(null);
};

export function resetUserBalance(): void {
  _userBalance.set(null);
}
