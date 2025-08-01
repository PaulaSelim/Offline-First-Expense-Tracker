import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoginForm } from './login-form/login-form';
import { ROUTER_LINKS } from '../../../routes.model';
import { RegexPatterns } from '../../core/validators/regex.make';
import { LoginRequest } from '../../core/api/authApi/authApi.model';
import { CardShared } from '../../shared/card-shared/card-shared';
import { AuthFacade } from '../../service/auth/auth.facade';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoginForm,
    CardShared,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  readonly ROUTER_LINKS: typeof ROUTER_LINKS = ROUTER_LINKS;
  readonly AuthFacade: AuthFacade = inject(AuthFacade);
  readonly form: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.pattern(RegexPatterns.Password),
    ]),
  });

  isInvalid(controlName: string): boolean {
    const control: AbstractControl | null = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const { email, password }: LoginRequest = this.form.value;
      this.AuthFacade.login({
        email: email ?? '',
        password: password ?? '',
      });
    }
  }
}
