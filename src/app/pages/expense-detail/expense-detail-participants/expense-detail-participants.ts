import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { ExpenseFacade } from '../../../service/expense/expense.facade';
import { GroupFacade } from '../../../service/group/group.facade';
import {
  GroupMember,
  GroupRole,
} from '../../../core/api/groupApi/groupApi.model';
import {
  Expense,
  Participant,
} from '../../../core/api/expenseApi/expenseApi.model';

@Component({
  selector: 'app-expense-detail-participants',
  standalone: true,
  imports: [],
  templateUrl: './expense-detail-participants.html',
  styleUrl: './expense-detail-participants.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseDetailParticipants {
  private readonly expenseFacade: ExpenseFacade = inject(ExpenseFacade);
  private readonly groupFacade: GroupFacade = inject(GroupFacade);
  readonly GroupRole: typeof GroupRole = GroupRole;

  readonly selectedExpense: Signal<Expense | null> =
    this.expenseFacade.getSelectedExpense();

  readonly groupMembers: Signal<GroupMember[]> =
    this.groupFacade.getGroupMembers();
  readonly expenseParticipants: Signal<Participant[]> =
    this.expenseFacade.getExpenseParticipants();
  readonly isLoadingParticipants: Signal<boolean> =
    this.expenseFacade.isLoading();

  getFormattedAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  getParticipantName(participantId: string): string {
    const participant: GroupMember | undefined = this.groupMembers().find(
      (member: GroupMember) => member.id === participantId,
    );
    return participant?.username || participant?.email || 'Unknown';
  }

  calculateSplitAmount(): number {
    const expense: Expense | null = this.selectedExpense();
    const participants: Participant[] = this.expenseParticipants();

    if (!expense || !participants?.length) return 0;

    return expense.amount / participants.length;
  }
}
