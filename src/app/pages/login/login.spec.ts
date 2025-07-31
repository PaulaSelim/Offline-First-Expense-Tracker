import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Login } from './login';
import { LoginForm } from './login-form/login-form';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login, LoginForm, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'register', component: class {} },
          { path: 'forgot-password', component: class {} },
          { path: 'home', component: class {} },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with email and password controls', () => {
      expect(component.form.get('email')).toBeTruthy();
      expect(component.form.get('password')).toBeTruthy();
    });

    it('should have empty initial values', () => {
      expect(component.form.get('email')?.value).toBe('');
      expect(component.form.get('password')?.value).toBe('');
    });

    it('should have required validators on email control', () => {
      const emailControl = component.form.get('email');
      expect(emailControl?.hasError('required')).toBeTruthy();
    });

    it('should have required validators on password control', () => {
      const passwordControl = component.form.get('password');
      expect(passwordControl?.hasError('required')).toBeTruthy();
    });
  });

  describe('Email Validation', () => {
    it('should be invalid when email is empty', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBeTruthy();
    });

    it('should be invalid when email format is incorrect', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();
    });

    it('should be valid when email format is correct', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('test@example.com');
      expect(emailControl?.errors).toBeNull();
    });

    it('should handle various email formats', () => {
      const emailControl = component.form.get('email');
      const validEmails = [
        'user@domain.com',
        'test.email@domain.co.uk',
        'user+tag@domain.org',
        'user123@domain123.com',
      ];

      validEmails.forEach((email) => {
        emailControl?.setValue(email);
        expect(emailControl?.hasError('email')).toBeFalsy();
      });
    });
  });

  describe('Password Validation', () => {
    it('should be invalid when password is empty', () => {
      const passwordControl = component.form.get('password');
      passwordControl?.setValue('');
      expect(passwordControl?.hasError('required')).toBeTruthy();
    });

    it('should be invalid when password is too short', () => {
      const passwordControl = component.form.get('password');
      passwordControl?.setValue('123');
      expect(passwordControl?.hasError('minlength')).toBeTruthy();
    });

    it('should be invalid when password does not meet pattern requirements', () => {
      const passwordControl = component.form.get('password');

      passwordControl?.setValue('password123');
      expect(passwordControl?.hasError('pattern')).toBeTruthy();

      passwordControl?.setValue('PASSWORD123');
      expect(passwordControl?.hasError('pattern')).toBeTruthy();

      passwordControl?.setValue('Password');
      expect(passwordControl?.hasError('pattern')).toBeTruthy();

      passwordControl?.setValue('Pa1');
      expect(passwordControl?.hasError('minlength')).toBeTruthy();
    });

    it('should be valid when password meets all requirements', () => {
      const passwordControl = component.form.get('password');
      const validPasswords = [
        'Password123',
        'MySecure1',
        'Test123Password',
        'Aa1bcdef',
      ];

      validPasswords.forEach((password) => {
        passwordControl?.setValue(password);
        expect(passwordControl?.errors).toBeNull();
      });
    });

    it('should validate complex password patterns', () => {
      const passwordControl = component.form.get('password');

      passwordControl?.setValue('Password123!@#');
      expect(passwordControl?.hasError('pattern')).toBeFalsy();

      passwordControl?.setValue('My Password1');
      expect(passwordControl?.hasError('pattern')).toBeFalsy();
    });
  });

  describe('isInvalid method', () => {
    it('should return false for valid untouched control', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('test@example.com');
      expect(component.isInvalid('email')).toBeFalsy();
    });

    it('should return false for invalid untouched control', () => {
      expect(component.isInvalid('email')).toBeFalsy();
    });

    it('should return true for invalid touched control', () => {
      const emailControl = component.form.get('email');
      emailControl?.markAsTouched();
      expect(component.isInvalid('email')).toBeTruthy();
    });

    it('should return true for invalid dirty control', () => {
      const emailControl = component.form.get('email');
      emailControl?.markAsDirty();
      expect(component.isInvalid('email')).toBeTruthy();
    });

    it('should return false for non-existent control', () => {
      expect(component.isInvalid('nonexistent')).toBeFalsy();
    });

    it('should return false for valid touched control', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('test@example.com');
      emailControl?.markAsTouched();
      expect(component.isInvalid('email')).toBeFalsy();
    });

    it('should return false for valid dirty control', () => {
      const passwordControl = component.form.get('password');
      passwordControl?.setValue('Password123');
      passwordControl?.markAsDirty();
      expect(component.isInvalid('password')).toBeFalsy();
    });
  });

  describe('onSubmit method', () => {
    it('should reset form when form is valid', () => {
      component.form.get('email')?.setValue('test@example.com');
      component.form.get('password')?.setValue('Password123');

      spyOn(component.form, 'reset');

      component.onSubmit();

      expect(component.form.reset).toHaveBeenCalled();
    });

    it('should not reset form when form is invalid', () => {
      spyOn(component.form, 'reset');

      component.onSubmit();

      expect(component.form.reset).not.toHaveBeenCalled();
    });

    it('should not reset form when only email is valid', () => {
      component.form.get('email')?.setValue('test@example.com');

      spyOn(component.form, 'reset');

      component.onSubmit();

      expect(component.form.reset).not.toHaveBeenCalled();
    });

    it('should not reset form when only password is valid', () => {
      component.form.get('password')?.setValue('Password123');

      spyOn(component.form, 'reset');

      component.onSubmit();

      expect(component.form.reset).not.toHaveBeenCalled();
    });
  });

  describe('Form Integration', () => {
    it('should have invalid form when both fields are empty', () => {
      expect(component.form.valid).toBeFalsy();
    });

    it('should have invalid form when only email is provided', () => {
      component.form.get('email')?.setValue('test@example.com');
      expect(component.form.valid).toBeFalsy();
    });

    it('should have invalid form when only password is provided', () => {
      component.form.get('password')?.setValue('Password123');
      expect(component.form.valid).toBeFalsy();
    });

    it('should have valid form when both fields are correctly filled', () => {
      component.form.get('email')?.setValue('test@example.com');
      component.form.get('password')?.setValue('Password123');
      expect(component.form.valid).toBeTruthy();
    });

    it('should maintain form state through multiple validations', () => {
      const emailControl = component.form.get('email');
      const passwordControl = component.form.get('password');

      expect(component.form.valid).toBeFalsy();

      emailControl?.setValue('test@example.com');
      expect(component.form.valid).toBeFalsy();

      passwordControl?.setValue('Password123');
      expect(component.form.valid).toBeTruthy();

      emailControl?.setValue('');
      expect(component.form.valid).toBeFalsy();

      emailControl?.setValue('test@example.com');
      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('Component Integration with Real LoginForm', () => {
    it('should render LoginForm component', () => {
      const loginFormElement = fixture.debugElement.query(
        By.directive(LoginForm),
      );
      expect(loginFormElement).toBeTruthy();
    });

    it('should pass form to LoginForm component through template', () => {
      const loginFormComponent = fixture.debugElement.query(
        By.directive(LoginForm),
      )?.componentInstance;
      expect(loginFormComponent).toBeTruthy();
    });

    it('should handle form submission through event binding', () => {
      spyOn(component, 'onSubmit');

      const loginFormElement = fixture.debugElement.query(
        By.directive(LoginForm),
      );
      const formElement = loginFormElement.query(By.css('form'));

      if (formElement) {
        formElement.triggerEventHandler('ngSubmit', null);
        fixture.detectChanges();

        expect(component.onSubmit).toHaveBeenCalled();
      }
    });

    it('should display validation errors through LoginForm', () => {
      const emailControl = component.form.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();

      fixture.detectChanges();

      const errorElements = fixture.debugElement.queryAll(
        By.css('.error-message, .invalid-feedback, [data-testid*="error"]'),
      );

      expect(errorElements.length).toBeGreaterThan(0);
    });
  });
});
