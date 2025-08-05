import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-include-payer-checkbox',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-group mb-3">
      <div class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          id="is_payer_included"
          formControlName="is_payer_included"
        />
        <label class="form-check-label text-white" for="is_payer_included">
          Include payer in expense split
        </label>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseIncludePayerCheckbox {
  readonly form: InputSignal<FormGroup> = input.required();
}