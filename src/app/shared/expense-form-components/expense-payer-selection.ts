import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GroupMember } from '../../core/api/groupApi/groupApi.model';

@Component({
  selector: 'app-expense-payer-selection',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-group mb-3">
      <label class="form-label text-white" for="payer">Who Paid? *</label>
      <select
        class="form-select"
        id="payer"
        formControlName="payer_id"
        [class.is-invalid]="isInvalid()('payer_id')"
      >
        <option value="">Select who paid for this expense</option>
        @for (member of members(); track member.id) {
          <option [value]="member.id">{{ member.username || member.email }}</option>
        }
      </select>
      @if (isInvalid()('payer_id')) {
        <div class="invalid-feedback">
          <strong>Please select who paid for this expense.</strong>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensePayerSelection {
  readonly form: InputSignal<FormGroup> = input.required();
  readonly isInvalid: InputSignal<(controlName: string) => boolean> = input.required();
  readonly members: InputSignal<GroupMember[]> = input.required();
}