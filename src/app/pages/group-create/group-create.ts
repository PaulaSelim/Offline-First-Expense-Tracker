import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GroupFacade } from '../../service/group/group.facade';
import { GroupRequest } from '../../core/api/groupApi/groupApi.model';

@Component({
  selector: 'app-group-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './group-create.html',
  styleUrls: ['./group-create.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCreate {
  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly fb: FormBuilder = inject(FormBuilder);

  readonly isSubmitting: WritableSignal<boolean> = signal(false);

  readonly groupForm: FormGroup = this.fb.group({
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

      setTimeout(() => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      }, 1000);
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
}
