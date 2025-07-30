import {
  Component,
  computed,
  provideZonelessChangeDetection,
  Signal,
  signal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RegisterForm } from './register-form';

@Component({
  selector: 'test-host-component',
  standalone: true,
  imports: [RegisterForm, ReactiveFormsModule],
  template: `
    <app-register-form
      [form]="formSignal()"
      [isInvalid]="isInvalid()"
      [isPasswordMismatch]="isPasswordMismatch()"
      (submitForm)="onSubmit()"
    />
  `,
})
class TestHostComponent {
  form = new FormGroup({
    username: new FormControl('testuser', Validators.required),
    email: new FormControl('test@email.com', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('password123', Validators.required),
    confirmPassword: new FormControl('password123', Validators.required),
  });

  formSignal: Signal<FormGroup> = signal(this.form);

  isInvalid = signal(
    (controlName: string) =>
      (this.form.get(controlName)?.invalid &&
        this.form.get(controlName)?.touched) ||
      false,
  );

  isPasswordMismatch = computed(() => {
    const value = this.form.value;
    return value.password !== value.confirmPassword;
  });

  submitCalled = false;

  onSubmit() {
    this.submitCalled = true;
  }
}

describe('RegisterForm via host with mock data', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the host and child component', () => {
    expect(host).toBeTruthy();
    const formCmp = fixture.debugElement.query(By.directive(RegisterForm));
    expect(formCmp).toBeTruthy();
  });

  it('should emit submitForm when onSubmit is called', () => {
    const formCmp = fixture.debugElement.query(By.directive(RegisterForm))
      .componentInstance as RegisterForm;
    formCmp.onSubmit();
    expect(host.submitCalled).toBeTrue();
  });

  it('should detect no password mismatch with mock values', () => {
    expect(host.isPasswordMismatch()).toBeFalse();
  });

  it('isInvalid should return false for valid control', () => {
    host.form.get('username')?.markAsTouched();
    expect(host.isInvalid()('username')).toBeFalse();
  });

  it('isInvalid should return true for empty touched control', () => {
    const control = host.form.get('username');
    control?.setValue('');
    control?.markAsTouched();
    fixture.detectChanges();
    expect(host.isInvalid()('username')).toBeTrue();
  });
});
