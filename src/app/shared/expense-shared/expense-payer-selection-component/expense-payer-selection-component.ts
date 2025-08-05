import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GroupMember } from '../../../core/api/groupApi/groupApi.model';

@Component({
  selector: 'app-expense-payer-selection',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './expense-payer-selection-component.html',
  styleUrls: ['./expense-payer-selection-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensePayerSelectionComponent {
  form: InputSignal<FormGroup> = input.required();
  isInvalid: InputSignal<(controlName: string) => boolean> = input.required();
  groupMembers: InputSignal<GroupMember[]> = input.required();
}
