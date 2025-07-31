import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
  Signal,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GroupFacade } from '../../service/group/group.facade';
import { Group, GroupRequest } from '../../core/api/groupApi/groupApi.model';

@Component({
  selector: 'app-group-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './group-edit.html',
  styleUrls: ['./group-edit.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupEdit implements OnInit {
  private readonly groupProvider: GroupFacade = inject(GroupFacade);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly fb: FormBuilder = inject(FormBuilder);

  readonly isSubmitting: WritableSignal<boolean> = signal(false);
  readonly isLoading: WritableSignal<boolean> = signal(true);
  readonly selectedGroup: Signal<Group | null> =
    this.groupProvider.getSelectedGroup();

  private groupId: string = '';

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

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.loadGroup();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private loadGroup(): void {
    this.isLoading.set(true);
    this.groupProvider.fetchGroupById(this.groupId);

    setTimeout(() => {
      const group: Group | null = this.selectedGroup();
      if (group) {
        this.groupForm.patchValue({
          name: group.name,
          description: group.description,
        });
        this.isLoading.set(false);
      }
    }, 500);
  }

  onSubmit(): void {
    if (this.groupForm.valid && !this.isSubmitting() && this.groupId) {
      this.isSubmitting.set(true);

      const formData: GroupRequest = {
        name: this.groupForm.value.name.trim(),
        description: this.groupForm.value.description?.trim() || '',
      };

      this.groupProvider.updateGroup(this.groupId, formData);

      setTimeout(() => {
        this.isSubmitting.set(false);
        this.router.navigate(['/groups', this.groupId]);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/groups', this.groupId]);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.groupForm.controls).forEach((key: string) => {
      const control: AbstractControl | null = this.groupForm.get(key);
      control?.markAsTouched();
    });
  }
}
