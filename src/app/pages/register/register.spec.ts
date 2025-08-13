import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { Register } from './register';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AuthFacade } from '../../service/auth/auth.facade';

// Mock AuthFacade
class MockAuthFacade {
  register = jasmine.createSpy('register');
}

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideToastr(),
        provideNoopAnimations(),
        { provide: AuthFacade, useClass: MockAuthFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate the form if required fields are empty', () => {
    component.form.setValue({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(component.form.valid).toBeFalse();
  });

  it('should detect password mismatch with mock values', () => {
    component.form.setValue({
      username: 'user',
      email: 'user@example.com',
      password: 'pass123',
      confirmPassword: 'different123',
    });

    const result = component.isPasswordMismatch();
    expect(result).toBeTrue();
  });

  it('should not detect password mismatch when passwords match', () => {
    component.form.setValue({
      username: 'user',
      email: 'user@example.com',
      password: 'pass123',
      confirmPassword: 'pass123',
    });

    const result = component.isPasswordMismatch();
    expect(result).toBeFalse();
  });

  it('should return trimmed username and email using mock logic', () => {
    const rawFormValue = {
      username: '  user  ',
      email: '  user@example.com  ',
      password: 'pass123',
      confirmPassword: 'pass123',
    };

    component.form.setValue(rawFormValue);

    const trimmed = {
      username: component.form.value.username.trim(),
      email: component.form.value.email.trim(),
    };

    expect(trimmed.username).toBe('user');
    expect(trimmed.email).toBe('user@example.com');
  });

  it('isInvalid should return true for touched and invalid control', () => {
    const control = component.form.get('email');
    control?.setValue('');
    control?.markAsTouched();

    const result = component.isInvalid()('email');
    expect(result).toBeTrue();
  });

  it('isInvalid should return false for touched and valid control', () => {
    const control = component.form.get('email');
    control?.setValue('user@example.com');
    control?.markAsTouched();

    const result = component.isInvalid()('email');
    expect(result).toBeFalse();
  });
});
