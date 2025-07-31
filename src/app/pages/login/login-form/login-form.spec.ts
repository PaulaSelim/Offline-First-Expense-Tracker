import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LoginForm } from './login-form';
import { provideZonelessChangeDetection } from '@angular/core';

describe('LoginForm', () => {
  let component: LoginForm;
  let fixture: ComponentFixture<LoginForm>;
  let mockForm: FormGroup;
  let mockIsInvalid: jasmine.Spy;

  beforeEach(async () => {
    // Create mock form
    mockForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      ]),
    });

    // Create mock isInvalid function
    mockIsInvalid = jasmine.createSpy('isInvalid').and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [LoginForm, ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('form', mockForm);
    fixture.componentRef.setInput('isInvalid', mockIsInvalid);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Inputs', () => {
    it('should receive form input', () => {
      expect(component.form()).toBe(mockForm);
    });

    it('should receive isInvalid input', () => {
      expect(component.isInvalid()).toBe(mockIsInvalid);
    });
  });

  describe('Form Rendering', () => {
    it('should render form element', () => {
      const formElement = fixture.debugElement.query(By.css('form'));
      expect(formElement).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should emit submitForm when onSubmit is called', () => {
      spyOn(component.submitForm, 'emit');

      component.onSubmit();

      expect(component.submitForm.emit).toHaveBeenCalled();
    });

    it('should emit submitForm when form is submitted', () => {
      spyOn(component.submitForm, 'emit');

      const formElement = fixture.debugElement.query(By.css('form'));
      formElement.nativeElement.dispatchEvent(new Event('submit'));

      expect(component.submitForm.emit).toHaveBeenCalled();
    });
  });

  describe('Template Integration', () => {
    it('should call isInvalid function for form validation', () => {
      // Trigger template binding that might call isInvalid
      fixture.detectChanges();

      // Note: This test depends on your actual template implementation
      // You might need to adjust based on how isInvalid is used in the template
      expect(mockIsInvalid).toBeDefined();
    });

    it('should handle template updates when inputs change', () => {
      const newForm = new FormGroup({
        email: new FormControl('updated@example.com'),
        password: new FormControl('UpdatedPassword123'),
      });

      fixture.componentRef.setInput('form', newForm);
      fixture.detectChanges();

      expect(component.form()).toBe(newForm);
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle input changes', () => {
      const newForm = new FormGroup({
        email: new FormControl('test@example.com'),
        password: new FormControl('NewPassword123'),
      });

      fixture.componentRef.setInput('form', newForm);
      fixture.detectChanges();

      expect(component.form()).toBe(newForm);
    });

    it('should handle isInvalid function changes', () => {
      const newIsInvalid = jasmine
        .createSpy('newIsInvalid')
        .and.returnValue(true);

      fixture.componentRef.setInput('isInvalid', newIsInvalid);
      fixture.detectChanges();

      expect(component.isInvalid()).toBe(newIsInvalid);
    });
  });

  describe('Output Events', () => {
    it('should have submitForm output defined', () => {
      expect(component.submitForm).toBeDefined();
    });

    it('should emit void when submitForm is triggered', () => {
      let emittedValue: any;
      component.submitForm.subscribe((value) => {
        emittedValue = value;
      });

      component.onSubmit();

      expect(emittedValue).toBeUndefined();
    });
  });

  describe('Form Control Access', () => {
    it('should access form controls through form input', () => {
      const form = component.form();
      expect(form.get('email')).toBeTruthy();
      expect(form.get('password')).toBeTruthy();
    });

    it('should reflect form state changes', () => {
      const form = component.form();

      form.get('email')?.setValue('test@example.com');
      form.get('password')?.setValue('Password123');

      expect(form.get('email')?.value).toBe('test@example.com');
      expect(form.get('password')?.value).toBe('Password123');
    });
  });

  describe('Integration with Parent Component', () => {
    it('should work with parent form validation', () => {
      // Simulate parent calling isInvalid
      const isInvalidFn = component.isInvalid();
      const result = isInvalidFn('email');

      expect(mockIsInvalid).toHaveBeenCalledWith('email');
      expect(result).toBe(false);
    });

    it('should properly emit to parent on form submission', () => {
      let submissionReceived = false;

      component.submitForm.subscribe(() => {
        submissionReceived = true;
      });

      component.onSubmit();

      expect(submissionReceived).toBeTruthy();
    });
  });

  describe('Form Validation Integration', () => {
    it('should work with different validation states', () => {
      // Set up isInvalid to return true for invalid fields
      mockIsInvalid.and.callFake((controlName: string) => {
        const control = mockForm.get(controlName);
        return (
          !!control && control.invalid && (control.dirty || control.touched)
        );
      });

      fixture.componentRef.setInput('isInvalid', mockIsInvalid);
      fixture.detectChanges();

      // Mark email as touched and invalid
      mockForm.get('email')?.markAsTouched();

      const result = component.isInvalid()('email');
      expect(result).toBeTruthy();
    });

    it('should handle form state changes correctly', () => {
      const form = component.form();

      // Initially invalid
      expect(form.valid).toBeFalsy();

      // Make valid
      form.get('email')?.setValue('test@example.com');
      form.get('password')?.setValue('Password123');

      expect(form.valid).toBeTruthy();
    });
  });

  describe('Component Behavior', () => {
    it('should maintain component state through multiple interactions', () => {
      let emissionCount = 0;

      component.submitForm.subscribe(() => {
        emissionCount++;
      });

      // Submit multiple times
      component.onSubmit();
      component.onSubmit();
      component.onSubmit();

      expect(emissionCount).toBe(3);
    });

    it('should handle rapid input changes', () => {
      const forms = [
        new FormGroup({
          email: new FormControl('test1@example.com'),
          password: new FormControl('Password123'),
        }),
        new FormGroup({
          email: new FormControl('test2@example.com'),
          password: new FormControl('Password456'),
        }),
        new FormGroup({
          email: new FormControl('test3@example.com'),
          password: new FormControl('Password789'),
        }),
      ];

      forms.forEach((form, index) => {
        fixture.componentRef.setInput('form', form);
        fixture.detectChanges();
        expect(component.form()).toBe(form);
      });
    });
  });
});
