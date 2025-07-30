import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegexPatterns } from '../../core/validators/regex.make';
import { CardShared } from '../../shared/card-shared/card-shared';
import { RegisterForm } from './register-form/register-form';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RegisterForm,
    CardShared,
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private router: Router = inject(Router);
  form: FormGroup = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(RegexPatterns.Username),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.pattern(RegexPatterns.Password),
    ]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  onSubmit(): void {
    this.form.value.username = this.form.value.username.trim();
    this.form.value.email = this.form.value.email.trim();
    if (this.form.valid && !this.isPasswordMismatch()) {
      this.form.reset();
      this.router.navigate(['/login']);
    }
  }

  isPasswordMismatch(): boolean {
    return this.form.value.password !== this.form.value.confirmPassword;
  }

  readonly isInvalid: Signal<(controlName: string) => boolean> = signal(
    (controlName: string): boolean => {
      const control: AbstractControl | null = this.form.get(controlName);
      return !!control && control.invalid && (control.touched || control.dirty);
    },
  );
}
