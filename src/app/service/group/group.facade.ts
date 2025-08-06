import { computed, inject, Injectable, Signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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

@Injectable({ providedIn: 'root' })
export class GroupFacade {
  private readonly groupApi: GroupApiService = inject(GroupApiService);
  private readonly toast: ToastrService = inject(ToastrService);
  private readonly _groups: Signal<Group[]> = computed(() => groups());
  private readonly _selectedGroup: Signal<Group | null> = computed(() =>
    selectedGroup(),
  );
  private readonly _groupMembers: Signal<GroupMember[]> = computed(() =>
    groupMembers(),
  );

  private readonly groupDB: GroupDBState = inject(GroupDBState);

  getGroups(): Signal<Group[]> {
    return this._groups;
  }

  isOnline(): boolean {
    return window.navigator.onLine;
  }

  createGroup(data: GroupRequest): void {
    setGroupLoading(true);
    setGroupError(null);

    // Optimistically add to RxDB even if offline
    this.groupDB
      .addOrUpdateGroup$({
        ...data,
        id: crypto.randomUUID(), // Generate a temp ID if needed
        created_by: '', // Fill as appropriate
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 1, // Or default
      })
      .subscribe();

    if (!this.isOnline()) {
      setGroupError('Cannot create group while offline.');
      this.toast.error('You are offline.');
      setGroupLoading(false);
      return;
    }

    this.groupApi.createGroup(data).subscribe({
      next: (res: GroupResponse) => {
        const group: Group = res.data.group;

        // Optimistically add to RxDB
        this.groupDB.addOrUpdateGroup$(group).subscribe(); // RxDB triggers stream that updates state

        this.toast.success('Group created successfully!');
      },
      error: () => {
        setGroupError('Group creation failed.');
        this.toast.error('Group creation failed. Try again.');
      },
      complete: () => setGroupLoading(false),
    });
  }

  fetchGroups(): void {
    setGroupLoading(true);
    setGroupError(null);

    // Always update state from RxDB
    this.groupDB.getAllGroups$().subscribe({
      next: (groups: Group[]) => setGroups(groups),
      error: () => {
        setGroupError('Failed to load local groups.');
        this.toast.error('Could not load cached groups.');
      },
    });

    if (!this.isOnline()) {
      setGroupLoading(false);
      return;
    }

    // If online, fetch from API and sync into RxDB
    this.groupApi.getGroups().subscribe({
      next: (res: GroupListResponse) => {
        const groupList: Group[] = res.data.groups;

        // Save each group to RxDB
        groupList.forEach((group: Group) => {
          this.groupDB.addOrUpdateGroup$(group).subscribe(); // Fire and forget
        });

        // Pagination sync (optional)
        setGroupPagination(res.data.pagination);
      },
      error: () => {
        setGroupError('Failed to fetch groups.');
        this.toast.error('Failed to load groups.');
      },
      complete: () => setGroupLoading(false),
    });
  }

  fetchGroupById(groupId: string): void {
    setGroupLoading(true);
    setGroupError(null);

    this.groupApi.getGroupById(groupId).subscribe({
      next: (res: GroupResponse) => {
        setSelectedGroup(res.data.group);
      },
      error: () => {
        setGroupError('Group not found.');
        this.toast.error('Group not found.');
      },
      complete: () => setGroupLoading(false),
    });
  }

  updateGroup(groupId: string, data: GroupRequest): void {
    setGroupLoading(true);
    setGroupError(null);

    if (!this.isOnline()) {
      this.toast.error('Cannot update group while offline.');
      setGroupLoading(false);
      return;
    }

    this.groupApi.updateGroup(groupId, data).subscribe({
      next: (res: GroupResponse) => {
        const group: Group = res.data.group;

        this.groupDB.addOrUpdateGroup$(group).subscribe(); // Sync to local

        this.toast.success('Group updated successfully!');
        setSelectedGroup(group); // Optimistic update
      },
      error: () => {
        setGroupError('Update failed.');
        this.toast.error('Failed to update group.');
      },
      complete: () => setGroupLoading(false),
    });
  }

  deleteGroup(groupId: string): void {
    setGroupLoading(true);
    setGroupError(null);

    if (!this.isOnline()) {
      this.toast.error('You are offline.');
      setGroupLoading(false);
      return;
    }

    this.groupApi.deleteGroup(groupId).subscribe({
      next: () => {
        this.groupDB.removeGroupById$(groupId).subscribe(); // Sync local delete
        this.toast.success('Group deleted.');
        setSelectedGroup(null);
      },
      error: () => {
        setGroupError('Failed to delete group.');
        this.toast.error('Could not delete group.');
      },
      complete: () => setGroupLoading(false),
    });
  }

  fetchGroupMembers(groupId: string): void {
    setGroupLoading(true);
    setGroupError(null);

    this.groupApi.getGroupMembers(groupId).subscribe({
      next: (res: GroupMemberResponse) => {
        setGroupMembers(res.data.members);
        setGroupPagination(res.data.pagination);
      },
      error: () => {
        setGroupError('Could not load members.');
        this.toast.error('Failed to load group members.');
      },
      complete: () => setGroupLoading(false),
    });
  }

  addMember(groupId: string, member: GroupMemberRequest): void {
    setGroupLoading(true);
    setGroupError(null);

    this.groupApi.addGroupMember(groupId, member).subscribe({
      next: () => {
        this.toast.success('Member added!');
        this.fetchGroupMembers(groupId);
      },
      error: () => {
        setGroupError('Failed to add member.');
        this.toast.error('Could not add member.');
      },
      complete: () => setGroupLoading(false),
    });
  }

  updateMemberRole(groupId: string, memberId: string, role: GroupRole): void {
    setGroupLoading(true);
    setGroupError(null);

    this.groupApi.updateGroupMemberRole(groupId, memberId, role).subscribe({
      next: () => {
        this.toast.success('Role updated.');
        this.fetchGroupMembers(groupId);
      },
      error: () => {
        setGroupError('Failed to update role.');
        this.fetchGroupMembers(groupId);
        this.toast.error('Could not change member role.');
      },
      complete: () => setGroupLoading(false),
    });
  }

  removeMember(groupId: string, memberId: string): void {
    setGroupLoading(true);
    setGroupError(null);

    this.groupApi.removeGroupMember(groupId, memberId).subscribe({
      next: () => {
        this.toast.success('Member removed.');
        this.fetchGroupMembers(groupId);
      },
      error: () => {
        setGroupError('Could not remove member.');
        this.toast.error('Failed to remove member.');
      },
      complete: () => setGroupLoading(false),
    });
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
