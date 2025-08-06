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
import { Category } from '../../expense/expense.model';
import { ExpenseTitleInputComponent } from '../../../shared/expense-shared/expense-title-input-component/expense-title-input-component';
import { ExpenseAmountDateInputComponent } from '../../../shared/expense-shared/expense-amount-date-input-component/expense-amount-date-input-component';
import { ExpenseCategorySelectionComponent } from '../../../shared/expense-shared/expense-category-selection-component/expense-category-selection-component';
import { ExpensePayerSelectionComponent } from '../../../shared/expense-shared/expense-payer-selection-component/expense-payer-selection-component';
import { ExpensePayerInclusionComponent } from '../../../shared/expense-shared/expense-payer-inclusion-component/expense-payer-inclusion-component';
import { ExpenseParticipantsSelectionComponent } from '../../../shared/expense-shared/expense-participants-selection-component/expense-participants-selection-component';
@Component({
  selector: 'app-expense-create-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ExpenseTitleInputComponent,
    ExpenseAmountDateInputComponent,
    ExpenseCategorySelectionComponent,
    ExpensePayerSelectionComponent,
    ExpensePayerInclusionComponent,
    ExpenseParticipantsSelectionComponent,
  ],
  templateUrl: './expense-create-form.html',
  styleUrls: ['./expense-create-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCreateForm {
  form: InputSignal<FormGroup> = input.required();
  isInvalid: InputSignal<(controlName: string) => boolean> = input.required();
  isSubmitting: InputSignal<boolean> = input.required();
  groupMembers: InputSignal<GroupMember[]> = input.required();
  categories: InputSignal<Category[]> = input.required();
  selectedGroup: InputSignal<Group | null> = input.required();
  isParticipantSelected: InputSignal<(memberId: string) => boolean> =
    input.required();

  submitForm: OutputEmitterRef<void> = output();
  cancelForm: OutputEmitterRef<void> = output();
  participantToggle: OutputEmitterRef<string> = output();
  selectAllParticipants: OutputEmitterRef<void> = output();
  clearAllParticipants: OutputEmitterRef<void> = output();

  readonly GroupRole: typeof GroupRole = GroupRole;

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
