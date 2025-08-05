import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { ExpenseEditForm } from './expense-edit-form';
import {
  Group,
  GroupMember,
  GroupRole,
} from '../../../core/api/groupApi/groupApi.model';
import { Expense } from '../../../core/api/expenseApi/expenseApi.model';
import { CommonModule } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
describe('ExpenseEditForm', () => {
  let component: ExpenseEditForm;
  let fixture: ComponentFixture<ExpenseEditForm>;
  let formBuilder: FormBuilder;

  const mockGroup: Group = {
    id: 'group1',
    name: 'Test Group',
    member_count: 5,
    created_by: 'user1',
    description: 'Test Description',
    user_role: GroupRole.ADMIN,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const mockGroupMembers: GroupMember[] = [
    {
      id: 'user1',
      username: 'John Doe',
      email: 'john@example.com',
      role: GroupRole.ADMIN,
    },
    {
      id: 'user2',
      username: 'Jane Smith',
      email: 'jane@example.com',
      role: GroupRole.MEMBER,
    },
  ];

  const mockExpense: Expense = {
    id: '1',
    group_id: 'group1',
    title: 'Test Expense',
    amount: 100.0,
    category: 'Food',
    date: '2025-01-15T00:00:00Z',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    payer_id: 'user1',
  };

  const mockCategories = [
    { id: 'Food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'Transport', name: 'Transportation', icon: '🚗' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseEditForm, ReactiveFormsModule, CommonModule],
      providers: [FormBuilder, provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseEditForm);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);

    // Create a proper FormGroup
    const mockForm = formBuilder.group({
      title: ['Test Expense', [Validators.required]],
      amount: [100, [Validators.required]],
      payer_id: ['user1', [Validators.required]],
      category: ['Food', [Validators.required]],
      date: ['2025-01-15', [Validators.required]],
      participants_id: [['user1', 'user2'], [Validators.required]],
    });

    // Set required inputs without triggering form directive issues
    fixture.componentRef.setInput('form', signal(mockForm));
    fixture.componentRef.setInput(
      'isInvalid',
      signal((controlName: string) => false),
    );
    fixture.componentRef.setInput('isSubmitting', signal(false));
    fixture.componentRef.setInput('groupMembers', signal(mockGroupMembers));
    fixture.componentRef.setInput('categories', signal(mockCategories));
    fixture.componentRef.setInput('selectedGroup', signal(mockGroup));
    fixture.componentRef.setInput('selectedExpense', signal(mockExpense));
    fixture.componentRef.setInput(
      'isParticipantSelected',
      signal((memberId: string) => true),
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have GroupRole constant available', () => {
    expect(component.GroupRole).toBe(GroupRole);
  });

  it('should emit submitForm when onSubmit is called', () => {
    spyOn(component.submitForm, 'emit');
    component.onSubmit();
    expect(component.submitForm.emit).toHaveBeenCalled();
  });

  it('should emit cancelForm when onCancel is called', () => {
    spyOn(component.cancelForm, 'emit');
    component.onCancel();
    expect(component.cancelForm.emit).toHaveBeenCalled();
  });

  it('should emit participantToggle with memberId when onParticipantToggle is called', () => {
    spyOn(component.participantToggle, 'emit');
    const memberId = 'user1';
    component.onParticipantToggle(memberId);
    expect(component.participantToggle.emit).toHaveBeenCalledWith(memberId);
  });

  it('should emit selectAllParticipants when onSelectAll is called', () => {
    spyOn(component.selectAllParticipants, 'emit');
    component.onSelectAll();
    expect(component.selectAllParticipants.emit).toHaveBeenCalled();
  });

  it('should emit clearAllParticipants when onClearAll is called', () => {
    spyOn(component.clearAllParticipants, 'emit');
    component.onClearAll();
    expect(component.clearAllParticipants.emit).toHaveBeenCalled();
  });
});
