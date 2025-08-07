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
import { ExpensesDBState } from '../../core/state-management/RxDB/expenses/expensesDB.state';
import { take } from 'rxjs';
import { AuthFacade } from '../auth/auth.facade';
import {
  fetchedGroups,
  addFetchedGroup,
  removeFetchedGroup,
  clearFetchedGroups,
} from '../../core/state-management/group.state';
import { SyncFacade } from '../sync/sync.facade';

export interface ExpenseDocument extends Expense {
  pendingSync?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExpenseFacade {
  private readonly api: ExpenseApiService = inject(ExpenseApiService);
  private readonly authfacade: AuthFacade = inject(AuthFacade);
  private readonly syncFacade: SyncFacade = inject(SyncFacade);
  private readonly toast: ToastrService = inject(ToastrService);
  private readonly localDB: ExpensesDBState = inject(ExpensesDBState);

  private readonly _expenses: Signal<Expense[]> = computed(() => expenses());
  private readonly _selectedExpense: Signal<Expense | null> = computed(() =>
    selectedExpense(),
  );
  private readonly _userBalance: Signal<number | null> = computed(() =>
    _userBalance(),
  );

  private readonly fetchedGroups: Signal<Set<string>> = computed(() => {
    return fetchedGroups();
  });

  private readonly isBackendAlive: () => Promise<boolean> = () =>
    this.syncFacade.isBackendAlive();

  private refreshLocalExpenses(groupId: string): void {
    if (!groupId) {
      setExpenseError('Invalid group ID');
      return;
    }

    this.localDB
      .getExpensesByGroupId$(groupId)
      .pipe(take(1))
      .subscribe({
        next: (localExpenses: Expense[]) => {
          setExpenses(localExpenses);
        },
        error: () => {
          this.toast.error('Failed to load local expenses.');
        },
      });
  }

  private syncExpensesToDatabase(expenses: Expense[]): void {
    expenses.forEach((expense: Expense) => {
      try {
        this.localDB.addOrUpdateExpense$(expense).pipe(take(1)).subscribe();
      } catch (error: unknown) {
        const err: Error = error as Error;
        setExpenseError(err.message || 'Failed to sync expenses');
      }
    });
  }

  async fetchExpenses(groupId: string): Promise<void> {
    if (!groupId || groupId.trim() === '') {
      setExpenseError('Invalid group ID');
      this.toast.error('Invalid group ID');
      return;
    }

    if (this.fetchedGroups().has(groupId)) {
      return;
    }

    setExpenseLoading(true);
    setExpenseError(null);

    try {
      let localExpenses: Expense[] = [];

      try {
        localExpenses = await Promise.race([
          new Promise<Expense[]>(
            (
              resolve: (value: Expense[]) => void,
              reject: (reason?: unknown) => void,
            ) => {
              this.localDB
                .getExpensesByGroupId$(groupId)
                .pipe(take(1))
                .subscribe({
                  next: (expenses: Expense[]) => resolve(expenses || []),
                  error: (error: unknown) => reject(error),
                });
            },
          ),
          new Promise<Expense[]>(
            (_: unknown, reject: (reason?: unknown) => void) =>
              setTimeout(() => reject(new Error('Database timeout')), 2000),
          ),
        ]);
      } catch (error: unknown) {
        const err: Error = error as Error;
        setExpenseError(err.message || 'Failed to sync expenses');
      }
      setExpenses(localExpenses);

      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        if (localExpenses.length > 0) {
          this.toast.info('Using cached expenses (offline mode)');
        }
        setExpenseLoading(false);
        addFetchedGroup(groupId);
        return;
      }

      this.api
        .getExpenses(groupId)
        .pipe(take(1))
        .subscribe({
          next: (res: ExpenseListResponse) => {
            const serverExpenses: Expense[] = res.data.expenses;

            this.syncExpensesToDatabase(serverExpenses);

            setExpenses(serverExpenses);
            setExpensePagination(res.data.pagination);
            setExpenseLoading(false);
            addFetchedGroup(groupId);
          },
          error: () => {
            if (localExpenses.length === 0) {
              setExpenseError('Failed to load expenses');
              this.toast.error('Could not load expenses');
            } else {
              this.toast.info('Using cached expenses (offline mode)');
            }
            setExpenseLoading(false);
          },
        });
    } catch (error) {
      setExpenseError('Failed to load expenses');
      this.toast.error(
        error instanceof Error ? error.message : 'Unknown error',
      );
      setExpenseLoading(false);
    }
  }

  async fetchExpenseById(groupId: string, expenseId: string): Promise<void> {
    if (!groupId || groupId.trim() === '') {
      setExpenseError('Invalid group ID');
      this.toast.error('Invalid group ID');
      return;
    }
    if (!expenseId || expenseId.trim() === '') {
      setExpenseError('Invalid expense ID');
      this.toast.error('Invalid expense ID');
      return;
    }

    setExpenseLoading(true);
    setExpenseError(null);

    try {
      const localExpense: Expense | null = await new Promise<Expense | null>(
        (resolve: (value: Expense | null) => void) => {
          this.localDB
            .getExpenseById$(expenseId)
            .pipe(take(1))
            .subscribe({
              next: (expense: Expense | null) => resolve(expense),
              error: () => resolve(null),
            });
        },
      );

      if (localExpense) {
        setSelectedExpense(localExpense);
      }

      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        if (!localExpense) {
          setExpenseError('Expense not found');
          this.toast.error('Expense not available offline');
        } else {
          this.toast.info('Using cached expense (offline mode)');
        }
        setExpenseLoading(false);
        return;
      }

      this.api
        .getExpenseById(groupId, expenseId)
        .pipe(take(1))
        .subscribe({
          next: (res: ExpenseResponse) => {
            const serverExpense: Expense = res.data.expense;
            setSelectedExpense(serverExpense);

            this.localDB
              .addOrUpdateExpense$(serverExpense)
              .pipe(take(1))
              .subscribe();
            setExpenseLoading(false);
          },
          error: () => {
            if (!localExpense) {
              setExpenseError('Expense not found');
              this.toast.error('Expense not found');
            } else {
              this.toast.info('Using cached expense (offline mode)');
            }
            setExpenseLoading(false);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setExpenseError(err.message || 'Failed to load expense');
    }
  }

  async createExpense(groupId: string, data: ExpenseRequest): Promise<void> {
    if (!groupId || groupId.trim() === '') {
      setExpenseError('Invalid group ID');
      this.toast.error('Invalid group ID');
      return;
    }

    setExpenseLoading(true);
    setExpenseError(null);

    const currentUserId: string | null =
      data.payer_id || this.authfacade.getCurrentUserId()();
    if (!currentUserId) {
      setExpenseError('No current user found');
      this.toast.error('Cannot create expense without user ID');
      setExpenseLoading(false);
      return;
    }

    const localExpense: ExpenseDocument = {
      id: crypto.randomUUID(),
      group_id: groupId,
      title: data.title,
      amount: data.amount,
      category: data.category,
      date: data.date,
      payer_id: currentUserId,
      participants: data.participants_id.map((user_id: string) => ({
        user_id,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pendingSync: true,
    };

    this.localDB
      .addOrUpdateExpense$(localExpense)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toast.success('Expense created locally!');
          this.refreshLocalExpenses(groupId);
          this.syncCreateExpense(groupId, data, localExpense);
        },
        error: () => {
          this.toast.error('Failed to create expense locally');
          setExpenseLoading(false);
        },
      });
  }

  private async syncCreateExpense(
    groupId: string,
    data: ExpenseRequest,
    localExpense: ExpenseDocument,
  ): Promise<void> {
    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        this.toast.info('Expense saved locally, will sync when online');
        setExpenseLoading(false);
        return;
      }

      this.api
        .createExpense(data, groupId)
        .pipe(take(1))
        .subscribe({
          next: (res: ExpenseResponse) => {
            const serverExpense: Expense = res.data.expense;

            this.localDB
              .removeExpenseById$(localExpense.id)
              .pipe(take(1))
              .subscribe(() => {
                this.localDB
                  .addOrUpdateExpense$(serverExpense)
                  .pipe(take(1))
                  .subscribe(() => {
                    this.refreshLocalExpenses(groupId);
                    this.toast.success('Expense synced with server!');
                    setExpenseLoading(false);
                  });
              });
          },
          error: () => {
            this.toast.warning('Expense saved locally, will sync when online');
            setExpenseLoading(false);
          },
          complete: () => {
            this.fetchExpenses(groupId);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setExpenseError(err.message || 'Failed to sync expense creation');
    }
  }

  async updateExpense(
    groupId: string,
    expenseId: string,
    data: ExpenseUpdateRequest,
  ): Promise<void> {
    if (!groupId || groupId.trim() === '') {
      setExpenseError('Invalid group ID');
      this.toast.error('Invalid group ID');
      return;
    }

    if (!expenseId || expenseId.trim() === '') {
      setExpenseError('Invalid expense ID');
      this.toast.error('Invalid expense ID');
      return;
    }

    setExpenseLoading(true);
    setExpenseError(null);

    try {
      const currentExpense: Expense | null = await new Promise<Expense | null>(
        (resolve: (value: Expense | null) => void) => {
          this.localDB
            .getExpenseById$(expenseId)
            .pipe(take(1))
            .subscribe({
              next: (expense: Expense | null) => resolve(expense),
              error: () => resolve(null),
            });
        },
      );

      if (!currentExpense) {
        this.toast.error('Expense not found locally');
        setExpenseLoading(false);
        return;
      }

      const updatedExpense: ExpenseDocument = {
        ...currentExpense,
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: data.date,
        payer_id: data.payer_id,
        participants: data.participants_id.map((user_id: string) => ({
          user_id,
        })),
        updated_at: new Date().toISOString(),
        pendingSync: true,
      };

      this.localDB
        .addOrUpdateExpense$(updatedExpense)
        .pipe(take(1))
        .subscribe({
          next: () => {
            setSelectedExpense(updatedExpense);
            this.refreshLocalExpenses(groupId);
            this.toast.success('Expense updated locally!');
            this.syncUpdateExpense(groupId, expenseId, data);
          },
          error: () => {
            this.toast.error('Failed to update expense locally');
            setExpenseLoading(false);
          },
        });
    } catch (error) {
      console.error('[ExpenseFacade] Update expense error:', error);
      setExpenseLoading(false);
    }
  }

  private async syncUpdateExpense(
    groupId: string,
    expenseId: string,
    data: ExpenseUpdateRequest,
  ): Promise<void> {
    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        setExpenseLoading(false);
        return;
      }

      this.api
        .updateExpense(groupId, expenseId, data)
        .pipe(take(1))
        .subscribe({
          next: (res: ExpenseResponse) => {
            const serverExpense: Expense = res.data.expense;
            setSelectedExpense(serverExpense);

            this.localDB
              .addOrUpdateExpense$(serverExpense)
              .pipe(take(1))
              .subscribe(() => {
                this.refreshLocalExpenses(groupId);
                this.toast.success('Expense synced with server!');
                setExpenseLoading(false);
              });
          },
          error: () => {
            this.toast.warning(
              'Expense updated locally, will sync when online',
            );
            setExpenseLoading(false);
          },
          complete: () => {
            this.fetchExpenses(groupId);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setExpenseError(err.message || 'Failed to sync expense update');
    }
  }

  async deleteExpense(groupId: string, expenseId: string): Promise<void> {
    if (!groupId || groupId.trim() === '') {
      console.error(
        '[ExpenseFacade] Cannot delete expense - groupId is required',
      );
      setExpenseError('Invalid group ID');
      this.toast.error('Invalid group ID');
      return;
    }

    if (!expenseId || expenseId.trim() === '') {
      console.error(
        '[ExpenseFacade] Cannot delete expense - expenseId is required',
      );
      setExpenseError('Invalid expense ID');
      this.toast.error('Invalid expense ID');
      return;
    }

    setExpenseLoading(true);
    setExpenseError(null);

    try {
      this.localDB
        .removeExpenseById$(expenseId)
        .pipe(take(1))
        .subscribe({
          next: () => {
            setSelectedExpense(null);
            this.refreshLocalExpenses(groupId);
            this.toast.success('Expense deleted locally!');

            this.syncDeleteExpense(groupId, expenseId);
          },
          error: () => {
            this.toast.error('Failed to delete expense locally');
            setExpenseLoading(false);
          },
        });
    } catch (error) {
      console.error('[ExpenseFacade] Delete expense error:', error);
      setExpenseLoading(false);
    }
  }

  private async syncDeleteExpense(
    groupId: string,
    expenseId: string,
  ): Promise<void> {
    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        setExpenseLoading(false);
        return;
      }

      this.api
        .deleteExpense(groupId, expenseId)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.toast.success('Expense deletion synced with server!');
            setExpenseLoading(false);
          },
          error: () => {
            this.toast.warning(
              'Expense deleted locally, will sync deletion when online',
            );
            setExpenseLoading(false);
          },
          complete: () => {
            this.fetchExpenses(groupId);
          },
        });
    } catch (error) {
      console.error('[ExpenseFacade] Sync delete error:', error);
      setExpenseLoading(false);
    }
  }

  async fetchUserBalance(groupId: string, userId: string): Promise<void> {
    if (!groupId || groupId.trim() === '') {
      console.error(
        '[ExpenseFacade] Cannot fetch balance - groupId is required',
      );
      setExpenseError('Invalid group ID');
      this.toast.error('Invalid group ID');
      return;
    }

    if (!userId || userId.trim() === '') {
      console.error(
        '[ExpenseFacade] Cannot fetch balance - userId is required',
      );
      setExpenseError('Invalid user ID');
      this.toast.error('Invalid user ID');
      return;
    }

    setExpenseLoading(true);
    setExpenseError(null);

    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        this.calculateLocalBalance(groupId, userId);
        return;
      }

      this.api
        .getUserBalance(groupId, userId)
        .pipe(take(1))
        .subscribe({
          next: (res: UserBalanceResponse) => {
            _userBalance.set(res.data.net_balance);
            setExpenseLoading(false);
          },
          error: () => {
            this.calculateLocalBalance(groupId, userId);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setExpenseError(err.message || 'Failed to fetch user balance');
    }
  }

  private calculateLocalBalance(groupId: string, userId: string): void {
    this.localDB
      .getExpensesByGroupId$(groupId)
      .pipe(take(1))
      .subscribe({
        next: (expenses: Expense[]) => {
          let balance: number = 0;
          expenses.forEach((expense: Expense) => {
            if (expense.payer_id === userId) {
              const participantCount: number =
                expense.participants?.length || 0;
              const userShare: number = expense.amount / participantCount;
              balance += expense.amount - userShare;
            } else if (
              expense.participants?.some(
                (p: Participant) => p.user_id === userId,
              )
            ) {
              const participantCount: number =
                expense.participants?.length || 0;
              const userShare: number = expense.amount / participantCount;
              balance -= userShare;
            }
          });

          _userBalance.set(balance);
          this.toast.info('Balance calculated from cached data (offline mode)');
          setExpenseLoading(false);
        },
        error: () => {
          setExpenseError('Failed to calculate local balance');
          this.toast.error('Could not calculate balance');
          setExpenseLoading(false);
        },
      });
  }

  resetFetchCache(): void {
    clearFetchedGroups();
  }

  async refetchExpenses(groupId: string): Promise<void> {
    if (!groupId || groupId.trim() === '') {
      return;
    }

    removeFetchedGroup(groupId);
    await this.fetchExpenses(groupId);
  }

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
    if (!groupId || groupId.trim() === '') {
      return this._expenses;
    }

    const currentExpenses: Expense[] = this._expenses();
    if (currentExpenses.length === 0 && !this.fetchedGroups().has(groupId)) {
      setTimeout(() => {
        this.fetchExpenses(groupId);
      }, 0);
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
