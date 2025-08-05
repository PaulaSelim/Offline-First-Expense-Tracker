import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Group,
  GroupMember,
  GroupRole,
} from '../../../core/api/groupApi/groupApi.model';
import { Expense } from '../../../core/api/expenseApi/expenseApi.model';
import { Category } from '../../expense/expense.model';

@Component({
  selector: 'app-expense-edit-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './expense-edit-form.html',
  styleUrl: './expense-edit-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseEditForm {
  form: InputSignal<FormGroup> = input.required();
  isInvalid: InputSignal<(controlName: string) => boolean> = input.required();
  isSubmitting: InputSignal<boolean> = input.required();
  groupMembers: InputSignal<GroupMember[]> = input.required();
  categories: InputSignal<Category[]> = input.required();
  selectedGroup: InputSignal<Group | null> = input.required();
  selectedExpense: InputSignal<Expense | null> = input.required();
  isParticipantSelected: InputSignal<(memberId: string) => boolean> =
    input.required();

  readonly GroupRole: typeof GroupRole = GroupRole;

  submitForm: OutputEmitterRef<void> = output();
  cancelForm: OutputEmitterRef<void> = output();
  participantToggle: OutputEmitterRef<string> = output();
  selectAllParticipants: OutputEmitterRef<void> = output();
  clearAllParticipants: OutputEmitterRef<void> = output();

  onSubmit(): void {
    this.submitForm.emit();
  }

  onCancel(): void {
    this.cancelForm.emit();
  }

  onParticipantToggle(memberId: string): void {
    this.participantToggle.emit(memberId);
  }

  onSelectAll(): void {
    this.selectAllParticipants.emit();
  }

  onClearAll(): void {
    this.clearAllParticipants.emit();
  }
}
