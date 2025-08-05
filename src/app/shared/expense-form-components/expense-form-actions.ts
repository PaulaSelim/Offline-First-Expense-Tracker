import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-expense-form-actions',
  standalone: true,
  imports: [],
  template: `
    <div class="d-flex justify-content-between">
      <button
        type="button"
        class="btn btn-outline-secondary"
        (click)="cancel.emit()"
        [disabled]="isSubmitting()"
      >
        Cancel
      </button>
      <button
        type="submit"
        [class]="submitButtonClass()"
        [disabled]="form().invalid || isSubmitting()"
      >
        @if (isSubmitting()) {
          <span class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </span>
          {{ loadingText() }}
        } @else {
          {{ submitText() }}
        }
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseFormActions {
  readonly form: InputSignal<FormGroup> = input.required();
  readonly isSubmitting: InputSignal<boolean> = input.required();
  readonly submitText: InputSignal<string> = input.required();
  readonly loadingText: InputSignal<string> = input.required();
  readonly submitButtonClass: InputSignal<string> = input('btn btn-primary');
  
  readonly cancel: OutputEmitterRef<void> = output();
}