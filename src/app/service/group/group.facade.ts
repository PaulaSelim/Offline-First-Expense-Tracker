import { computed, inject, Injectable, Signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { switchMap, take } from 'rxjs';
import { User } from '../../core/api/authApi/authApi.model';
import {
  Group,
  GroupListResponse,
  GroupMember,
  GroupMemberRequest,
  GroupMemberResponse,
  GroupRequest,
  GroupResponse,
  GroupRole,
} from '../../core/api/groupApi/groupApi.model';
import { GroupApiService } from '../../core/api/groupApi/groupApi.service';
import {
  groupError,
  groupLoading,
  groupMembers,
  groups,
  selectedGroup,
  setGroupError,
  setGroupLoading,
  setGroupMembers,
  setGroupPagination,
  setGroups,
  setSelectedGroup,
} from '../../core/state-management/group.state';
import { GroupDBState } from '../../core/state-management/RxDB/group/groupDB.state';
import { AuthFacade } from '../auth/auth.facade';
import { SyncFacade } from '../sync/sync.facade';

@Injectable({ providedIn: 'root' })
export class GroupFacade {
  private readonly groupApi: GroupApiService = inject(GroupApiService);
  private readonly authFacade: AuthFacade = inject(AuthFacade);
  private readonly syncFacade: SyncFacade = inject(SyncFacade);
  private readonly toast: ToastrService = inject(ToastrService);
  private readonly groupDB: GroupDBState = inject(GroupDBState);

  private readonly _groups: Signal<Group[]> = computed(() => groups());
  private readonly _selectedGroup: Signal<Group | null> = computed(() =>
    selectedGroup(),
  );
  private readonly _groupMembers: Signal<GroupMember[]> = computed(() =>
    groupMembers(),
  );

  getGroups(): Signal<Group[]> {
    return this._groups;
  }

  private readonly isBackendAlive: () => Promise<boolean> = () =>
    this.syncFacade.isBackendAlive();

  private refreshLocalGroups(): void {
    this.groupDB
      .getAllGroups$()
      .pipe(take(1))
      .subscribe({
        next: (localGroups: Group[]) => {
          setGroups(localGroups);
        },
        error: () => {
          this.toast.error('Failed to load local groups.');
        },
      });
  }

  async fetchGroups(): Promise<void> {
    setGroupLoading(true);
    setGroupError(null);

    try {
      let localGroups: Group[] = [];

      try {
        localGroups = await Promise.race([
          new Promise<Group[]>(
            (
              resolve: (value: Group[]) => void,
              reject: (reason?: unknown) => void,
            ) => {
              this.groupDB
                .getAllGroups$()
                .pipe(take(1))
                .subscribe({
                  next: (groups: Group[]) => resolve(groups || []),
                  error: (error: unknown) => reject(error),
                });
            },
          ),
          new Promise<Group[]>(
            (_: unknown, reject: (reason?: unknown) => void) =>
              setTimeout(() => reject(new Error('Database timeout')), 2000),
          ),
        ]);
      } catch (error: unknown) {
        const err: Error = error as Error;
        setGroupError(err.message || 'Failed to load local groups');
      }

      setGroups(localGroups);

      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        setGroupLoading(false);
        return;
      }

      this.groupApi
        .getGroups()
        .pipe(take(1))
        .subscribe({
          next: (res: GroupListResponse) => {
            const serverGroups: Group[] = res.data.groups;

            this.syncGroupsToDatabase(serverGroups);

            setGroups(serverGroups);
            setGroupPagination(res.data.pagination);
            setGroupLoading(false);
          },
          error: () => {
            if (localGroups.length === 0) {
              setGroupError('Failed to load groups');
              this.toast.error('Could not load groups');
            } else {
              this.toast.info('Using cached groups (offline mode)');
            }
            setGroupLoading(false);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to load local groups');
    }
  }

  private syncGroupsToDatabase(groups: Group[]): void {
    groups.forEach((group: Group) => {
      try {
        this.groupDB.addOrUpdateGroup$(group).pipe(take(1)).subscribe();
      } catch (error: unknown) {
        const err: Error = error as Error;
        setGroupError(err.message || 'Failed to load local groups');
      }
    });
  }
  async fetchGroupById(groupId: string): Promise<void> {
    setGroupLoading(true);
    setGroupError(null);

    try {
      const localGroup: Group | null = await new Promise<Group | null>(
        (resolve: (value: Group | null) => void) => {
          this.groupDB
            .getGroupById$(groupId)
            .pipe(take(1))
            .subscribe({
              next: (group: Group | null) => resolve(group),
              error: () => resolve(null),
            });
        },
      );

      if (localGroup) {
        setSelectedGroup(localGroup);
      }

      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        setGroupLoading(false);
        return;
      }

      this.groupApi
        .getGroupById(groupId)
        .pipe(take(1))
        .subscribe({
          next: (res: GroupResponse) => {
            const serverGroup: Group = res.data.group;
            setSelectedGroup(serverGroup);

            this.groupDB
              .addOrUpdateGroup$(serverGroup)
              .pipe(take(1))
              .subscribe();
            setGroupLoading(false);
          },
          error: () => {
            if (!localGroup) {
              setGroupError('Group not found');
              this.toast.error('Group not found');
            }
            setGroupLoading(false);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to load local groups');
    }
  }

  createGroup(data: GroupRequest): void {
    setGroupLoading(true);
    setGroupError(null);

    const localGroup: Group = {
      ...data,
      id: crypto.randomUUID(),
      created_by: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      member_count: 1,
      user_role: GroupRole.ADMIN,
    };

    this.groupDB
      .addOrUpdateGroup$(localGroup)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toast.success('Group created locally!');
          this.refreshLocalGroups();
          this.syncCreateGroup(data, localGroup.id);
        },
        error: () => {
          this.toast.error('Failed to create group locally');
          setGroupLoading(false);
        },
      });
  }

  private async syncCreateGroup(
    data: GroupRequest,
    localId: string,
  ): Promise<void> {
    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        setGroupLoading(false);
        return;
      }

      this.groupApi
        .createGroup(data)
        .pipe(take(1))
        .subscribe({
          next: (res: GroupResponse) => {
            const serverGroup: Group = res.data.group;

            this.groupDB
              .removeGroupById$(localId)
              .pipe(
                switchMap(() => this.groupDB.addOrUpdateGroup$(serverGroup)),
                take(1),
              )
              .subscribe(() => {
                this.refreshLocalGroups();
                this.toast.success('Group synced with server!');
                setGroupLoading(false);
              });
          },
          error: () => {
            this.toast.warning('Group saved locally, will sync when online');
            setGroupLoading(false);
          },
          complete: () => {
            this.fetchGroups();
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to sync group creation');
      setGroupLoading(false);
    }
  }

  async updateGroup(groupId: string, data: GroupRequest): Promise<void> {
    setGroupLoading(true);
    setGroupError(null);

    try {
      const currentGroup: Group | null = await new Promise<Group | null>(
        (resolve: (value: Group | null) => void) => {
          this.groupDB
            .getGroupById$(groupId)
            .pipe(take(1))
            .subscribe({
              next: (group: Group | null) => resolve(group),
              error: () => resolve(null),
            });
        },
      );

      if (!currentGroup) {
        this.toast.error('Group not found locally');
        setGroupLoading(false);
        return;
      }

      const updatedGroup: Group = {
        ...currentGroup,
        ...data,
        updated_at: new Date().toISOString(),
      };

      this.groupDB
        .addOrUpdateGroup$(updatedGroup)
        .pipe(take(1))
        .subscribe({
          next: () => {
            setSelectedGroup(updatedGroup);
            this.refreshLocalGroups();
            this.toast.success('Group updated locally!');

            this.syncUpdateGroup(groupId, data);
          },
          error: () => {
            this.toast.error('Failed to update group locally');
            setGroupLoading(false);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to load local groups');
    }
  }

  private async syncUpdateGroup(
    groupId: string,
    data: GroupRequest,
  ): Promise<void> {
    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        setGroupLoading(false);
        return;
      }

      this.groupApi
        .updateGroup(groupId, data)
        .pipe(take(1))
        .subscribe({
          next: (res: GroupResponse) => {
            const serverGroup: Group = res.data.group;
            setSelectedGroup(serverGroup);

            this.groupDB
              .addOrUpdateGroup$(serverGroup)
              .pipe(take(1))
              .subscribe(() => {
                this.refreshLocalGroups();
                this.toast.success('Group synced with server!');
                setGroupLoading(false);
              });
          },
          error: () => {
            this.toast.warning('Group updated locally, will sync when online');
            setGroupLoading(false);
          },
          complete: () => {
            this.fetchGroups();
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to load local groups');
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    setGroupLoading(true);
    setGroupError(null);

    try {
      this.groupDB
        .removeGroupById$(groupId)
        .pipe(take(1))
        .subscribe({
          next: () => {
            setSelectedGroup(null);
            this.refreshLocalGroups();
            this.toast.success('Group deleted locally!');

            this.syncDeleteGroup(groupId);
          },
          error: () => {
            this.toast.error('Failed to delete group locally');
            setGroupLoading(false);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to load local groups');
    }
  }

  private async syncDeleteGroup(groupId: string): Promise<void> {
    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        setGroupLoading(false);
        return;
      }

      this.groupApi
        .deleteGroup(groupId)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.toast.success('Group deletion synced with server!');
            setGroupLoading(false);
          },
          error: () => {
            this.toast.warning(
              'Group deleted locally, will sync deletion when online',
            );
            setGroupLoading(false);
          },
          complete: () => {
            this.fetchGroups();
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to load local groups');
    }
  }

  async fetchGroupMembers(groupId: string): Promise<void> {
    setGroupLoading(true);
    setGroupError(null);
    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        this.toast.info('Member data unavailable offline');
        const currentUser: User | null = this.authFacade.getCurrentUser()();
        if (currentUser) {
          const userAsMember: GroupMember = {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            role: GroupRole.MEMBER,
          };
          setGroupMembers([userAsMember]);
        } else {
          setGroupMembers([]);
        }
        setGroupLoading(false);
        return;
      }

      this.groupApi
        .getGroupMembers(groupId)
        .pipe(take(1))
        .subscribe({
          next: (res: GroupMemberResponse) => {
            setGroupMembers(res.data.members);
            setGroupPagination(res.data.pagination);
            setGroupLoading(false);
          },
          error: () => {
            setGroupError('Could not load members');
            this.toast.error('Failed to load group members');
            setGroupLoading(false);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to load local groups');
    }
  }

  async addMember(groupId: string, member: GroupMemberRequest): Promise<void> {
    setGroupLoading(true);
    setGroupError(null);

    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        this.toast.error('Cannot add members while offline');
        setGroupLoading(false);
        return;
      }

      this.groupApi
        .addGroupMember(groupId, member)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.toast.success('Member added!');
            this.fetchGroupMembers(groupId);
          },
          error: () => {
            setGroupError('Failed to add member');
            this.toast.error('Could not add member');
            setGroupLoading(false);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to load local groups');
    }
  }

  async updateMemberRole(
    groupId: string,
    memberId: string,
    role: GroupRole,
  ): Promise<void> {
    setGroupLoading(true);
    setGroupError(null);

    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        this.toast.error('Cannot update member roles while offline');
        setGroupLoading(false);
        return;
      }

      this.groupApi
        .updateGroupMemberRole(groupId, memberId, role)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.toast.success('Role updated');
            this.fetchGroupMembers(groupId);
          },
          error: () => {
            setGroupError('Failed to update role');
            this.toast.error('Could not change member role');
            setGroupLoading(false);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to load local groups');
    }
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    setGroupLoading(true);
    setGroupError(null);

    try {
      const isOnline: boolean = await this.isBackendAlive();

      if (!isOnline) {
        this.toast.error('Cannot remove members while offline');
        setGroupLoading(false);
        return;
      }

      this.groupApi
        .removeGroupMember(groupId, memberId)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.toast.success('Member removed');
            this.fetchGroupMembers(groupId);
          },
          error: () => {
            setGroupError('Could not remove member');
            this.toast.error('Failed to remove member');
            setGroupLoading(false);
          },
        });
    } catch (error: unknown) {
      const err: Error = error as Error;
      setGroupError(err.message || 'Failed to load local groups');
    }
  }

  getError(): typeof groupError {
    return groupError;
  }

  setError(message: string): void {
    setGroupError(message);
  }

  isLoading(): typeof groupLoading {
    return groupLoading;
  }

  setLoading(value: boolean): void {
    setGroupLoading(value);
  }

  getSelectedGroup(): Signal<Group | null> {
    return this._selectedGroup;
  }

  getGroupMembers(): Signal<GroupMember[]> {
    return this._groupMembers;
  }
}
