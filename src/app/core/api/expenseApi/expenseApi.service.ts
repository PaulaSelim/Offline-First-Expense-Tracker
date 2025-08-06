import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  ExpenseListResponse,
  ExpenseRequest,
  ExpenseResponse,
  ExpenseUpdateRequest,
  UserBalanceResponse,
} from './expenseApi.model';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ExpenseApiService {
  constructor(private http: HttpClient) {}

  createExpense(
    data: ExpenseRequest,
    group_id: string,
  ): Observable<ExpenseResponse> {
    return this.http.post<ExpenseResponse>(
      `${environment.apiUrl}/groups/${group_id}/expenses`,
      data,
    );
  }

  getExpenses(group_id: string): Observable<ExpenseListResponse> {
    return this.http.get<ExpenseListResponse>(
      `${environment.apiUrl}/groups/${group_id}/expenses`,
    );
  }

  getExpenseById(
    group_id: string,
    expense_id: string,
  ): Observable<ExpenseResponse> {
    return this.http.get<ExpenseResponse>(
      `${environment.apiUrl}/groups/${group_id}/expenses/${expense_id}`,
    );
  }

  updateExpense(
    group_id: string,
    expense_id: string,
    data: ExpenseUpdateRequest,
  ): Observable<ExpenseResponse> {
    return this.http.put<ExpenseResponse>(
      `${environment.apiUrl}/groups/${group_id}/expenses/${expense_id}`,
      data,
    );
  }

  deleteExpense(group_id: string, expense_id: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/groups/${group_id}/expenses/${expense_id}`,
    );
  }

  getUserBalance(
    group_id: string,
    user_id: string,
  ): Observable<UserBalanceResponse> {
    return this.http.get<UserBalanceResponse>(
      `${environment.apiUrl}/groups/${group_id}/members/${user_id}/balance`,
    );
  }
}
