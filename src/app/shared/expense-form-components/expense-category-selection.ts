import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-category-selection',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-group mb-3">
      <label class="form-label text-white">Category *</label>
      <div class="row">
        @for (category of categories(); track category) {
          <div class="col-md-4 col-sm-6 mb-2">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                [id]="'category-' + category"
                [value]="category"
                formControlName="category"
              />
              <label class="form-check-label text-white" [for]="'category-' + category">
                {{ category }}
              </label>
            </div>
          </div>
        }
      </div>
      @if (isInvalid()('category')) {
        <div class="invalid-feedback d-block">
          <strong>Please select a category.</strong>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCategorySelection {
  readonly form: InputSignal<FormGroup> = input.required();
  readonly isInvalid: InputSignal<(controlName: string) => boolean> = input.required();
  readonly categories: InputSignal<string[]> = input.required();
}