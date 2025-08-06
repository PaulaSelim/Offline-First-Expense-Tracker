import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  signal,
  WritableSignal,
  OnInit,
} from '@angular/core';
import { ExpenseFacade } from '../../../service/expense/expense.facade';
import { GroupFacade } from '../../../service/group/group.facade';
import { AuthFacade } from '../../../service/auth/auth.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { Group, GroupRole } from '../../../core/api/groupApi/groupApi.model';
import {
  Expense,
  Participant,
} from '../../../core/api/expenseApi/expenseApi.model';
import { CategoryIconPipe } from '../../../shared/category-icon/category-icon-pipe';
@Component({
  selector: 'app-expense-detail-header',
  imports: [CategoryIconPipe],
  templateUrl: './expense-detail-header.html',
  styleUrl: './expense-detail-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseDetailHeader implements OnInit {
  private readonly expenseFacade: ExpenseFacade = inject(ExpenseFacade);
  private readonly groupFacade: GroupFacade = inject(GroupFacade);
  private readonly authFacade: AuthFacade = inject(AuthFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  readonly GroupRole: typeof GroupRole = GroupRole;

  readonly isLoading: WritableSignal<boolean> = signal(true);
  readonly selectedExpense: Signal<Expense | null> =
    this.expenseFacade.getSelectedExpense();
  readonly selectedGroup: Signal<Group | null> =
    this.groupFacade.getSelectedGroup();
  readonly expenseParticipants: Signal<Participant[]> =
    this.expenseFacade.getExpenseParticipants();

  private groupId: string = '';
  private expenseId: string = '';

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    this.expenseId = this.route.snapshot.paramMap.get('expenseId') || '';
    if (!this.groupId || !this.expenseId) {
      this.router.navigate(['/dashboard']);
    }
  }

  onEditExpense(): void {
    this.router.navigate([
      '/groups',
      this.groupId,
      'expenses',
      this.expenseId,
      'edit',
    ]);
  }

  onDeleteExpense(): void {
    const expense: Expense | null = this.selectedExpense();
    if (
      expense &&
      confirm(
        `Are you sure you want to delete the expense "${expense.title}"? This action cannot be undone.`,
      )
    ) {
      this.expenseFacade.deleteExpense(this.groupId, this.expenseId);
      this.router.navigate(['/groups', this.groupId, 'expenses']);
    }
  }

  onBackToExpenses(): void {
    this.router.navigate(['/groups', this.groupId, 'expenses']);
  }

  isCurrentUserAdmin(): boolean {
    const group: Group | null = this.selectedGroup();
    return group?.user_role === GroupRole.ADMIN;
  }

  isCurrentUserPayer(): boolean {
    const expense: Expense | null = this.selectedExpense();
    return expense?.payer?.id === this.authFacade.getCurrentUserId()();
  }

  canEditExpense(): boolean {
    return this.isCurrentUserAdmin() || this.isCurrentUserPayer();
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

  calculateSplitAmount(): number {
    const expense: Expense | null = this.selectedExpense();
    const participants: Participant[] = this.expenseParticipants();

    if (!expense || !participants?.length) return 0;

    return expense.amount / participants.length;
  }

  getTotalParticipants(): number {
    return this.expenseParticipants()?.length || 0;
  }
}
