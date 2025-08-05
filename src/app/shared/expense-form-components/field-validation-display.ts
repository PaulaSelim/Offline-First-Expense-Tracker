import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';

@Component({
  selector: 'app-field-validation-display',
  standalone: true,
  imports: [],
  template: `
    @if (showError()) {
      <div class="invalid-feedback" [class.d-block]="displayBlock()">
        @if (errorTitle()) {
          <strong>{{ errorTitle() }}:</strong>
        }
        <ul>
          @for (error of errors(); track error.key) {
            <li>{{ error.message }}</li>
          }
        </ul>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldValidationDisplay {
  readonly showError: InputSignal<boolean> = input.required();
  readonly errors: InputSignal<{key: string, message: string}[]> = input.required();
  readonly errorTitle: InputSignal<string> = input('');
  readonly displayBlock: InputSignal<boolean> = input(false);
}