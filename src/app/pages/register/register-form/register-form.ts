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
  selector: 'app-register-form',
  imports: [ReactiveFormsModule],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterForm {
  form: InputSignal<FormGroup> = input.required();
  isInvalid: InputSignal<(controlName: string) => boolean> = input.required();
  isPasswordMismatch: InputSignal<boolean> = input.required();
  submitForm: OutputEmitterRef<void> = output<void>();

  onSubmit(): void {
    this.submitForm.emit();
  }
}
