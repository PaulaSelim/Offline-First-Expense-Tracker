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
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseEditForm } from './expense-edit-form/expense-edit-form';
import { CardShared } from '../../shared/card-shared/card-shared';
import { ExpenseFacade } from '../../service/expense/expense.facade';
import { GroupFacade } from '../../service/group/group.facade';
import { Group, GroupMember } from '../../core/api/groupApi/groupApi.model';
import {
  Expense,
  ExpenseUpdateRequest,
  Participant,
} from '../../core/api/expenseApi/expenseApi.model';
import { categories, Category } from '../expense/expense.model';

@Component({
  selector: 'app-expense-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardShared, ExpenseEditForm],
  templateUrl: './expense-edit.html',
  styleUrls: ['./expense-edit.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseEdit implements OnInit {
  private readonly expenseFacade: ExpenseFacade = inject(ExpenseFacade);
  private readonly groupFacade: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly fb: FormBuilder = inject(FormBuilder);

  isSubmitting: WritableSignal<boolean> = signal(false);
  isLoading: WritableSignal<boolean> = signal(true);

  readonly categories: Category[] = categories;

  readonly selectedGroup: Signal<Group | null> =
    this.groupFacade.getSelectedGroup();
  readonly groupMembers: Signal<GroupMember[]> =
    this.groupFacade.getGroupMembers();
  readonly selectedExpense: Signal<Expense | null> =
    this.expenseFacade.getSelectedExpense();

  private groupId: string = '';
  private expenseId: string = '';

  expenseForm: FormGroup = this.fb.group({
    title: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    amount: [
      '',
      [Validators.required, Validators.min(0.01), Validators.max(999999.99)],
    ],
    payer_id: ['', [Validators.required]],
    category: ['', [Validators.required]],
    date: ['', [Validators.required]],
    is_payer_included: [true, [Validators.required]],
    participants_id: [[], [Validators.required, Validators.minLength(1)]],
  });

  get titleControl(): AbstractControl | null {
    return this.expenseForm.get('title');
  }

  get amountControl(): AbstractControl | null {
    return this.expenseForm.get('amount');
  }

  get payerControl(): AbstractControl | null {
    return this.expenseForm.get('payer_id');
  }

  get categoryControl(): AbstractControl | null {
    return this.expenseForm.get('category');
  }

  get dateControl(): AbstractControl | null {
    return this.expenseForm.get('date');
  }

  get participantsControl(): AbstractControl | null {
    return this.expenseForm.get('participants_id');
  }

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

    this.groupFacade.fetchGroupById(this.groupId);
    this.groupFacade.fetchGroupMembers(this.groupId);

    this.expenseFacade.fetchExpenseById(this.groupId, this.expenseId);

    setTimeout(() => {
      this.populateForm();
      this.isLoading.set(false);
    }, 500);
  }

  private populateForm(): void {
    const expense: Expense | null = this.selectedExpense();

    if (expense) {
      const participantIds: string[] = expense.participants
        ? expense.participants.map((p: Participant) => p.user_id)
        : [];
      this.expenseForm.patchValue({
        title: expense.title,
        amount: expense.amount,
        payer_id: expense.payer?.id || '',
        category: expense.category,
        date: expense.date,
        is_payer_included: expense.is_payer_included,
        participants_id: participantIds,
      });
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const formData: ExpenseUpdateRequest = {
        title: this.expenseForm.value.title.trim(),
        amount: parseFloat(this.expenseForm.value.amount),
        payer_id: this.expenseForm.value.payer_id,
        category: this.expenseForm.value.category,
        date: this.expenseForm.value.date,
        is_payer_included: this.expenseForm.value.is_payer_included,
        participants_id: this.expenseForm.value.participants_id,
      };

      this.expenseFacade.updateExpense(this.groupId, this.expenseId, formData);

      setTimeout(() => {
        this.isSubmitting.set(false);
        this.router.navigate(['/groups', this.groupId, 'expenses']);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/groups', this.groupId, 'expenses']);
  }

  onParticipantToggle(memberId: string): void {
    const currentParticipants: string[] =
      this.expenseForm.value.participants_id || [];
    const isSelected: boolean = currentParticipants.includes(memberId);

    let newParticipants: string[];
    if (isSelected) {
      newParticipants = currentParticipants.filter(
        (id: string) => id !== memberId,
      );
    } else {
      newParticipants = [...currentParticipants, memberId];
    }

    this.expenseForm.patchValue({ participants_id: newParticipants });
  }

  onSelectAllParticipants(): void {
    const allMemberIds: string[] = this.groupMembers().map(
      (member: GroupMember) => member.id,
    );
    this.expenseForm.patchValue({ participants_id: allMemberIds });
  }

  onClearAllParticipants(): void {
    this.expenseForm.patchValue({ participants_id: [] });
  }

  isParticipantSelected(memberId: string): boolean {
    const participants: string[] = this.expenseForm.value.participants_id || [];
    return participants.includes(memberId);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.expenseForm.controls).forEach((key: string) => {
      const control: AbstractControl | null = this.expenseForm.get(key);
      control?.markAsTouched();
    });
  }

  readonly isInvalid: Signal<(controlName: string) => boolean> = signal(
    (controlName: string): boolean => {
      const control: AbstractControl | null = this.expenseForm.get(controlName);
      return !!control && control.invalid && (control.touched || control.dirty);
    },
  );
}
