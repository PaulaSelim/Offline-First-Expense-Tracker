import { Injectable } from '@angular/core';
import { createRxDatabase, RxDatabase } from 'rxdb';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import { expensesSchema } from './expenses/expenses.schema';
import { groupsSchema } from './group/group.schema';
import { syncQueueSchema } from './sync-queue/sync-queue.schema';
import { usersSchema } from './user/user.schema';

@Injectable({
  providedIn: 'root',
})
export class RxdbService {
  private dbPromise: Promise<RxDatabase>;

  constructor() {
    this.dbPromise = this.initDatabase();
  }

  private async initDatabase(): Promise<RxDatabase> {
    const db: RxDatabase = await createRxDatabase({
      name: 'appDB-v0.1',
      storage: getRxStorageLocalstorage(),
      multiInstance: false,
    });

    await db.addCollections({
      users: { schema: usersSchema },
      groups: { schema: groupsSchema },
      expenses: { schema: expensesSchema },
      syncQueue: { schema: syncQueueSchema },
    });

    return db;
  }

  get database(): Promise<RxDatabase> {
    return this.dbPromise;
  }
}
