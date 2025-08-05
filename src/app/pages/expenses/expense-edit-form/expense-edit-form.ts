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
import { Expense, ExpenseRequest } from '../../../core/api/expenseApi/expenseApi.model';
import { GroupMember } from '../../../core/api/groupApi/groupApi.model';
// Import reusable components
import { ExpenseAmountDateRow } from '../../../shared/expense-form-components/expense-amount-date-row';
import { ExpenseCategorySelection } from '../../../shared/expense-form-components/expense-category-selection';
import { ExpenseParticipantSelection } from '../../../shared/expense-form-components/expense-participant-selection';
import { ExpenseFormActions } from '../../../shared/expense-form-components/expense-form-actions';

@Component({
  selector: 'app-expense-edit-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ExpenseAmountDateRow,
    ExpenseCategorySelection,
    ExpenseParticipantSelection,
    ExpenseFormActions,
  ],
  templateUrl: './expense-edit-form.html',
  styleUrls: ['./expense-edit-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseEditForm implements OnInit {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly expenseProvider: ExpenseFacade = inject(ExpenseFacade);
  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  readonly isSubmitting: WritableSignal<boolean> = signal(false);
  readonly isLoading: WritableSignal<boolean> = signal(true);
  readonly groupMembers: WritableSignal<GroupMember[]> = signal([]);
  readonly currentExpense: WritableSignal<Expense | null> = signal(null);
  
  private groupId: string = '';
  private expenseId: string = '';

  readonly expenseForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString().split('T')[0], [Validators.required]],
    category: ['', [Validators.required]],
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
    this.expenseId = this.route.snapshot.paramMap.get('expenseId') || '';
    
    if (this.groupId && this.expenseId) {
      this.loadData();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private loadData(): void {
    this.isLoading.set(true);
    
    // Load group members
    this.groupProvider.fetchGroupMembers(this.groupId);
    const members = this.groupProvider.getGroupMembers();
    this.groupMembers.set(members());

    // Load expense data (in a real app, you'd have a method to fetch a single expense)
    // For now, we'll use mock data based on the expense ID
    this.loadExpenseData();
    
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  private loadExpenseData(): void {
    // In a real implementation, you would fetch the expense by ID
    // For now, we'll create mock data
    const mockExpense: Expense = {
      id: this.expenseId,
      group_id: this.groupId,
      title: 'Sample Expense',
      amount: 50.00,
      payer_id: 'user1',
      category: 'Food & Dining',
      date: '2024-01-01',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      participants: [
        { user_id: 'user1', email: 'user1@example.com' },
        { user_id: 'user2', email: 'user2@example.com' }
      ]
    };

    this.currentExpense.set(mockExpense);
    this.populateForm(mockExpense);
  }

  private populateForm(expense: Expense): void {
    this.expenseForm.patchValue({
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      category: expense.category
    });

    // Set participants
    if (expense.participants) {
      const participantIds = expense.participants.map(p => p.user_id);
      this.expenseForm.get('participants')?.setValue(participantIds);
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      const formValue = this.expenseForm.value;
      const selectedParticipants = this.getSelectedParticipants();
      const currentExpense = this.currentExpense();
      
      if (!currentExpense) {
        this.router.navigate(['/groups', this.groupId, 'expenses']);
        return;
      }
      
      // Use ExpenseRequest format as expected by the facade
      const updateRequest: ExpenseRequest = {
        title: formValue.title,
        amount: parseFloat(formValue.amount),
        payer_id: currentExpense.payer_id, // Keep original payer
        category_id: formValue.category,
        date: formValue.date,
        is_payer_included: true, // Assume true for edit
        participants_id: selectedParticipants
      };

      this.expenseProvider.updateExpense(this.groupId, this.expenseId, updateRequest);
      
      // Navigate back after update
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