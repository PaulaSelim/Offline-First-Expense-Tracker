import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ExpenseAmountDateInputComponent } from './expense-amount-date-input-component';

describe('ExpenseAmountDateInputComponent', () => {
  let component: ExpenseAmountDateInputComponent;
  let fixture: ComponentFixture<ExpenseAmountDateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseAmountDateInputComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseAmountDateInputComponent);
    component = fixture.componentInstance;
    // Provide required input signals before detectChanges
    component.form = (() =>
      new FormGroup({
        amount: new FormControl(0),
        date: new FormControl('2025-08-13'),
      })) as any;
    component.isInvalid = (() => (controlName: string) => false) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.form).toBeDefined();
    expect(component.isInvalid).toBeDefined();
  });

  it('should accept a form input signal', () => {
    const mockForm = new FormGroup({
      amount: new FormControl(0),
      date: new FormControl('2025-08-13'),
    });
    component.form = (() => mockForm) as any;
    expect(component.form()).toBe(mockForm);
  });

  it('should accept an isInvalid input signal', () => {
    component.isInvalid = (() => () => false) as any;
    expect(component.isInvalid()('amount')).toBe(false);
    expect(component.isInvalid()('date')).toBe(false);
  });

  it('should return true for isInvalid if mocked as such', () => {
    component.isInvalid = (() => () => true) as any;
    expect(component.isInvalid()('amount')).toBe(true);
  });
});
