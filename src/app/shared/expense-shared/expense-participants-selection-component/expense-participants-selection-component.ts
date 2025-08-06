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
  GroupMember,
  GroupRole,
} from '../../../core/api/groupApi/groupApi.model';

@Component({
  selector: 'app-expense-participants-selection',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './expense-participants-selection-component.html',
  styleUrls: ['./expense-participants-selection-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseParticipantsSelectionComponent {
  form: InputSignal<FormGroup> = input.required();
  isInvalid: InputSignal<(controlName: string) => boolean> = input.required();
  groupMembers: InputSignal<GroupMember[]> = input.required();
  isParticipantSelected: InputSignal<(memberId: string) => boolean> =
    input.required();

  readonly GroupRole: typeof GroupRole = GroupRole;

  participantToggle: OutputEmitterRef<string> = output();
  selectAllParticipants: OutputEmitterRef<void> = output();
  clearAllParticipants: OutputEmitterRef<void> = output();

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
