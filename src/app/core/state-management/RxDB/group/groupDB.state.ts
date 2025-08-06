import { Injectable, inject } from '@angular/core';
import { RxCollection, RxDatabase, RxDocument } from 'rxdb';
import { Observable, from } from 'rxjs';
import { RxdbService } from '../rxdb.service';
import { GroupDocument } from './group.schema';
@Injectable({
  providedIn: 'root',
})
export class GroupDBState {
  private rxdbService: RxdbService = inject(RxdbService);

  async getCollectionAndDB(): Promise<{
    groupCollection: RxCollection<GroupDocument>;
  }> {
    const db: RxDatabase = await this.rxdbService.database;
    const groupCollection: RxCollection<GroupDocument> = db['groups'];
    return { groupCollection };
  }

  async addOrUpdateGroup(group: GroupDocument): Promise<void> {
    try {
      const {
        groupCollection,
      }: { groupCollection: RxCollection<GroupDocument> } =
        await this.getCollectionAndDB();
      await groupCollection.upsert(group);
      console.error('Group stored in RxDB:', group);
    } catch (error) {
      console.error('Error storing group in RxDB:', error);
    }
  }

  async getAllGroups(): Promise<GroupDocument[]> {
    try {
      const {
        groupCollection,
      }: { groupCollection: RxCollection<GroupDocument> } =
        await this.getCollectionAndDB();
      const groups: RxDocument<GroupDocument>[] = await groupCollection
        .find()
        .exec();
      return groups.map((doc: RxDocument<GroupDocument>) => doc.toJSON());
    } catch (error) {
      console.error('Error fetching groups from RxDB:', error);
      return [];
    }
  }

  async getGroupById(id: string): Promise<GroupDocument | null> {
    try {
      const {
        groupCollection,
      }: { groupCollection: RxCollection<GroupDocument> } =
        await this.getCollectionAndDB();
      const groupDoc: RxDocument<GroupDocument> | null = await groupCollection
        .findOne({ selector: { id } })
        .exec();
      return groupDoc ? groupDoc.toJSON() : null;
    } catch (error) {
      console.error('Error fetching group by id from RxDB:', error);
      return null;
    }
  }

  async removeGroupById(id: string): Promise<void> {
    try {
      const {
        groupCollection,
      }: { groupCollection: RxCollection<GroupDocument> } =
        await this.getCollectionAndDB();
      const groupDoc: RxDocument<GroupDocument> | null = await groupCollection
        .findOne({ selector: { id } })
        .exec();
      if (groupDoc) {
        await groupDoc.remove();
        console.error(`Group with id ${id} removed from RxDB`);
      }
    } catch (error) {
      console.error('Error removing group from RxDB:', error);
    }
  }

  getAllGroups$(): Observable<GroupDocument[]> {
    return from(this.getAllGroups());
  }

  getGroupById$(id: string): Observable<GroupDocument | null> {
    return from(this.getGroupById(id));
  }

  addOrUpdateGroup$(group: GroupDocument): Observable<void> {
    return from(this.addOrUpdateGroup(group));
  }

  removeGroupById$(id: string): Observable<void> {
    return from(this.removeGroupById(id));
  }
}
