import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Expense } from '../../core/api/expenseApi/expenseApi.model';
import { ExpenseFacade } from '../../service/expense/expense.facade';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [],
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Expenses implements OnInit {
  private readonly expenseProvider: ExpenseFacade = inject(ExpenseFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly isLoading: WritableSignal<boolean> = signal(true);
  readonly expenses: WritableSignal<Expense[]> = signal([]);

  private groupId: string = '';

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.loadExpenses();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private loadExpenses(): void {
    this.isLoading.set(true);
    this.expenseProvider.fetchExpenses(this.groupId);
    
    // Subscribe to expenses changes
    const expensesSignal = this.expenseProvider.getExpenses(this.groupId);
    this.expenses.set(expensesSignal());
    
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  onCreateExpense(): void {
    this.router.navigate(['/groups', this.groupId, 'expenses', 'create']);
  }

  onEditExpense(expenseId: string): void {
    this.router.navigate(['/groups', this.groupId, 'expenses', expenseId, 'edit']);
  }

  onDeleteExpense(expense: Expense): void {
    if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      this.expenseProvider.deleteExpense(this.groupId, expense.id);
    }
  }

  onBackToGroup(): void {
    this.router.navigate(['/groups', this.groupId]);
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getFormattedAmount(amount: number): string {
    return amount.toFixed(2);
  }
}