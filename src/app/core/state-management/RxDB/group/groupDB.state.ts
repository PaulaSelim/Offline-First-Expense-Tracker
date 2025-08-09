import { inject, Injectable } from '@angular/core';
import { RxCollection, RxDatabase, RxDocument } from 'rxdb';
import { from, map, Observable, switchMap } from 'rxjs';
import { RxdbService } from '../rxdb.service';
import { GroupDocument } from './group.schema';
@Injectable({
  providedIn: 'root',
})
export class GroupDBState {
  private readonly rxdbService: RxdbService = inject(RxdbService);

  private getCollection$(): Observable<RxCollection<GroupDocument>> {
    return from(this.rxdbService.database).pipe(
      map(
        (db: RxDatabase) =>
          db.collections['groups'] as RxCollection<GroupDocument>,
      ),
    );
  }

  getAllGroups$(): Observable<GroupDocument[]> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<GroupDocument>) =>
        collection
          .find({ selector: {} })
          .$.pipe(
            map((docs: RxDocument<GroupDocument>[]) =>
              docs.map((d: RxDocument<GroupDocument>) => d.toJSON()),
            ),
          ),
      ),
    );
  }

  getGroupById$(id: string): Observable<GroupDocument | null> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<GroupDocument>) =>
        collection
          .findOne({ selector: { id } })
          .$.pipe(
            map((doc: RxDocument<GroupDocument> | null) =>
              doc ? doc.toJSON() : null,
            ),
          ),
      ),
    );
  }

  addOrUpdateGroup$(group: GroupDocument): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<GroupDocument>) =>
        from(collection.upsert(group)).pipe(map(() => void 0)),
      ),
    );
  }

  removeGroupById$(id: string): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<GroupDocument>) =>
        collection
          .findOne({ selector: { id } })
          .$.pipe(
            switchMap((doc: RxDocument<GroupDocument> | null) =>
              doc ? from(doc.remove()).pipe(map(() => void 0)) : from([void 0]),
            ),
          ),
      ),
    );
  }

  removeAllGroups$(): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<GroupDocument>) =>
        from(collection.remove()).pipe(map(() => void 0)),
      ),
    );
  }
}
