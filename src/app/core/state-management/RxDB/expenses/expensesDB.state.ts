import { Injectable, inject } from '@angular/core';
import { RxCollection, RxDatabase, RxDocument } from 'rxdb';
import { from, map, Observable, switchMap } from 'rxjs';
import { RxdbService } from '../rxdb.service';
import { ExpenseDocument, Participant } from './expenses.schema';
import { Expense } from '../../../api/expenseApi/expenseApi.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesDBState {
  private readonly rxdbService: RxdbService = inject(RxdbService);

  private getCollection$(): Observable<RxCollection<ExpenseDocument>> {
    return from(this.rxdbService.database).pipe(
      map(
        (db: RxDatabase) =>
          db.collections['expenses'] as RxCollection<ExpenseDocument>,
      ),
    );
  }

  getAllExpenses$(): Observable<ExpenseDocument[]> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<ExpenseDocument>) =>
        collection.find({ selector: {} }).$.pipe(
          map((docs: RxDocument<ExpenseDocument>[]) =>
            docs.map((doc: RxDocument<ExpenseDocument>) => {
              const expense: ExpenseDocument = doc.toJSON() as ExpenseDocument;
              if (expense.participants) {
                expense.participants = Array.from(
                  expense.participants,
                ) as Participant[];
              }
              return expense;
            }),
          ),
        ),
      ),
    );
  }

  getExpensesByGroupId$(groupId: string): Observable<Expense[]> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<ExpenseDocument>) =>
        from(collection.find({ selector: { group_id: groupId } }).exec()).pipe(
          map((docs: RxDocument<ExpenseDocument>[]) =>
            docs.map(
              (doc: RxDocument<ExpenseDocument>) => doc.toJSON() as Expense,
            ),
          ),
        ),
      ),
    );
  }

  getExpenseById$(expenseId: string): Observable<Expense | null> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<ExpenseDocument>) =>
        from(collection.findOne({ selector: { id: expenseId } }).exec()).pipe(
          map((doc: RxDocument<ExpenseDocument> | null) =>
            doc ? (doc.toJSON() as Expense) : null,
          ),
        ),
      ),
    );
  }

  addOrUpdateExpense$(expense: ExpenseDocument): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<ExpenseDocument>) =>
        from(collection.upsert(expense)).pipe(map(() => void 0)),
      ),
    );
  }

  removeExpenseById$(id: string): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<ExpenseDocument>) =>
        collection
          .findOne({ selector: { id } })
          .$.pipe(
            switchMap((doc: RxDocument<ExpenseDocument> | null) =>
              doc ? from(doc.remove()).pipe(map(() => void 0)) : from([void 0]),
            ),
          ),
      ),
    );
  }
}
