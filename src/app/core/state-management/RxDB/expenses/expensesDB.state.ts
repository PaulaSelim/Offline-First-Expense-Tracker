import { Injectable, inject } from '@angular/core';
import { RxCollection, RxDatabase, RxDocument } from 'rxdb';
import { Observable, from } from 'rxjs';
import { RxdbService } from '../rxdb.service';
import { ExpenseDocument, Participant } from './expenses.schema';

@Injectable({
  providedIn: 'root',
})
export class ExpensesDBState {
  private rxdbService: RxdbService = inject(RxdbService);

  async getCollectionAndDB(): Promise<{
    expensesCollection: RxCollection<ExpenseDocument>;
  }> {
    const db: RxDatabase = await this.rxdbService.database;
    const expensesCollection: RxCollection<ExpenseDocument> = db['expenses'];
    return { expensesCollection };
  }

  async addOrUpdateExpense(expense: ExpenseDocument): Promise<void> {
    try {
      const {
        expensesCollection,
      }: { expensesCollection: RxCollection<ExpenseDocument> } =
        await this.getCollectionAndDB();
      await expensesCollection.upsert(expense);
      console.error('Expense stored in RxDB:', expense);
    } catch (error) {
      console.error('Error storing expense in RxDB:', error);
    }
  }

  async getAllExpenses(): Promise<ExpenseDocument[]> {
    try {
      const {
        expensesCollection,
      }: { expensesCollection: RxCollection<ExpenseDocument> } =
        await this.getCollectionAndDB();
      const expenses: RxDocument<ExpenseDocument>[] = await expensesCollection
        .find()
        .exec();
      return expenses.map((doc: RxDocument<ExpenseDocument>) => {
        const expense: ExpenseDocument = doc.toJSON() as ExpenseDocument;
        if (expense.participants) {
          expense.participants = Array.from(
            expense.participants,
          ) as Participant[];
        }
        return expense;
      });
    } catch (error) {
      console.error('Error fetching expenses from RxDB:', error);
      return [];
    }
  }

  async getExpenseById(id: string): Promise<ExpenseDocument | null> {
    try {
      const {
        expensesCollection,
      }: { expensesCollection: RxCollection<ExpenseDocument> } =
        await this.getCollectionAndDB();
      const expenseDoc: RxDocument<ExpenseDocument> | null =
        await expensesCollection.findOne({ selector: { id } }).exec();
      if (expenseDoc) {
        const expense: ExpenseDocument = expenseDoc.toJSON() as ExpenseDocument;
        if (expense.participants) {
          expense.participants = Array.from(
            expense.participants,
          ) as Participant[];
        }
        return expense;
      }
      return null;
    } catch (error) {
      console.error('Error fetching expense by id from RxDB:', error);
      return null;
    }
  }

  async removeExpenseById(id: string): Promise<void> {
    try {
      const {
        expensesCollection,
      }: { expensesCollection: RxCollection<ExpenseDocument> } =
        await this.getCollectionAndDB();
      const expenseDoc: RxDocument<ExpenseDocument> | null =
        await expensesCollection.findOne({ selector: { id } }).exec();
      if (expenseDoc) {
        await expenseDoc.remove();
        console.error(`Expense with id ${id} removed from RxDB`);
      }
    } catch (error) {
      console.error('Error removing expense from RxDB:', error);
    }
  }

  getAllExpenses$(): Observable<ExpenseDocument[]> {
    return from(this.getAllExpenses());
  }

  getExpenseById$(id: string): Observable<ExpenseDocument | null> {
    return from(this.getExpenseById(id));
  }

  addOrUpdateExpense$(expense: ExpenseDocument): Observable<void> {
    return from(this.addOrUpdateExpense(expense));
  }

  removeExpenseById$(id: string): Observable<void> {
    return from(this.removeExpenseById(id));
  }
}
