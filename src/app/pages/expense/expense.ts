import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from '../../core/api/expenseApi/expenseApi.model';
import { Group } from '../../core/api/groupApi/groupApi.model';
import { ExpenseFacade } from '../../service/expense/expense.facade';
import { GroupFacade } from '../../service/group/group.facade';
import { SyncStatusComponent } from '../../shared/sync-status/sync-status';
import { ExpenseHeader } from './expense-header/expense-header';
import { ExpenseList } from './expense-list/expense-list';
@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, ExpenseList, ExpenseHeader, SyncStatusComponent],
  templateUrl: './expense.html',
  styleUrls: ['./expense.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseComponent implements OnInit {
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

  onBackToGroup(): void {
    this.router.navigate(['/groups', this.groupId]);
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
