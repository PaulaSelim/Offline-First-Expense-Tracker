import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ExpenseDetailParticipants } from './expense-detail-participants';
import { ExpenseFacade } from '../../../service/expense/expense.facade';
import { GroupFacade } from '../../../service/group/group.facade';
import {
  GroupMember,
  GroupRole,
} from '../../../core/api/groupApi/groupApi.model';
import {
  Expense,
  Participant,
} from '../../../core/api/expenseApi/expenseApi.model';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ExpenseDetailParticipants', () => {
  let component: ExpenseDetailParticipants;
  let fixture: ComponentFixture<ExpenseDetailParticipants>;
  let mockExpenseFacade: jasmine.SpyObj<ExpenseFacade>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;

  const mockExpense: Expense = {
    id: 'expense1',
    group_id: 'group1',
    title: 'Test Expense',
    amount: 120.0,
    category: 'Food',
    date: '2025-01-15T00:00:00Z',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    payer_id: 'user1',
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
    {
      id: 'user3',
      username: '',
      email: 'bob@example.com',
      role: GroupRole.MEMBER,
    },
  ];

  const mockParticipants: Participant[] = [
    { id: 'user1', user_id: 'user1', username: 'John Doe' },
    { id: 'user2', user_id: 'user2', username: 'Jane Smith' },
    { id: 'user3', user_id: 'user3', username: 'Bob' },
  ];

  beforeEach(async () => {
    mockExpenseFacade = jasmine.createSpyObj('ExpenseFacade', [
      'getSelectedExpense',
      'getExpenseParticipants',
      'isLoading',
    ]);
    mockGroupFacade = jasmine.createSpyObj('GroupFacade', ['getGroupMembers']);

    mockExpenseFacade.getSelectedExpense.and.returnValue(signal(mockExpense));
    mockExpenseFacade.getExpenseParticipants.and.returnValue(
      signal(mockParticipants),
    );
    mockExpenseFacade.isLoading.and.returnValue(signal(false));
    mockGroupFacade.getGroupMembers.and.returnValue(signal(mockGroupMembers));

    await TestBed.configureTestingModule({
      imports: [ExpenseDetailParticipants],
      providers: [
        { provide: ExpenseFacade, useValue: mockExpenseFacade },
        { provide: GroupFacade, useValue: mockGroupFacade },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseDetailParticipants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have access to GroupRole constant', () => {
    expect(component.GroupRole).toBe(GroupRole);
  });

  it('should format amount as USD currency', () => {
    const result = component.getFormattedAmount(123.45);
    expect(result).toBe('$123.45');
  });

  it('should format zero amount correctly', () => {
    const result = component.getFormattedAmount(0);
    expect(result).toBe('$0.00');
  });

  it('should get participant name by username when available', () => {
    const result = component.getParticipantName('user1');
    expect(result).toBe('John Doe');
  });

  it('should get participant name by email when username is empty', () => {
    const result = component.getParticipantName('user3');
    expect(result).toBe('bob@example.com');
  });

  it('should return "Unknown" for non-existent participant', () => {
    const result = component.getParticipantName('nonexistent');
    expect(result).toBe('Unknown');
  });

  it('should calculate split amount correctly', () => {
    const result = component.calculateSplitAmount();
    expect(result).toBe(40); // 120 / 3 participants
  });
});
