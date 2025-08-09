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
import {
  fetchedGroups,
  addFetchedGroup,
} from '../../core/state-management/group.state';
import { SyncFacade } from '../sync/sync.facade';
import { AuthFacade } from '../auth/auth.facade';

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

  readonly isOnline: () => Promise<boolean> = async () => {
    return this.syncFacade.isBackendAlive();
  };

  async fetchExpenses(groupId: string): Promise<void> {
    this.checkInput(groupId);
    setExpenseLoading(true);
    setExpenseError(null);

    try {
      let localExpenses: Expense[] = [];
      try {
        localExpenses = await this.getLocalExpensesByGroupId(groupId);
      } catch (error: unknown) {
        this.handleExpenseError(error, 'Failed to load local expenses');
      }
      setExpenses(localExpenses);
      setExpenseLoading(false);

      if (!(await this.isOnline())) {
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

            serverExpenses.forEach((expense: Expense) => {
              try {
                this.localDB
                  .addOrUpdateExpense$(expense)
                  .pipe(take(1))
                  .subscribe();
              } catch (error: unknown) {
                this.handleExpenseError(error, 'Failed to sync expenses');
              }
            });

            setExpenses(serverExpenses);
            setExpensePagination(res.data.pagination);
            setExpenseLoading(false);
            addFetchedGroup(groupId);
          },
          error: () => {
            this.toast.info('Using cached expenses (offline mode)');
            setExpenseLoading(false);
          },
        });
    } catch (error) {
      this.handleExpenseError(error, 'Failed to load expenses');
    }
  }

  async fetchExpenseById(groupId: string, expenseId: string): Promise<void> {
    this.checkInput(groupId);
    this.checkInput(expenseId);

    setExpenseLoading(true);
    setExpenseError(null);

    try {
      const localExpense: Expense | null = await this.getLocalExpensesByGroupId(
        groupId,
      ).then(
        (expenses: Expense[]) =>
          expenses.find((expense: Expense) => expense.id === expenseId) || null,
      );

      if (localExpense) {
        setSelectedExpense(localExpense);
      }

      if (!(await this.isOnline())) {
        this.toast.info('Using cached expense (offline mode)');
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
            this.toast.info('Using cached expense (offline mode)');
            setExpenseLoading(false);
          },
        });
    } catch (error: unknown) {
      this.handleExpenseError(error, 'Failed to load expense');
    }
  }

  async createExpense(groupId: string, data: ExpenseRequest): Promise<void> {
    this.checkInput(groupId);
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
      ...data,
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

    setSelectedExpense(localExpense);
    this.localDB
      .addOrUpdateExpense$(localExpense)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toast.success('Expense created locally!');
          this.fetchExpenses(groupId);
        },
        error: () => {
          this.toast.error('Failed to create expense locally');
          setExpenseLoading(false);
        },
      });

    if (!(await this.isOnline())) {
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
                  this.fetchExpenses(groupId);
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
  }

  async updateExpense(
    groupId: string,
    expenseId: string,
    data: ExpenseUpdateRequest,
  ): Promise<void> {
    this.checkInput(groupId);
    this.checkInput(expenseId);
    setExpenseLoading(true);
    setExpenseError(null);

    try {
      const localExpenses: Expense[] =
        await this.getLocalExpensesByGroupId(groupId);

      const currentExpense: Expense | null =
        localExpenses.find((expense: Expense) => expense.id === expenseId) ||
        null;

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
          next: async () => {
            setSelectedExpense(updatedExpense);
            this.fetchExpenses(groupId);
            this.toast.success('Expense updated locally!');

            if (!(await this.isOnline())) {
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
                      this.fetchExpenses(groupId);
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
          },
          error: () => {
            this.toast.error('Failed to update expense locally');
            setExpenseLoading(false);
          },
        });
    } catch (error) {
      this.handleExpenseError(error, 'Failed to update expense');
    }
  }

  async deleteExpense(groupId: string, expenseId: string): Promise<void> {
    setExpenseLoading(true);
    setExpenseError(null);

    try {
      this.localDB
        .removeExpenseById$(expenseId)
        .pipe(take(1))
        .subscribe({
          next: async () => {
            setSelectedExpense(null);
            this.fetchExpenses(groupId);
            this.toast.success('Expense deleted locally!');

            if (!(await this.isOnline())) {
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
          },
          error: () => {
            this.toast.error('Failed to delete expense locally');
            setExpenseLoading(false);
          },
        });
    } catch (error) {
      this.handleExpenseError(error, 'Failed to delete expense');
    }
  }

  async fetchUserBalance(groupId: string, userId: string): Promise<void> {
    setExpenseLoading(true);
    setExpenseError(null);

    try {
      if (!(await this.isOnline())) {
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

  checkInput(input: string): void {
    if (!input || input.trim() === '') {
      setExpenseError('Invalid input');
      this.toast.error('Invalid input');
    }
  }
  handleExpenseError(error: unknown, defaultMessage: string): void {
    const err: Error = error as Error;
    setExpenseError(err.message || defaultMessage);
    this.toast.error(err.message || defaultMessage);
    this.setLoading(false);
  }

  getLocalExpensesByGroupId(groupId: string): Promise<Expense[]> {
    return new Promise<Expense[]>(
      (
        resolve: (value: Expense[]) => void,
        reject: (reason?: unknown) => void,
      ) => {
        this.localDB
          .getExpensesByGroupId$(groupId)
          .pipe(take(1))
          .subscribe({
            next: (expenses: Expense[]) => resolve(expenses),
            error: () =>
              reject(new Error('Failed to fetch local expenses for group')),
            complete: () => resolve([]),
          });
      },
    );
  }
}
