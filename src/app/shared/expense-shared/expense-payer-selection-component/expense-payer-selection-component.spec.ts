import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, input } from '@angular/core';
import { ExpensePayerSelectionComponent } from './expense-payer-selection-component';

import { signal } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

describe('ExpensePayerSelectionComponent', () => {
  let component: ExpensePayerSelectionComponent;
  let fixture: ComponentFixture<ExpensePayerSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensePayerSelectionComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensePayerSelectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'form',
      new FormGroup({
        payer_id: new FormControl(''),
      }),
    );

    fixture.componentRef.setInput('isInvalid', (controlName: string) => false);
    fixture.componentRef.setInput('groupMembers', [
      { id: '1', payer_id: '1', username: 'Alice' },
      { id: '2', payer_id: '2', username: 'Bob' },
    ] as any);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.form).toBeDefined();
    expect(component.isInvalid).toBeDefined();
    expect(component.groupMembers).toBeDefined();
  });

  it('should accept a form input signal and get payer control', () => {
    const form = component.form();
    expect(form.get('payer_id')).toBeTruthy();
  });

  it('should accept an isInvalid input signal', () => {
    expect(component.isInvalid()('payer_id')).toBe(false);
  });

  it('should accept groupMembers input signal', () => {
    const members = component.groupMembers();
    expect(members.length).toBe(2);
    expect(members[0].username).toBe('Alice');
    expect(members[1].username).toBe('Bob');
  });
});
