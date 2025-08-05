import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Group,
  GroupMember,
  GroupRole,
} from '../../../../core/api/groupApi/groupApi.model';
import { GroupFacade } from '../../../../service/group/group.facade';
import { GroupMemberList } from './group-member-list';

describe('GroupMemberList', () => {
  let component: GroupMemberList;
  let fixture: ComponentFixture<GroupMemberList>;
  let mockGroupFacade: any;
  const testGroup: Group = {
    id: 'g1',
    name: 'G',
    description: '',
    created_by: '',
    created_at: '',
    updated_at: '',
    member_count: 2,
    user_role: GroupRole.ADMIN,
  };
  const memberList: GroupMember[] = [
    { id: 'u1', username: 'Alice', email: 'a@x.com', role: GroupRole.MEMBER },
    { id: 'u2', username: 'Bob', email: 'b@x.com', role: GroupRole.ADMIN },
  ];

  beforeEach(async () => {
    mockGroupFacade = {
      getGroupMembers: () => signal(memberList),
      isLoading: () => signal(false),
      getSelectedGroup: () => signal(testGroup),
      updateMemberRole: jasmine.createSpy('updateMemberRole'),
      removeMember: jasmine.createSpy('removeMember'),
      addMember: jasmine.createSpy('addMember'),
    };
    await TestBed.configureTestingModule({
      imports: [GroupMemberList],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GroupFacade, useValue: mockGroupFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupMemberList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute isCurrentUserAdmin correctly', () => {
    expect(component.isCurrentUserAdmin()).toBeTrue();
  });

  describe('onToggleRole', () => {
    it('should update member role when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onToggleRole('u1');
      expect(mockGroupFacade.updateMemberRole).toHaveBeenCalledWith(
        'g1',
        'u1',
        GroupRole.ADMIN,
      );
    });
    it('should not update when not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onToggleRole('u1');
      expect(mockGroupFacade.updateMemberRole).not.toHaveBeenCalled();
    });
  });

  describe('onRemoveMember', () => {
    it('should remove member when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onRemoveMember('u2');
      expect(mockGroupFacade.removeMember).toHaveBeenCalledWith('g1', 'u2');
    });
    it('should not remove when not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onRemoveMember('u2');
      expect(mockGroupFacade.removeMember).not.toHaveBeenCalled();
    });
  });

  describe('onAddMember', () => {
    let promptSpy: jasmine.Spy;
    beforeEach(() => {
      promptSpy = spyOn(window, 'prompt');
    });

    it('should add member when prompt returns email', () => {
      promptSpy.and.returnValue('new@x.com');
      component.onAddMember();
      expect(mockGroupFacade.addMember).toHaveBeenCalledWith('g1', {
        email: 'new@x.com',
        role: GroupRole.MEMBER,
      });
    });

    it('should not add when prompt is empty or cancelled', () => {
      promptSpy.and.returnValue('   ');
      component.onAddMember();
      expect(mockGroupFacade.addMember).not.toHaveBeenCalled();
      promptSpy.and.returnValue(null);
      component.onAddMember();
      expect(mockGroupFacade.addMember).not.toHaveBeenCalled();
    });
  });
});
