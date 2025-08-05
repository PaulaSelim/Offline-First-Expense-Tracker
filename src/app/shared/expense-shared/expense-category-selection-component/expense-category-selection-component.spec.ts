import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCategorySelectionComponent } from './expense-category-selection-component';

describe('ExpenseCategorySelectionComponent', () => {
  let component: ExpenseCategorySelectionComponent;
  let fixture: ComponentFixture<ExpenseCategorySelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCategorySelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseCategorySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
