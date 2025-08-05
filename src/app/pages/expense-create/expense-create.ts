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
import { CardShared } from '../../shared/card-shared/card-shared';
import { ExpenseCreateForm } from './expense-create-form/expense-create-form';
import { ExpenseFacade } from '../../service/expense/expense.facade';
import { GroupFacade } from '../../service/group/group.facade';
import { Group, GroupMember } from '../../core/api/groupApi/groupApi.model';
import { ExpenseRequest } from '../../core/api/expenseApi/expenseApi.model';
import { Category } from '../expense/expense.model';

@Component({
  selector: 'app-expense-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardShared, ExpenseCreateForm],
  templateUrl: './expense-create.html',
  styleUrls: ['./expense-create.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCreate implements OnInit {
  private readonly expenseFacade: ExpenseFacade = inject(ExpenseFacade);
  private readonly groupFacade: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly fb: FormBuilder = inject(FormBuilder);

  isSubmitting: WritableSignal<boolean> = signal(false);
  isLoading: WritableSignal<boolean> = signal(true);

  readonly selectedGroup: Signal<Group | null> =
    this.groupFacade.getSelectedGroup();
  readonly groupMembers: Signal<GroupMember[]> =
    this.groupFacade.getGroupMembers();

  private groupId: string = '';

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
    date: [new Date().toISOString().split('T')[0], [Validators.required]],
    is_payer_included: [true],
    participants_id: [[], [Validators.required, Validators.minLength(1)]],
  });

  readonly categories: Category[] = [
    { id: 'Food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'Transport', name: 'Transportation', icon: '🚗' },
    { id: 'Entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'Utilities', name: 'Utilities', icon: '💡' },
    { id: 'Healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'other', name: 'Other', icon: '📦' },
  ];

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
    if (this.groupId) {
      this.loadGroupData();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private loadGroupData(): void {
    this.isLoading.set(true);

    this.groupFacade.fetchGroupById(this.groupId);
    this.groupFacade.fetchGroupMembers(this.groupId);

    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  onSubmit(): void {
    if (this.expenseForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const formData: ExpenseRequest = {
        title: this.expenseForm.value.title.trim(),
        amount: parseFloat(this.expenseForm.value.amount),
        payer_id: this.expenseForm.value.payer_id,
        category: this.expenseForm.value.category,
        date: this.expenseForm.value.date,
        is_payer_included: this.expenseForm.value.is_payer_included,
        participants_id: this.expenseForm.value.participants_id,
      };

      this.expenseFacade.createExpense(this.groupId, formData);

      setTimeout(() => {
        this.isSubmitting.set(false);
        this.expenseForm.reset();
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
