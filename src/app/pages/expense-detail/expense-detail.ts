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
import { CommonModule } from '@angular/common';
import { ExpenseFacade } from '../../service/expense/expense.facade';
import { GroupFacade } from '../../service/group/group.facade';
import { GroupRole } from '../../core/api/groupApi/groupApi.model';
import { Expense } from '../../core/api/expenseApi/expenseApi.model';
import { ExpenseDetailParticipants } from './expense-detail-participants/expense-detail-participants';
import { ExpenseDetailHeader } from './expense-detail-header/expense-detail-header';
@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [CommonModule, ExpenseDetailParticipants, ExpenseDetailHeader],
  templateUrl: './expense-detail.html',
  styleUrls: ['./expense-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseDetail implements OnInit {
  private readonly expenseFacade: ExpenseFacade = inject(ExpenseFacade);
  private readonly groupFacade: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  readonly GroupRole: typeof GroupRole = GroupRole;

  readonly isLoading: WritableSignal<boolean> = signal(true);
  readonly selectedExpense: Signal<Expense | null> =
    this.expenseFacade.getSelectedExpense();

  private groupId: string = '';
  private expenseId: string = '';

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    this.expenseId = this.route.snapshot.paramMap.get('expenseId') || '';

    if (this.groupId && this.expenseId) {
      this.loadExpenseData();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private loadExpenseData(): void {
    this.isLoading.set(true);

    this.groupFacade.fetchGroupById(this.groupId);
    this.groupFacade.fetchGroupMembers(this.groupId);

    this.expenseFacade.fetchExpenseById(this.groupId, this.expenseId);

    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  onBackToExpenses(): void {
    this.router.navigate(['/groups', this.groupId, 'expenses']);
  }
}
