import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-title-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-group mb-3">
      <label class="form-label text-white" for="title">Expense Title *</label>
      <input
        class="form-control"
        type="text"
        id="title"
        placeholder="Enter expense title"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [class.is-invalid]="showError()"
      />
      @if (showError()) {
        <div class="invalid-feedback">
          <strong>Title is invalid:</strong>
          <ul>
            @if (errors()?.['required']) {
              <li>Title is required.</li>
            }
            @if (errors()?.['minlength']) {
              <li>Title must be at least 3 characters long.</li>
            }
            @if (errors()?.['maxlength']) {
              <li>Title cannot exceed 100 characters.</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ExpenseTitleInput),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseTitleInput implements ControlValueAccessor {
  readonly errors: InputSignal<any> = input();
  readonly showError: InputSignal<boolean> = input(false);

  value: string = '';
  onChange = (value: string) => {};
  onTouched = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}