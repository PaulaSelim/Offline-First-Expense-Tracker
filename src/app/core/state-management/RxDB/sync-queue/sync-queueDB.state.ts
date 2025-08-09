// sync-queue/sync-queue-db.state.ts
import { inject, Injectable } from '@angular/core';
import { RxCollection, RxDatabase, RxDocument } from 'rxdb';
import { from, map, Observable, switchMap } from 'rxjs';
import { RxdbService } from '../rxdb.service';
import {
  SyncActionType,
  SyncEntityType,
  SyncQueueDocument,
} from './sync-queue.schema';

@Injectable({
  providedIn: 'root',
})
export class SyncQueueDBState {
  private readonly rxdbService: RxdbService = inject(RxdbService);

  private getCollection$(): Observable<RxCollection<SyncQueueDocument>> {
    return from(this.rxdbService.database).pipe(
      map(
        (db: RxDatabase) =>
          db.collections['syncQueue'] as RxCollection<SyncQueueDocument>,
      ),
    );
  }

  addToQueue$(
    entityType: SyncEntityType,
    entityId: string,
    action: SyncActionType,
    data: Record<string, unknown>,
    groupId?: string,
  ): Observable<void> {
    const queueItem: SyncQueueDocument = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      action,
      data,
      groupId,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      isProcessing: false,
    };

    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<SyncQueueDocument>) =>
        from(collection.upsert(queueItem)).pipe(map(() => void 0)),
      ),
    );
  }

  getPendingItems$(): Observable<SyncQueueDocument[]> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<SyncQueueDocument>) =>
        collection
          .find({
            selector: {
              isProcessing: false,
            },
            sort: [{ timestamp: 'asc' }],
          })
          .$.pipe(
            map((docs: RxDocument<SyncQueueDocument>[]) =>
              docs.map((doc: RxDocument<SyncQueueDocument>) => doc.toJSON()),
            ),
          ),
      ),
    );
  }

  markAsProcessing$(itemId: string): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<SyncQueueDocument>) =>
        collection.findOne({ selector: { id: itemId } }).$.pipe(
          switchMap((doc: RxDocument<SyncQueueDocument> | null) => {
            if (!doc) return from([void 0]);
            return from(
              doc.update({
                $set: {
                  isProcessing: true,
                },
              }),
            ).pipe(map(() => void 0));
          }),
        ),
      ),
    );
  }

  removeFromQueue$(itemId: string): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<SyncQueueDocument>) =>
        collection
          .findOne({ selector: { id: itemId } })
          .$.pipe(
            switchMap((doc: RxDocument<SyncQueueDocument> | null) =>
              doc ? from(doc.remove()).pipe(map(() => void 0)) : from([void 0]),
            ),
          ),
      ),
    );
  }

  updateRetryCount$(itemId: string, error?: string): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<SyncQueueDocument>) =>
        collection.findOne({ selector: { id: itemId } }).$.pipe(
          switchMap((doc: RxDocument<SyncQueueDocument> | null) => {
            if (!doc) return from([void 0]);
            const currentData: SyncQueueDocument = doc.toJSON();
            return from(
              doc.update({
                $set: {
                  retryCount: currentData.retryCount + 1,
                  lastError: error,
                  isProcessing: false,
                },
              }),
            ).pipe(map(() => void 0));
          }),
        ),
      ),
    );
  }

  getQueueCount$(): Observable<number> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<SyncQueueDocument>) =>
        collection
          .find({ selector: { isProcessing: false } })
          .$.pipe(map((docs: RxDocument<SyncQueueDocument>[]) => docs.length)),
      ),
    );
  }

  clearProcessingFlags$(): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<SyncQueueDocument>) =>
        from(
          collection.find({ selector: { isProcessing: true } }).update({
            $set: { isProcessing: false },
          }),
        ).pipe(map(() => void 0)),
      ),
    );
  }

  clearQueue$(): Observable<void> {
    return this.getCollection$().pipe(
      switchMap((collection: RxCollection<SyncQueueDocument>) =>
        from(collection.remove()).pipe(map(() => void 0)),
      ),
    );
  }
}
