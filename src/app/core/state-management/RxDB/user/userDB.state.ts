import { inject, Injectable } from '@angular/core';
import { RxCollection, RxDatabase, RxDocument } from 'rxdb';
import { from, map, Observable, switchMap } from 'rxjs';
import { RxdbService } from '../rxdb.service';
import { UserDocument } from './user.schema';

@Injectable({
  providedIn: 'root',
})
export class UserDBState {
  private readonly rxdbService: RxdbService = inject(RxdbService);

  private getCollection$(): Observable<RxCollection<UserDocument>> {
    return from(this.rxdbService.database).pipe(
      map(
        (db: RxDatabase) =>
          db.collections['users'] as RxCollection<UserDocument>,
      ),
    );
  }

  getAllUsers$(): Observable<UserDocument[]> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<UserDocument>) =>
        collection
          .find({ selector: {} })
          .$.pipe(
            map((docs: RxDocument<UserDocument>[]) =>
              docs.map((d: RxDocument<UserDocument>) => d.toJSON()),
            ),
          ),
      ),
    );
  }

  getUser$(): Observable<UserDocument | null> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<UserDocument>) =>
        collection
          .find({ selector: {} })
          .$.pipe(
            map((docs: RxDocument<UserDocument>[]) =>
              docs.length > 0 ? docs[0].toJSON() : null,
            ),
          ),
      ),
    );
  }

  addOrUpdateUser$(user: UserDocument): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<UserDocument>) =>
        from(collection.upsert(user)).pipe(map(() => void 0)),
      ),
    );
  }

  removeUser$(): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<UserDocument>) =>
        collection
          .find({ selector: {} })
          .$.pipe(
            switchMap((docs: RxDocument<UserDocument>[]) =>
              docs.length > 0
                ? from(docs[0].remove()).pipe(map(() => void 0))
                : from([void 0]),
            ),
          ),
      ),
    );
  }
}
