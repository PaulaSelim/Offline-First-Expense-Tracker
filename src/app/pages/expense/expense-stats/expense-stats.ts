import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { ExpenseFacade } from '../../../service/expense/expense.facade';
import { Expense } from '../../../core/api/expenseApi/expenseApi.model';

@Component({
  selector: 'app-expense-stats',
  imports: [],
  standalone: true,
  templateUrl: './expense-stats.html',
  styleUrl: './expense-stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseStats {
  private readonly expenseFacade: ExpenseFacade = inject(ExpenseFacade);

  readonly expenses: Signal<Expense[]> = this.expenseFacade.getExpenses('');

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
