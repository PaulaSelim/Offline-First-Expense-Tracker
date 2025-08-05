import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ExpenseFacade } from '../../../service/expense/expense.facade';
import { GroupFacade } from '../../../service/group/group.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from '../../../core/api/expenseApi/expenseApi.model';
import { Group } from '../../../core/api/groupApi/groupApi.model';
import { CategoryIconPipe } from '../../../shared/category-icon/category-icon-pipe';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CategoryIconPipe],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseList implements OnInit {
  private readonly expenseFacade: ExpenseFacade = inject(ExpenseFacade);
  private readonly groupFacade: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly isLoading: WritableSignal<boolean> = signal(true);
  readonly expenses: Signal<Expense[]> = this.expenseFacade.getExpenses('');
  readonly selectedGroup: Signal<Group | null> =
    this.groupFacade.getSelectedGroup();
  readonly isLoadingExpenses: Signal<boolean> = this.expenseFacade.isLoading();
  readonly expenseError: Signal<string | null> = this.expenseFacade.getError();

  private groupId: string = '';

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.loadExpenseData();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private loadExpenseData(): void {
    this.isLoading.set(true);

    this.groupFacade.fetchGroupById(this.groupId);

    this.expenseFacade.fetchExpenses(this.groupId);

    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  onAddExpense(): void {
    this.router.navigate(['/groups', this.groupId, 'expenses', 'add']);
  }

  onEditExpense(expenseId: string): void {
    this.router.navigate([
      '/groups',
      this.groupId,
      'expenses',
      expenseId,
      'edit',
    ]);
  }

  onViewExpenseDetail(expenseId: string): void {
    this.router.navigate(['/groups', this.groupId, 'expenses', expenseId]);
  }

  onDeleteExpense(expense: Expense): void {
    if (
      confirm(
        `Are you sure you want to delete the expense "${expense.title}"? This action cannot be undone.`,
      )
    ) {
      this.expenseFacade.deleteExpense(this.groupId, expense.id);
    }
  }

  onBackToGroup(): void {
    this.router.navigate(['/groups', this.groupId]);
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getFormattedAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  getTotalAmount(): number {
    return this.expenses().reduce(
      (total: number, expense: Expense) => total + expense.amount,
      0,
    );
  }

  getExpenseCount(): number {
    return this.expenses().length;
  }
}
