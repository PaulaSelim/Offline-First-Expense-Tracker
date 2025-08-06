import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseAmountDateInputComponent } from './expense-amount-date-input-component';

describe('ExpenseAmountDateInputComponent', () => {
  let component: ExpenseAmountDateInputComponent;
  let fixture: ComponentFixture<ExpenseAmountDateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseAmountDateInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseAmountDateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
