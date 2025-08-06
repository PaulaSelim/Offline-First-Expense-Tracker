import { Injectable, inject } from '@angular/core';
import { RxCollection, RxDatabase, RxDocument } from 'rxdb';
import { Observable, from } from 'rxjs';
import { AuthenticationTokens, User } from '../../../api/authApi/authApi.model';
import { RxdbService } from '../rxdb.service';
import { UserDocument } from './user.schema';

@Injectable({
  providedIn: 'root',
})
export class UserDBState {
  private rxdbService: RxdbService = inject(RxdbService);

  async getCollectionAndDB(): Promise<{
    userCollection: RxCollection<UserDocument>;
  }> {
    const db: RxDatabase = await this.rxdbService.database;
    const userCollection: RxCollection<UserDocument> = db['users'];
    return { userCollection };
  }

  async storeUserWithTokens(
    user: User,
    tokens: AuthenticationTokens,
  ): Promise<void> {
    try {
      const { userCollection }: { userCollection: RxCollection<UserDocument> } =
        await this.getCollectionAndDB();

      const userDoc: UserDocument = {
        id: user.id,
        email: user.email,
        username: user.username,
        token: tokens.token,
        refresh_token: tokens.refresh_token,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      // Upsert the user (insert or update if exists)
      await userCollection.upsert(userDoc);

      // Console log the stored data
      console.error('User stored in RxDB:', userDoc);

      const allUsers: RxDocument<UserDocument>[] = await userCollection
        .find()
        .exec();
      console.error(
        'All users in DB:',
        allUsers.map((doc: RxDocument<UserDocument>) => doc.toJSON()),
      );
    } catch (error) {
      console.error('Error storing user in RxDB:', error);
    }
  }

  async getCurrentUser(): Promise<UserDocument | null> {
    try {
      const { userCollection }: { userCollection: RxCollection<UserDocument> } =
        await this.getCollectionAndDB();

      const users: RxDocument<UserDocument>[] = await userCollection
        .find()
        .exec();
      return users.length > 0 ? users[0].toJSON() : null;
    } catch (error) {
      console.error('Error fetching user from RxDB:', error);
      return null;
    }
  }

  async clearUser(): Promise<void> {
    try {
      const { userCollection }: { userCollection: RxCollection<UserDocument> } =
        await this.getCollectionAndDB();

      await userCollection.remove();
      console.error('User data cleared from RxDB');
    } catch (error) {
      console.error('Error clearing user from RxDB:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.clearUser();
      console.error('User logged out and data cleared from RxDB');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  getCurrentUser$(): Observable<UserDocument | null> {
    return from(this.getCurrentUser());
  }

  clearUser$(): Observable<void> {
    return from(this.clearUser());
  }
}
