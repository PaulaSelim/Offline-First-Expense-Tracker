import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-amount-date-row',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label text-white" for="amount">Amount *</label>
        <div class="input-group">
          <span class="input-group-text">$</span>
          <input
            class="form-control"
            type="number"
            id="amount"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            formControlName="amount"
            [class.is-invalid]="isAmountInvalid()"
          />
        </div>
        @if (isAmountInvalid()) {
          <div class="invalid-feedback d-block">
            <strong>Amount is invalid:</strong>
            <ul>
              @if (form().get('amount')?.errors?.['required']) {
                <li>Amount is required.</li>
              }
              @if (form().get('amount')?.errors?.['min']) {
                <li>Amount must be greater than 0.</li>
              }
            </ul>
          </div>
        }
      </div>
      <div class="col-md-6">
        <label class="form-label text-white" for="date">Date *</label>
        <input
          class="form-control"
          type="date"
          id="date"
          formControlName="date"
          [class.is-invalid]="isDateInvalid()"
        />
        @if (isDateInvalid()) {
          <div class="invalid-feedback">
            <strong>Date is required.</strong>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseAmountDateRow {
  readonly form: InputSignal<FormGroup> = input.required();
  readonly isInvalid: InputSignal<(controlName: string) => boolean> = input.required();

  isAmountInvalid(): boolean {
    return this.isInvalid()('amount');
  }

  isDateInvalid(): boolean {
    return this.isInvalid()('date');
  }
}