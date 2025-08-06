import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTitleInputComponent } from './expense-title-input-component';

describe('ExpenseTitleInputComponent', () => {
  let component: ExpenseTitleInputComponent;
  let fixture: ComponentFixture<ExpenseTitleInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseTitleInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseTitleInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
