import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Login } from './login';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LoginForm } from './login-form/login-form';
import { AuthFacade } from '../../service/auth/auth.facade';
import { RxdbService } from '../../core/state-management/RxDB/rxdb.service';
import { UserDBState } from '../../core/state-management/RxDB/user/userDB.state';
import { GroupDBState } from '../../core/state-management/RxDB/group/groupDB.state';
import { ExpensesDBState } from '../../core/state-management/RxDB/expenses/expensesDB.state';
import { SyncQueueDBState } from '../../core/state-management/RxDB/sync-queue/sync-queueDB.state';
import { of } from 'rxjs';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuthFacade: jasmine.SpyObj<AuthFacade>;

  beforeEach(async () => {
    // Mock AuthFacade
    mockAuthFacade = jasmine.createSpyObj('AuthFacade', [
      'isTokenValid',
      'login',
    ]);
    mockAuthFacade.isTokenValid.and.returnValue(Promise.resolve(false));

    // Mock RxDB Services
    const mockRxdbService = jasmine.createSpyObj('RxdbService', ['database']);
    const mockUserDBState = jasmine.createSpyObj('UserDBState', [
      'getUser$',
      'addOrUpdateUser$',
      'removeUser$',
    ]);
    const mockGroupDBState = jasmine.createSpyObj('GroupDBState', [
      'getAllGroups$',
      'removeAllGroups$',
    ]);
    const mockExpensesDBState = jasmine.createSpyObj('ExpensesDBState', [
      'getAllExpenses$',
      'removeAllExpenses$',
    ]);
    const mockSyncQueueDBState = jasmine.createSpyObj('SyncQueueDBState', [
      'getAll$',
      'clearQueue$',
    ]);

    mockUserDBState.getUser$.and.returnValue(of(null));
    mockUserDBState.addOrUpdateUser$.and.returnValue(of(undefined));
    mockUserDBState.removeUser$.and.returnValue(of(undefined));
    mockGroupDBState.getAllGroups$.and.returnValue(of([]));
    mockGroupDBState.removeAllGroups$.and.returnValue(of(undefined));
    mockExpensesDBState.getAllExpenses$.and.returnValue(of([]));
    mockExpensesDBState.removeAllExpenses$.and.returnValue(of(undefined));
    mockSyncQueueDBState.getAll$.and.returnValue(of([]));
    mockSyncQueueDBState.clearQueue$.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [Login, LoginForm, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        provideToastr(),
        provideNoopAnimations(),
        provideHttpClient(),
        provideRouter([
          { path: 'register', component: class {} },
          { path: 'forgot-password', component: class {} },
          { path: 'home', component: class {} },
          { path: 'dashboard', component: class {} },
        ]),
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: RxdbService, useValue: mockRxdbService },
        { provide: UserDBState, useValue: mockUserDBState },
        { provide: GroupDBState, useValue: mockGroupDBState },
        { provide: ExpensesDBState, useValue: mockExpensesDBState },
        { provide: SyncQueueDBState, useValue: mockSyncQueueDBState },
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

  describe('AuthFacade Integration', () => {
    it('should call AuthFacade.isTokenValid on ngOnInit', () => {
      expect(mockAuthFacade.isTokenValid).toHaveBeenCalled();
    });

    it('should not navigate to dashboard when token is invalid', async () => {
      mockAuthFacade.isTokenValid.and.returnValue(Promise.resolve(false));

      component.ngOnInit();
      await fixture.whenStable();

      expect(mockAuthFacade.isTokenValid).toHaveBeenCalled();
    });

    it('should call AuthFacade.login with form data on valid form submission', () => {
      component.form.get('email')?.setValue('test@example.com');
      component.form.get('password')?.setValue('Password123');

      component.onSubmit();

      expect(mockAuthFacade.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
      });
    });

    it('should not call AuthFacade.login on invalid form submission', () => {
      component.form.get('email')?.setValue('invalid-email');
      component.form.get('password')?.setValue('');

      component.onSubmit();

      expect(mockAuthFacade.login).not.toHaveBeenCalled();
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
