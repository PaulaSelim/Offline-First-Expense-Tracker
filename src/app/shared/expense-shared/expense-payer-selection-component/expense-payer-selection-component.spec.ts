import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePayerSelectionComponent } from './expense-payer-selection-component';

describe('ExpensePayerSelectionComponent', () => {
  let component: ExpensePayerSelectionComponent;
  let fixture: ComponentFixture<ExpensePayerSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensePayerSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensePayerSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
