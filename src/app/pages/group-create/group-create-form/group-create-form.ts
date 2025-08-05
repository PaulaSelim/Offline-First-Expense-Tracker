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
  selector: 'app-group-create-form',
  imports: [ReactiveFormsModule],
  templateUrl: './group-create-form.html',
  styleUrl: './group-create-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCreateForm {
  form: InputSignal<FormGroup> = input.required();
  isInvalid: InputSignal<(controlName: string) => boolean> = input.required();
  isSubmitting: InputSignal<boolean> = input.required();
  submitForm: OutputEmitterRef<void> = output();
  cancelForm: OutputEmitterRef<void> = output();

  onSubmit(): void {
    this.submitForm.emit();
  }

  onCancel(): void {
    this.cancelForm.emit();
  }
}
