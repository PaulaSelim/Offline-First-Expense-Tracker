import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseParticipantsSelectionComponent } from './expense-participants-selection-component';

describe('ExpenseParticipantsSelectionComponent', () => {
  let component: ExpenseParticipantsSelectionComponent;
  let fixture: ComponentFixture<ExpenseParticipantsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseParticipantsSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseParticipantsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
