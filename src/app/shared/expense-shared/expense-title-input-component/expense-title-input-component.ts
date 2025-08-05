import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-title-input',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './expense-title-input-component.html',
  styleUrls: ['./expense-title-input-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseTitleInputComponent {
  form: InputSignal<FormGroup> = input.required();
  isInvalid: InputSignal<(controlName: string) => boolean> = input.required();

  onBlur(): void {
    const control: AbstractControl | null = this.form().get('title');
    if (control) {
      control.markAsTouched();
    }
  }
}
