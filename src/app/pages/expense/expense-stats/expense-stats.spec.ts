import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { ExpenseFacade } from '../../../service/expense/expense.facade';
import { Expense } from '../../../core/api/expenseApi/expenseApi.model';
import { ExpenseStats } from './expense-stats';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ExpenseStats', () => {
  let component: ExpenseStats;
  let fixture: ComponentFixture<ExpenseStats>;
  let mockExpenseFacade: jasmine.SpyObj<ExpenseFacade>;
  let mockExpensesSignal: WritableSignal<Expense[]>;

  const mockExpenses: Expense[] = [
    {
      id: '1',
      group_id: 'group1',
      title: 'Lunch',
      amount: 25.5,
      category: 'Food',
      date: '2025-01-15T00:00:00Z',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z',
      payer_id: 'user1',
    },
    {
      id: '2',
      group_id: 'group1',
      title: 'Gas',
      amount: 45.75,
      category: 'Transport',
      date: '2025-01-14T00:00:00Z',
      created_at: '2025-01-14T10:00:00Z',
      updated_at: '2025-01-14T10:00:00Z',
      payer_id: 'user2',
    },
    {
      id: '3',
      group_id: 'group1',
      title: 'Movie tickets',
      amount: 30.0,
      category: 'Entertainment',
      date: '2025-01-13T00:00:00Z',
      created_at: '2025-01-13T10:00:00Z',
      updated_at: '2025-01-13T10:00:00Z',
      payer_id: 'user3',
    },
  ];

  beforeEach(async () => {
    // Create a writable signal that we can update during tests
    mockExpensesSignal = signal(mockExpenses);

    mockExpenseFacade = jasmine.createSpyObj('ExpenseFacade', ['getExpenses']);
    mockExpenseFacade.getExpenses.and.returnValue(mockExpensesSignal);

    await TestBed.configureTestingModule({
      imports: [ExpenseStats],
      providers: [
        { provide: ExpenseFacade, useValue: mockExpenseFacade },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseStats);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('expenses signal', () => {
    it('should get expenses from facade', () => {
      expect(component.expenses()).toEqual(mockExpenses);
      expect(mockExpenseFacade.getExpenses).toHaveBeenCalledWith('');
    });
  });

  describe('getFormattedAmount', () => {
    it('should format amount as USD currency', () => {
      const amount = 123.45;

      const result = component.getFormattedAmount(amount);

      expect(result).toBe('$123.45');
    });

    it('should format whole numbers correctly', () => {
      const amount = 100;

      const result = component.getFormattedAmount(amount);

      expect(result).toBe('$100.00');
    });

    it('should format zero correctly', () => {
      const amount = 0;

      const result = component.getFormattedAmount(amount);

      expect(result).toBe('$0.00');
    });

    it('should format negative amounts correctly', () => {
      const amount = -50.75;

      const result = component.getFormattedAmount(amount);

      expect(result).toBe('-$50.75');
    });

    it('should format large amounts correctly', () => {
      const amount = 1234567.89;

      const result = component.getFormattedAmount(amount);

      expect(result).toBe('$1,234,567.89');
    });
  });

  describe('getTotalAmount', () => {
    it('should calculate total amount of all expenses', () => {
      const result = component.getTotalAmount();

      // 25.50 + 45.75 + 30.00 = 101.25
      expect(result).toBe(101.25);
    });

    it('should return 0 when no expenses exist', () => {
      // Update the signal to have empty array
      mockExpensesSignal.set([]);
      fixture.detectChanges();

      const result = component.getTotalAmount();

      expect(result).toBe(0);
    });

    it('should handle single expense', () => {
      const singleExpense: Expense[] = [
        {
          id: '1',
          group_id: 'group1',
          title: 'Test',
          amount: 42.5,
          category: 'Food',
          date: '2025-01-15T00:00:00Z',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          payer_id: 'user1',
        },
      ];

      // Update the signal to have single expense
      mockExpensesSignal.set(singleExpense);
      fixture.detectChanges();

      const result = component.getTotalAmount();

      expect(result).toBe(42.5);
    });

    it('should handle expenses with decimal precision', () => {
      const precisionExpenses: Expense[] = [
        {
          id: '1',
          group_id: 'group1',
          title: 'Test 1',
          amount: 10.99,
          category: 'Food',
          date: '2025-01-15T00:00:00Z',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          payer_id: 'user1',
        },
        {
          id: '2',
          group_id: 'group1',
          title: 'Test 2',
          amount: 20.01,
          category: 'Transport',
          date: '2025-01-14T00:00:00Z',
          created_at: '2025-01-14T10:00:00Z',
          updated_at: '2025-01-14T10:00:00Z',
          payer_id: 'user2',
        },
      ];

      // Update the signal to have precision expenses
      mockExpensesSignal.set(precisionExpenses);
      fixture.detectChanges();

      const result = component.getTotalAmount();

      expect(result).toBe(31.0);
    });
  });

  describe('getExpenseCount', () => {
    it('should return 0 when no expenses exist', () => {
      // Update the signal to have empty array
      mockExpensesSignal.set([]);
      fixture.detectChanges();

      const result = component.getExpenseCount();

      expect(result).toBe(0);
    });

    it('should return correct count of expenses', () => {
      const result = component.getExpenseCount();

      expect(result).toBe(3);
    });

    it('should return 1 for single expense', () => {
      const singleExpense: Expense[] = [
        {
          id: '1',
          group_id: 'group1',
          title: 'Test',
          amount: 42.5,
          category: 'Food',
          date: '2025-01-15T00:00:00Z',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          payer_id: 'user1',
        },
      ];

      // Update the signal to have single expense
      mockExpensesSignal.set(singleExpense);
      fixture.detectChanges();

      const result = component.getExpenseCount();

      expect(result).toBe(1);
    });
  });

  describe('component integration', () => {
    it('should update calculations when expenses change', () => {
      // Initial state
      expect(component.getTotalAmount()).toBe(101.25);
      expect(component.getExpenseCount()).toBe(3);

      // Update expenses
      const newExpenses: Expense[] = [
        {
          id: '1',
          group_id: 'group1',
          title: 'New Expense',
          amount: 50.0,
          category: 'Food',
          date: '2025-01-15T00:00:00Z',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          payer_id: 'user1',
        },
      ];

      // Update the signal to have new expenses
      mockExpensesSignal.set(newExpenses);
      fixture.detectChanges();

      expect(component.getTotalAmount()).toBe(50.0);
      expect(component.getExpenseCount()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle expenses with zero amounts', () => {
      const zeroAmountExpenses: Expense[] = [
        {
          id: '1',
          group_id: 'group1',
          title: 'Free item',
          amount: 0,
          category: 'Food',
          date: '2025-01-15T00:00:00Z',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
          payer_id: 'user1',
        },
        {
          id: '2',
          group_id: 'group1',
          title: 'Paid item',
          amount: 25.5,
          category: 'Transport',
          date: '2025-01-14T00:00:00Z',
          created_at: '2025-01-14T10:00:00Z',
          updated_at: '2025-01-14T10:00:00Z',
          payer_id: 'user2',
        },
      ];

      // Update the signal to have zero amount expenses
      mockExpensesSignal.set(zeroAmountExpenses);
      fixture.detectChanges();

      expect(component.getTotalAmount()).toBe(25.5);
      expect(component.getExpenseCount()).toBe(2);
    });
  });
});
