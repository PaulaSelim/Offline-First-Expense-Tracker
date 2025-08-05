import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { GroupRequest } from '../../core/api/groupApi/groupApi.model';
import { GroupFacade } from '../../service/group/group.facade';
import { CardShared } from '../../shared/card-shared/card-shared';
import { GroupCreateForm } from './group-create-form/group-create-form';

@Component({
  selector: 'app-group-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardShared, GroupCreateForm],
  templateUrl: './group-create.html',
  styleUrls: ['./group-create.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCreate {
  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly fb: FormBuilder = inject(FormBuilder);

  isSubmitting: WritableSignal<boolean> = signal(false);

  groupForm: FormGroup = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    description: ['', [Validators.maxLength(255)]],
  });

  get nameControl(): AbstractControl | null {
    return this.groupForm.get('name');
  }

  get descriptionControl(): AbstractControl | null {
    return this.groupForm.get('description');
  }

  onSubmit(): void {
    if (this.groupForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const formData: GroupRequest = {
        name: this.groupForm.value.name.trim(),
        description: this.groupForm.value.description?.trim() || '',
      };

      this.groupProvider.createGroup(formData);

      this.isSubmitting.set(false);
      this.groupForm.reset();
      this.router.navigate(['/dashboard']);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.groupForm.controls).forEach((key: string) => {
      const control: AbstractControl | null = this.groupForm.get(key);
      control?.markAsTouched();
    });
  }

  readonly isInvalid: Signal<(controlName: string) => boolean> = signal(
    (controlName: string): boolean => {
      const control: AbstractControl | null = this.groupForm.get(controlName);
      return !!control && control.invalid && (control.touched || control.dirty);
    },
  );
}
