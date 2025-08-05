import { CommonModule } from '@angular/common';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { GroupCreateForm } from './group-create-form';

describe('GroupCreateForm', () => {
  let component: GroupCreateForm;
  let fixture: ComponentFixture<GroupCreateForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupCreateForm, ReactiveFormsModule, CommonModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupCreateForm);
    component = fixture.componentInstance;

    const formGroup = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl(''),
    });
    (component as any).form = signal(formGroup);
    (component as any).isInvalid = signal((controlName: string) => false);
    (component as any).isSubmitting = signal(false);

    spyOn(component.submitForm, 'emit');
    spyOn(component.cancelForm, 'emit');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit submitForm on form submit', () => {
    const formEl: HTMLFormElement = fixture.nativeElement.querySelector('form');
    formEl.dispatchEvent(new Event('ngSubmit'));
    expect(component.submitForm.emit).toHaveBeenCalled();
  });

  it('should emit cancelForm on cancel button click', () => {
    const cancelBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="button"]',
    );
    cancelBtn.click();
    expect(component.cancelForm.emit).toHaveBeenCalled();
  });
});
