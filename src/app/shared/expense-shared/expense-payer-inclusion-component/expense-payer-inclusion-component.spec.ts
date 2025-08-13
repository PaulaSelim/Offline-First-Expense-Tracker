import { signal } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ExpensePayerInclusionComponent } from './expense-payer-inclusion-component';

describe('ExpensePayerInclusionComponent', () => {
  let component: ExpensePayerInclusionComponent;
  let fixture: ComponentFixture<ExpensePayerInclusionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensePayerInclusionComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensePayerInclusionComponent);
    component = fixture.componentInstance;
    // Provide required input signal before detectChanges
    fixture.componentRef.setInput(
      'form',
      new FormGroup({
        payer: new FormControl(''),
        is_payer_included: new FormControl(false),
      }),
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signal', () => {
    expect(component.form).toBeDefined();
  });

  it('should accept a form input signal and get payer control', () => {
    const form = component.form();
    expect(form.get('payer')).toBeTruthy();
  });

  it('should set payer value', () => {
    const form = component.form();
    form.get('payer')?.setValue('user1');
    expect(form.get('payer')?.value).toBe('user1');
  });

  it('should have payer control untouched initially', () => {
    const form = component.form();
    expect(form.get('payer')?.touched).toBe(false);
  });
});
