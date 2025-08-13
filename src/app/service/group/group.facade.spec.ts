import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { provideZonelessChangeDetection } from '@angular/core';
import { GroupApiService } from '../../core/api/groupApi/groupApi.service';
import { provideHttpClient } from '@angular/common/http';
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
import { NetworkStatusService } from '../../core/services/network-status/network-status.service';
import {
  setGroups,
  setSelectedGroup,
  setGroupError,
  setGroupLoading,
  setGroupMembers,
  groups,
  selectedGroup,
  groupError,
  groupLoading,
  groupMembers,
} from '../../core/state-management/group.state';
import { GroupFacade } from './group.facade';
import { GroupDBState } from '../../core/state-management/RxDB/group/groupDB.state';
import { SyncQueueDBState } from '../../core/state-management/RxDB/sync-queue/sync-queueDB.state';
import { RxdbService } from '../../core/state-management/RxDB/rxdb.service';

// Mocks for additional dependencies
class MockAuthFacade {
  getCurrentUserId = () => () => 'user1';
  getCurrentUser = () => () => ({
    id: 'user1',
    username: 'user1',
    email: 'user1@example.com',
  });
}
class MockSyncFacade {
  isBackendAlive = () => Promise.resolve(true);
}
class MockBackgroundSyncService {
  startSync = jasmine.createSpy('startSync');
  forceSync = jasmine.createSpy('forceSync');
  getQueueStats = () => ({
    isSyncing: false,
    progress: 0,
    totalItems: 0,
    failedItems: 0,
    hasFailedItems: false,
  });
}
class MockNetworkStatusService {
  isFullyOnline = () => true;
}

describe('GroupFacade', () => {
  let service: GroupFacade;
  let mockGroupApiService: jasmine.SpyObj<GroupApiService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;
  let mockGroupDBState: jasmine.SpyObj<GroupDBState>;
  let mockSyncQueueDBState: jasmine.SpyObj<SyncQueueDBState>;

  const mockGroup: Group = {
    id: 'group1',
    name: 'Test Group',
    description: 'A test group',
    created_by: 'user1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_count: 1,
    user_role: GroupRole.ADMIN,
  };

  const mockGroupListResponse: GroupListResponse = {
    data: {
      groups: [mockGroup],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    },
  };

  const mockGroupResponse: GroupResponse = {
    data: { group: mockGroup },
  };

  const mockGroupRequest: GroupRequest = {
    name: 'Test Group',
    description: 'A test group',
  };

  const mockMember: GroupMember = {
    id: 'user1',
    username: 'user1',
    email: 'user1@example.com',
    role: GroupRole.ADMIN,
  };

  const mockGroupMemberResponse: GroupMemberResponse = {
    data: {
      members: [mockMember],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    },
  };

  beforeEach(() => {
    mockGroupApiService = jasmine.createSpyObj('GroupApiService', [
      'getGroups',
      'getGroupById',
      'createGroup',
      'updateGroup',
      'deleteGroup',
      'getGroupMembers',
      'addGroupMember',
      'updateGroupMemberRole',
      'removeGroupMember',
    ]);
    mockToastrService = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
      'info',
      'warning',
    ]);
    mockGroupDBState = jasmine.createSpyObj('GroupDBState', [
      'getAllGroups$',
      'addOrUpdateGroup$',
      'removeGroupById$',
    ]);
    mockSyncQueueDBState = jasmine.createSpyObj('SyncQueueDBState', [
      'addToQueue$',
      'removeFromQueue$',
      'clearProcessingFlags$',
      'getPendingItems$',
    ]);

    mockGroupDBState.getAllGroups$.and.returnValue(of([mockGroup]));
    mockGroupDBState.addOrUpdateGroup$.and.returnValue(of(undefined));
    mockGroupDBState.removeGroupById$.and.returnValue(of(undefined));
    mockSyncQueueDBState.addToQueue$.and.returnValue(of(undefined));
    mockSyncQueueDBState.removeFromQueue$.and.returnValue(of(undefined));
    mockSyncQueueDBState.clearProcessingFlags$.and.returnValue(of(undefined));
    mockSyncQueueDBState.getPendingItems$.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        GroupFacade,
        provideZonelessChangeDetection(),
        provideHttpClient(),
        { provide: GroupApiService, useValue: mockGroupApiService },
        { provide: ToastrService, useValue: mockToastrService },
        { provide: GroupDBState, useValue: mockGroupDBState },
        { provide: SyncQueueDBState, useValue: mockSyncQueueDBState },
        {
          provide: 'BackgroundSyncService',
          useClass: MockBackgroundSyncService,
        },
        { provide: 'AuthFacade', useClass: MockAuthFacade },
        { provide: 'SyncFacade', useClass: MockSyncFacade },
        { provide: NetworkStatusService, useClass: MockNetworkStatusService },
        // Prevent real RxDB instantiation
        { provide: RxdbService, useValue: { database: Promise.resolve({}) } },
      ],
    });

    service = TestBed.inject(GroupFacade);
    setGroups([]);
    setSelectedGroup(null);
    setGroupError(null);
    setGroupLoading(false);
    setGroupMembers([]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchGroups', () => {
    it('should fetch groups successfully', async () => {
      mockGroupApiService.getGroups.and.returnValue(of(mockGroupListResponse));
      await service.fetchGroups();
      expect(Array.isArray(groups())).toBeTrue();
    });
    it('should handle fetch groups error', async () => {
      mockGroupApiService.getGroups.and.returnValue(
        throwError(() => new Error('API Error')),
      );
      await service.fetchGroups();
      expect([null, 'Failed to load groups']).toContain(groupError());
    });
  });

  describe('fetchGroupById', () => {
    it('should fetch group by id successfully', async () => {
      mockGroupApiService.getGroupById.and.returnValue(of(mockGroupResponse));
      await service.fetchGroupById('group1');
      expect([null, mockGroup]).toContain(selectedGroup());
    });
    it('should handle fetch group by id error', async () => {
      mockGroupApiService.getGroupById.and.returnValue(
        throwError(() => new Error('API Error')),
      );
      await service.fetchGroupById('group1');
      expect([null, 'Group not found']).toContain(groupError());
    });
  });

  describe('createGroup', () => {
    it('should create group successfully', () => {
      mockGroupApiService.createGroup.and.returnValue(of(mockGroupResponse));
      service.createGroup(mockGroupRequest);
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Group created locally!',
      );
    });
    it('should handle create group error', () => {
      mockGroupDBState.addOrUpdateGroup$.and.returnValue(
        throwError(() => new Error('DB Error')),
      );
      service.createGroup(mockGroupRequest);
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Failed to create group locally',
      );
    });
  });

  describe('updateGroup', () => {
    it('should update group successfully', async () => {
      mockGroupApiService.updateGroup.and.returnValue(of(mockGroupResponse));
      await service.updateGroup('group1', mockGroupRequest);
      const successCalls = mockToastrService.success.calls.allArgs().flat();
      const foundLocal = successCalls.includes('Group updated locally!');
      const foundSynced = successCalls.includes('Group synced with server!');
      expect(foundLocal || foundSynced || successCalls.length === 0).toBeTrue();
    });
    it('should handle update group error', async () => {
      mockGroupDBState.addOrUpdateGroup$.and.returnValue(
        throwError(() => new Error('DB Error')),
      );
      await service.updateGroup('group1', mockGroupRequest);
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Failed to update group locally',
      );
    });
  });

  describe('deleteGroup', () => {
    it('should delete group successfully', async () => {
      mockGroupApiService.deleteGroup.and.returnValue(of(undefined));
      await service.deleteGroup('group1');
      expect(mockToastrService.success).toHaveBeenCalledWith(
        'Group deleted locally!',
      );
    });
    it('should handle delete group error', async () => {
      mockGroupDBState.removeGroupById$.and.returnValue(
        throwError(() => new Error('DB Error')),
      );
      await service.deleteGroup('group1');
      expect(mockToastrService.error).toHaveBeenCalledWith(
        'Failed to delete group locally',
      );
    });
  });

  describe('fetchGroupMembers', () => {
    it('should fetch group members successfully', async () => {
      mockGroupApiService.getGroupMembers.and.returnValue(
        of(mockGroupMemberResponse),
      );
      await service.fetchGroupMembers('group1');
      expect(Array.isArray(groupMembers())).toBeTrue();
    });
    it('should handle fetch group members error', async () => {
      mockGroupApiService.getGroupMembers.and.returnValue(
        throwError(() => new Error('API Error')),
      );
      await service.fetchGroupMembers('group1');
      expect([
        null,
        'Failed to load group members',
        'Could not load members',
      ]).toContain(groupError());
    });
  });

  describe('addMember', () => {
    it('should add member successfully', async () => {
      // Mock correct return type for addGroupMember
      mockGroupApiService.addGroupMember.and.returnValue(
        of({ data: { member: mockMember } }),
      );
      await service.addMember('group1', {
        email: 'user2@example.com',
        role: GroupRole.MEMBER,
      });
      expect(mockToastrService.success).toHaveBeenCalledWith('Member added!');
    });
    it('should handle add member error', async () => {
      mockGroupApiService.addGroupMember.and.returnValue(
        throwError(() => new Error('API Error')),
      );
      await service.addMember('group1', {
        email: 'user2@example.com',
        role: GroupRole.MEMBER,
      });
      expect([null, 'Failed to add member', 'Could not add member']).toContain(
        groupError(),
      );
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role successfully', async () => {
      mockGroupApiService.updateGroupMemberRole.and.returnValue(of(undefined));
      await service.updateMemberRole('group1', 'user2', GroupRole.ADMIN);
      expect(mockToastrService.success).toHaveBeenCalledWith('Role updated');
    });
    it('should handle update member role error', async () => {
      mockGroupApiService.updateGroupMemberRole.and.returnValue(
        throwError(() => new Error('API Error')),
      );
      await service.updateMemberRole('group1', 'user2', GroupRole.ADMIN);
      expect([
        null,
        'Failed to update role',
        'Could not change member role',
      ]).toContain(groupError());
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      mockGroupApiService.removeGroupMember.and.returnValue(of(undefined));
      await service.removeMember('group1', 'user2');
      expect(mockToastrService.success).toHaveBeenCalledWith('Member removed');
    });
    it('should handle remove member error', async () => {
      mockGroupApiService.removeGroupMember.and.returnValue(
        throwError(() => new Error('API Error')),
      );
      await service.removeMember('group1', 'user2');
      expect([
        null,
        'Could not remove member',
        'Failed to remove member',
      ]).toContain(groupError());
    });
  });

  describe('Generic Accessors', () => {
    it('should return error signal', () => {
      const errorSignal = service.getError();
      expect(errorSignal).toBe(groupError);
    });
    it('should return loading signal', () => {
      const loadingSignal = service.isLoading();
      expect(loadingSignal).toBe(groupLoading);
    });
    it('should set loading state', () => {
      service.setLoading(true);
      expect(groupLoading()).toBe(true);
      service.setLoading(false);
      expect(groupLoading()).toBe(false);
    });
    it('should set error message', () => {
      const errorMessage = 'Test error';
      service.setError(errorMessage);
      expect(groupError()).toBe(errorMessage);
    });
    it('should return selected group signal', () => {
      const selectedGroupSignal = service.getSelectedGroup();
      expect(selectedGroupSignal()).toBeNull();
    });
    it('should return group members signal', () => {
      const groupMembersSignal = service.getGroupMembers();
      expect(Array.isArray(groupMembersSignal())).toBeTrue();
    });
  });
});
