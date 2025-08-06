import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ExpenseApiService } from './expenseApi.service';
import {
  ExpenseRequest,
  ExpenseListResponse,
  ExpenseResponse,
  Expense,
  Participant,
  UserBalanceResponse,
} from './expenseApi.model';
import { environment } from '../../../../environments/environment';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('ExpenseApiService', () => {
  let service: ExpenseApiService;
  let httpMock: HttpTestingController;

  const mockParticipant: Participant = {
    user_id: 'user1',
    email: 'user1@example.com',
    username: 'user1',
  };

  const mockExpense: Expense = {
    id: '1',
    group_id: 'group1',
    group_name: 'Test Group',
    title: 'Test Expense',
    amount: 100,
    payer_id: 'user1',
    category: 'Food',
    date: '2024-01-01',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    payer: mockParticipant,
    participants: [mockParticipant],
    participant_count: 1,
  };

  const mockExpenseRequest: ExpenseRequest = {
    title: 'Test Expense',
    amount: 100,
    payer_id: 'user1',
    category: 'category1',
    date: '2024-01-01',
    is_payer_included: true,
    participants_id: ['user1', 'user2'],
  };

  const mockExpenseResponse: ExpenseResponse = {
    data: {
      expense: mockExpense,
    },
  };

  const mockExpenseListResponse: ExpenseListResponse = {
    data: {
      expenses: [mockExpense],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    },
  };

  const mockUserBalanceResponse: UserBalanceResponse = {
    data: {
      user_id: 'user1',
      net_balance: 150.5,
      expenses: [
        { expense_id: 'expense1', amount: 100 },
        { expense_id: 'expense2', amount: 50.5 },
      ],
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ExpenseApiService,
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ExpenseApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createExpense', () => {
    it('should create an expense successfully', () => {
      const groupId = 'group1';

      service
        .createExpense(mockExpenseRequest, groupId)
        .subscribe((response) => {
          expect(response).toEqual(mockExpenseResponse);
        });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockExpenseRequest);
      req.flush(mockExpenseResponse);
    });

    it('should handle create expense error', () => {
      const groupId = 'group1';
      const errorMessage = 'Failed to create expense';

      service.createExpense(mockExpenseRequest, groupId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe(errorMessage);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses`,
      );
      req.flush(
        { message: errorMessage },
        { status: 400, statusText: 'Bad Request' },
      );
    });
  });

  describe('getExpenses', () => {
    it('should fetch expenses successfully', () => {
      const groupId = 'group1';

      service.getExpenses(groupId).subscribe((response) => {
        expect(response).toEqual(mockExpenseListResponse);
        expect(response.data.expenses.length).toBe(1);
        expect(response.data.expenses[0]).toEqual(mockExpense);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockExpenseListResponse);
    });

    it('should handle get expenses error', () => {
      const groupId = 'group1';

      service.getExpenses(groupId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses`,
      );
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getExpenseById', () => {
    it('should fetch expense by id successfully', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';

      service.getExpenseById(groupId, expenseId).subscribe((response) => {
        expect(response).toEqual(mockExpenseResponse);
        expect(response.data.expense).toEqual(mockExpense);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses/${expenseId}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockExpenseResponse);
    });

    it('should handle get expense by id error', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';

      service.getExpenseById(groupId, expenseId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses/${expenseId}`,
      );
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateExpense', () => {
    it('should update expense successfully', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';
      const updatedExpense = { ...mockExpense, title: 'Updated Expense' };
      const updatedResponse = { data: { expense: updatedExpense } };

      service
        .updateExpense(groupId, expenseId, mockExpenseRequest)
        .subscribe((response) => {
          expect(response).toEqual(updatedResponse);
          expect(response.data.expense.title).toBe('Updated Expense');
        });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses/${expenseId}`,
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockExpenseRequest);
      req.flush(updatedResponse);
    });

    it('should handle update expense error', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';

      service.updateExpense(groupId, expenseId, mockExpenseRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses/${expenseId}`,
      );
      req.flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('deleteExpense', () => {
    it('should delete expense successfully', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';

      service.deleteExpense(groupId, expenseId).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses/${expenseId}`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle delete expense error', () => {
      const groupId = 'group1';
      const expenseId = 'expense1';

      service.deleteExpense(groupId, expenseId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(403);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses/${expenseId}`,
      );
      req.flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('getUserBalance', () => {
    it('should fetch user balance successfully', () => {
      const groupId = 'group1';
      const userId = 'user1';

      service.getUserBalance(groupId, userId).subscribe((response) => {
        expect(response).toEqual(mockUserBalanceResponse);
        expect(response.data.user_id).toBe('user1');
        expect(response.data.net_balance).toBe(150.5);
        expect(response.data.expenses.length).toBe(2);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/members/${userId}/balance`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockUserBalanceResponse);
    });

    it('should handle get user balance error', () => {
      const groupId = 'group1';
      const userId = 'user1';

      service.getUserBalance(groupId, userId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/members/${userId}/balance`,
      );
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('HTTP Request Validation', () => {
    it('should make requests with correct headers', () => {
      const groupId = 'group1';

      service.getExpenses(groupId).subscribe((response) => {
        expect(response).toEqual(mockExpenseListResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses`,
      );
      expect(req.request.headers.get('Content-Type')).toBe(null); // Default for GET
      req.flush(mockExpenseListResponse);
    });

    it('should send correct request body for POST requests', () => {
      const groupId = 'group1';
      const customRequest: ExpenseRequest = {
        title: 'Custom Expense',
        amount: 250,
        payer_id: 'user2',
        category: 'category2',
        date: '2024-02-01',
        is_payer_included: false,
        participants_id: ['user2', 'user3'],
      };

      service.createExpense(customRequest, groupId).subscribe((response) => {
        expect(response).toEqual(mockExpenseResponse);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses`,
      );
      expect(req.request.body).toEqual(customRequest);
      expect(req.request.method).toBe('POST');
      req.flush(mockExpenseResponse);
    });
  });

  describe('URL Construction', () => {
    it('should construct correct URLs for all endpoints', () => {
      const groupId = 'test-group';
      const expenseId = 'test-expense';
      const userId = 'test-user';

      // Test getExpenses endpoint
      service.getExpenses(groupId).subscribe((response) => {
        expect(response).toEqual(mockExpenseListResponse);
      });
      let req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockExpenseListResponse);

      // Test getExpenseById endpoint
      service.getExpenseById(groupId, expenseId).subscribe((response) => {
        expect(response).toEqual(mockExpenseResponse);
      });
      req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses/${expenseId}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockExpenseResponse);

      // Test createExpense endpoint
      service
        .createExpense(mockExpenseRequest, groupId)
        .subscribe((response) => {
          expect(response).toEqual(mockExpenseResponse);
        });
      req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses`,
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockExpenseResponse);

      // Test updateExpense endpoint
      service
        .updateExpense(groupId, expenseId, mockExpenseRequest)
        .subscribe((response) => {
          expect(response).toEqual(mockExpenseResponse);
        });
      req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses/${expenseId}`,
      );
      expect(req.request.method).toBe('PUT');
      req.flush(mockExpenseResponse);

      // Test deleteExpense endpoint
      service.deleteExpense(groupId, expenseId).subscribe((response) => {
        expect(response).toBeNull();
      });
      req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/expenses/${expenseId}`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      // Test getUserBalance endpoint
      service.getUserBalance(groupId, userId).subscribe((response) => {
        expect(response).toEqual(mockUserBalanceResponse);
      });
      req = httpMock.expectOne(
        `${environment.apiUrl}/groups/${groupId}/members/${userId}/balance`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockUserBalanceResponse);
    });
  });
});
