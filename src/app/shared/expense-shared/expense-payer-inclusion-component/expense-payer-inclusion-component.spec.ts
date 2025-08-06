import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePayerInclusionComponent } from './expense-payer-inclusion-component';

describe('ExpensePayerInclusionComponent', () => {
  let component: ExpensePayerInclusionComponent;
  let fixture: ComponentFixture<ExpensePayerInclusionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensePayerInclusionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensePayerInclusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
