import { Injectable } from '@angular/core';
import { createRxDatabase, RxDatabase } from 'rxdb';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
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
      name: 'appDB',
      storage: getRxStorageLocalstorage(),
      multiInstance: false,
    });

    await db.addCollections({
      users: { schema: usersSchema },
    });

    return db;
  }

  get database(): Promise<RxDatabase> {
    return this.dbPromise;
  }
}
