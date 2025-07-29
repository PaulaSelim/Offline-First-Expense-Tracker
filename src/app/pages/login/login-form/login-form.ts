import {
  Component,
  ChangeDetectionStrategy,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginForm {
  form: InputSignal<FormGroup> = input.required();
  isInvalid: InputSignal<(controlName: string) => boolean> = input.required();

  submitForm: OutputEmitterRef<void> = output();

  onSubmit(): void {
    this.submitForm.emit();
  }
}
