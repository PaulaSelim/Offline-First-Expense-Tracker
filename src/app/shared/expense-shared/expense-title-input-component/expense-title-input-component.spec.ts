import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ExpenseTitleInputComponent } from './expense-title-input-component';

import { signal, input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

describe('ExpenseTitleInputComponent', () => {
  let component: ExpenseTitleInputComponent;
  let fixture: ComponentFixture<ExpenseTitleInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseTitleInputComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseTitleInputComponent);
    component = fixture.componentInstance;
    // Set component inputs
    fixture.componentRef.setInput(
      'form',
      new FormGroup({
        title: new FormControl(''),
      }),
    );
    fixture.componentRef.setInput('isInvalid', (controlName: string) => false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.form).toBeDefined();
    expect(component.isInvalid).toBeDefined();
  });

  it('should accept a form input signal and get title control', () => {
    const form = component.form();
    expect(form.get('title')).toBeTruthy();
  });

  it('should accept an isInvalid input signal', () => {
    expect(component.isInvalid()('title')).toBe(false);
  });

  it('should mark title as touched on blur', () => {
    const form = component.form();
    const control = form.get('title');
    spyOn(control!, 'markAsTouched');
    component.onBlur();
    expect(control!.markAsTouched).toHaveBeenCalled();
  });
});
