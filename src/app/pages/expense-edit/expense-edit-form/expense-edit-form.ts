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
import { ExpenseTitleInputComponent } from '../../../shared/expense-shared/expense-title-input-component/expense-title-input-component';
import { ExpenseAmountDateInputComponent } from '../../../shared/expense-shared/expense-amount-date-input-component/expense-amount-date-input-component';
import { ExpenseCategorySelectionComponent } from '../../../shared/expense-shared/expense-category-selection-component/expense-category-selection-component';
import { ExpensePayerSelectionComponent } from '../../../shared/expense-shared/expense-payer-selection-component/expense-payer-selection-component';
import { ExpenseParticipantsSelectionComponent } from '../../../shared/expense-shared/expense-participants-selection-component/expense-participants-selection-component';
import { ExpensePayerInclusionComponent } from '../../../shared/expense-shared/expense-payer-inclusion-component/expense-payer-inclusion-component';
@Component({
  selector: 'app-expense-edit-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ExpenseTitleInputComponent,
    ExpenseAmountDateInputComponent,
    ExpenseCategorySelectionComponent,
    ExpensePayerSelectionComponent,
    ExpenseParticipantsSelectionComponent,
    ExpensePayerInclusionComponent,
  ],
  templateUrl: './expense-edit-form.html',
  styleUrls: ['./expense-edit-form.scss'],
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
    if (this.form().valid) {
      this.submitForm.emit();
    } else {
      this.form().markAllAsTouched();
    }
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
