import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseFacade } from '../../../service/expense/expense.facade';
import { GroupFacade } from '../../../service/group/group.facade';
import { ExpenseRequest } from '../../../core/api/expenseApi/expenseApi.model';
import { GroupMember } from '../../../core/api/groupApi/groupApi.model';
// Import reusable components
import { ExpenseAmountDateRow } from '../../../shared/expense-form-components/expense-amount-date-row';
import { ExpenseCategorySelection } from '../../../shared/expense-form-components/expense-category-selection';
import { ExpensePayerSelection } from '../../../shared/expense-form-components/expense-payer-selection';
import { ExpenseParticipantSelection } from '../../../shared/expense-form-components/expense-participant-selection';
import { ExpenseFormActions } from '../../../shared/expense-form-components/expense-form-actions';
import { ExpenseIncludePayerCheckbox } from '../../../shared/expense-form-components/expense-include-payer-checkbox';

@Component({
  selector: 'app-expense-create-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ExpenseAmountDateRow,
    ExpenseCategorySelection,
    ExpensePayerSelection,
    ExpenseParticipantSelection,
    ExpenseFormActions,
    ExpenseIncludePayerCheckbox,
  ],
  templateUrl: './expense-create-form.html',
  styleUrls: ['./expense-create-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCreateForm implements OnInit {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly expenseProvider: ExpenseFacade = inject(ExpenseFacade);
  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly isSubmitting: WritableSignal<boolean> = signal(false);
  readonly groupMembers: WritableSignal<GroupMember[]> = signal([]);
  
  private groupId: string = '';

  readonly expenseForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString().split('T')[0], [Validators.required]],
    category: ['', [Validators.required]],
    payer_id: ['', [Validators.required]],
    is_payer_included: [true],
    participants: this.fb.array([])
  });

  readonly categories = [
    'Food & Dining',
    'Entertainment',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Health & Medical',
    'Travel',
    'Education',
    'Other'
  ];

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.loadGroupMembers();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private loadGroupMembers(): void {
    this.groupProvider.fetchGroupMembers(this.groupId);
    // Subscribe to group members changes
    const members = this.groupProvider.getGroupMembers();
    this.groupMembers.set(members());
  }

  onSubmit(): void {
    if (this.expenseForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      const formValue = this.expenseForm.value;
      const selectedParticipants = this.getSelectedParticipants();
      
      const expenseRequest: ExpenseRequest = {
        title: formValue.title,
        amount: parseFloat(formValue.amount),
        payer_id: formValue.payer_id,
        category_id: formValue.category,
        date: formValue.date,
        is_payer_included: formValue.is_payer_included,
        participants_id: selectedParticipants
      };

      this.expenseProvider.createExpense(this.groupId, expenseRequest);
      
      // Navigate back after creation
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.router.navigate(['/groups', this.groupId, 'expenses']);
      }, 1000);
    }
  }

  onCancel(): void {
    this.router.navigate(['/groups', this.groupId, 'expenses']);
  }

  onSelectAllParticipants(): void {
    const members = this.groupMembers();
    members.forEach(member => {
      this.toggleParticipant(member.id, true);
    });
  }

  onClearAllParticipants(): void {
    const members = this.groupMembers();
    members.forEach(member => {
      this.toggleParticipant(member.id, false);
    });
  }

  onToggleParticipant(event: {id: string, selected: boolean}): void {
    this.toggleParticipant(event.id, event.selected);
  }

  toggleParticipant(memberId: string, selected: boolean): void {
    // Toggle participant selection logic
    const control = this.expenseForm.get('participants');
    if (control) {
      let participants = control.value || [];
      if (selected) {
        if (!participants.includes(memberId)) {
          participants.push(memberId);
        }
      } else {
        participants = participants.filter((id: string) => id !== memberId);
      }
      control.setValue(participants);
    }
  }

  isParticipantSelected(memberId: string): boolean {
    const participants = this.expenseForm.get('participants')?.value || [];
    return participants.includes(memberId);
  }

  private getSelectedParticipants(): string[] {
    return this.expenseForm.get('participants')?.value || [];
  }

  isInvalid(controlName: string): boolean {
    const control = this.expenseForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}