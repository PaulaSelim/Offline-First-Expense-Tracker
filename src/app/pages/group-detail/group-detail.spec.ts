import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Group,
  GroupMember,
  GroupRole,
} from '../../core/api/groupApi/groupApi.model';
import { GroupFacade } from '../../service/group/group.facade';
import { GroupDetail } from './group-detail';

describe('GroupDetail', () => {
  let component: GroupDetail;
  let fixture: ComponentFixture<GroupDetail>;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockGroupFacade: any;
  const testGroup: Group = {
    id: 'g1',
    name: 'G',
    description: '',
    created_by: '',
    created_at: '2025-08-05',
    updated_at: '',
    member_count: 2,
    user_role: GroupRole.ADMIN,
  };
  const members: GroupMember[] = [
    { id: 'u1', username: 'A', email: 'a@x', role: GroupRole.MEMBER },
  ];

  beforeEach(async () => {
    // Mock services and route
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockActivatedRoute = { snapshot: { paramMap: { get: () => 'g1' } } };
    mockGroupFacade = {
      getSelectedGroup: () => signal(testGroup),
      getGroupMembers: () => signal(members),
      isLoading: () => signal(false),
      fetchGroupById: jasmine.createSpy('fetchGroupById'),
      fetchGroupMembers: jasmine.createSpy('fetchGroupMembers'),
      deleteGroup: jasmine.createSpy('deleteGroup'),
      removeMember: jasmine.createSpy('removeMember'),
      updateMemberRole: jasmine.createSpy('updateMemberRole'),
      addMember: jasmine.createSpy('addMember'),
    };
    await TestBed.configureTestingModule({
      imports: [GroupDetail],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: GroupFacade, useValue: mockGroupFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load group data on init when id present', () => {
    // groupId is set by ngOnInit; fetch methods called
    expect(mockGroupFacade.fetchGroupById).toHaveBeenCalledWith('g1');
    expect(mockGroupFacade.fetchGroupMembers).toHaveBeenCalledWith('g1');
  });

  it('should navigate to dashboard if no id in route', async () => {
    // override route to return null
    mockActivatedRoute.snapshot.paramMap.get = () => '';
    await component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to edit page', () => {
    component.onEditGroup();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/groups', 'g1', 'edit']);
  });

  describe('onDeleteGroup', () => {
    it('should delete and navigate when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onDeleteGroup();
      expect(mockGroupFacade.deleteGroup).toHaveBeenCalledWith('g1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
    it('should not delete when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onDeleteGroup();
      expect(mockGroupFacade.deleteGroup).not.toHaveBeenCalled();
    });
  });

  describe('member actions', () => {
    it('should remove member when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onRemoveMember('u1', 'a@x');
      expect(mockGroupFacade.removeMember).toHaveBeenCalledWith('g1', 'u1');
    });
    it('should not remove on cancel', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onRemoveMember('u1', 'a@x');
      expect(mockGroupFacade.removeMember).not.toHaveBeenCalled();
    });

    it('should update member role when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onUpdateMemberRole('u1', GroupRole.MEMBER);
      expect(mockGroupFacade.updateMemberRole).toHaveBeenCalledWith(
        'g1',
        'u1',
        GroupRole.ADMIN,
      );
    });
    it('should not update role on cancel', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onUpdateMemberRole('u1', GroupRole.MEMBER);
      expect(mockGroupFacade.updateMemberRole).not.toHaveBeenCalled();
    });
  });

  describe('onAddMember', () => {
    let promptSpy: jasmine.Spy;
    beforeEach(() => {
      promptSpy = spyOn(window, 'prompt');
    });
    it('should add when prompt returns email', () => {
      promptSpy.and.returnValue('new@x');
      component.onAddMember();
      expect(mockGroupFacade.addMember).toHaveBeenCalledWith('g1', {
        email: 'new@x',
        role: GroupRole.MEMBER,
      });
    });
    it('should not add when prompt empty', () => {
      promptSpy.and.returnValue('  ');
      component.onAddMember();
      expect(mockGroupFacade.addMember).not.toHaveBeenCalled();
    });
  });

  it('should navigate to expenses page', () => {
    component.onViewExpenses();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/groups',
      'g1',
      'expenses',
    ]);
  });

  it('should get admin status correctly', () => {
    expect(component.isCurrentUserAdmin()).toBeTrue();
  });

  it('should format date', () => {
    const date = component.getFormattedDate('2025-08-05T00:00:00Z');
    expect(date).toContain('2025');
  });
});
