import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ExpenseCategorySelectionComponent } from './expense-category-selection-component';
import { FormGroup, FormControl } from '@angular/forms';

describe('ExpenseCategorySelectionComponent', () => {
  let component: ExpenseCategorySelectionComponent;
  let fixture: ComponentFixture<ExpenseCategorySelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCategorySelectionComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseCategorySelectionComponent);
    component = fixture.componentInstance;
    // Provide required input signals before detectChanges
    component.form = (() =>
      new FormGroup({
        category: new FormControl('1'),
        amount: new FormControl(0),
      })) as any;
    component.isInvalid = (() => (controlName: string) => false) as any;
    component.categories = (() => [
      { id: '1', name: 'Food', icon: 'food-icon' },
    ]) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.form).toBeDefined();
    expect(component.isInvalid).toBeDefined();
    expect(component.categories).toBeDefined();
  });

  it('should accept a form input signal', () => {
    const mockForm = new FormGroup({ amount: new FormControl(0) });
    component.form = (() => mockForm) as any;
    expect(component.form()).toBe(mockForm);
  });

  it('should accept an isInvalid input signal', () => {
    component.isInvalid = (() => () => false) as any;
    expect(component.isInvalid()('amount')).toBe(false);
  });

  it('should accept categories input signal', () => {
    const mockCategory = { id: '1', name: 'Food', icon: 'food-icon' };
    component.categories = (() => [mockCategory]) as any;
    expect(component.categories()).toEqual([mockCategory]);
  });
});
