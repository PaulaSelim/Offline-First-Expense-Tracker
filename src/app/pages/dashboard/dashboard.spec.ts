import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';

import { signal } from '@angular/core';
import { Group, GroupRole } from '../../core/api/groupApi/groupApi.model';
import { AuthFacade } from '../../service/auth/auth.facade';
import { GroupFacade } from '../../service/group/group.facade';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;
  let mockAuthFacade: jasmine.SpyObj<AuthFacade>;

  const mockGroups: Group[] = [
    {
      id: '1',
      name: 'Test Group 1',
      description: 'Description 1',
      created_by: 'user1',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
      member_count: 5,
      user_role: GroupRole.ADMIN,
    },
    {
      id: '2',
      name: 'Test Group 2',
      description: 'Description 2',
      created_by: 'user2',
      created_at: '2024-01-02T10:00:00Z',
      updated_at: '2024-01-02T10:00:00Z',
      member_count: 3,
      user_role: GroupRole.MEMBER,
    },
  ];

  beforeEach(async () => {
    mockGroupFacade = jasmine.createSpyObj('GroupFacade', [
      'getGroups',
      'createGroup',
      'fetchGroups',
      'deleteGroup',
      'updateGroup',
      'fetchGroupById',
      'isLoading',
      'getError',
    ]);
    mockGroupFacade.getGroups.and.returnValue(signal(mockGroups));
    mockGroupFacade.isLoading.and.returnValue(signal(false));
    mockGroupFacade.getError.and.returnValue(signal(null));

    mockAuthFacade = jasmine.createSpyObj('AuthFacade', [
      'getCurrentUsername',
      'getCurrentUserEmail',
      'getProfile',
      'isAuthenticated',
      'getCurrentUser',
    ]);
    mockAuthFacade.getCurrentUsername.and.returnValue(signal('testuser'));
    mockAuthFacade.getCurrentUserEmail.and.returnValue(
      signal('test@example.com'),
    );
    mockAuthFacade.isAuthenticated.and.returnValue(signal(true));
    mockAuthFacade.getCurrentUser.and.returnValue(signal(null));

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([
          { path: '', component: {} as any },
          { path: 'group/:id', component: {} as any },
        ]),
        { provide: GroupFacade, useValue: mockGroupFacade },
        { provide: AuthFacade, useValue: mockAuthFacade },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get group list from GroupFacade', () => {
    expect(component.groupList()).toEqual(mockGroups);
  });

  it('should have access to the groupProvider', () => {
    expect(component['groupProvider']).toBeDefined();
  });

  it('should handle empty group list', () => {
    const emptyGroups: Group[] = [];
    mockGroupFacade.getGroups.and.returnValue(signal(emptyGroups));

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;

    expect(component.groupList()).toEqual([]);
  });

  it('should call getGroups on component initialization', () => {
    expect(mockGroupFacade.getGroups).toHaveBeenCalled();
  });

  it('should display groups with correct structure', () => {
    const groups = component.groupList();
    expect(groups.length).toBe(2);
    expect(groups[0].name).toBe('Test Group 1');
    expect(groups[0].user_role).toBe(GroupRole.ADMIN);
    expect(groups[1].name).toBe('Test Group 2');
    expect(groups[1].user_role).toBe(GroupRole.MEMBER);
  });

  it('should handle groups with different roles', () => {
    const adminGroup = mockGroups.find((g) => g.user_role === GroupRole.ADMIN);
    const memberGroup = mockGroups.find(
      (g) => g.user_role === GroupRole.MEMBER,
    );

    expect(adminGroup).toBeDefined();
    expect(memberGroup).toBeDefined();
    expect(adminGroup?.user_role).toBe(GroupRole.ADMIN);
    expect(memberGroup?.user_role).toBe(GroupRole.MEMBER);
  });

  it('should handle groups with different member counts', () => {
    const groups = component.groupList();
    expect(groups[0].member_count).toBe(5);
    expect(groups[1].member_count).toBe(3);
  });

  it('should render dashboard header component', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const dashboardHeader = compiled.querySelector('app-dashboard-header');
    expect(dashboardHeader).toBeTruthy();
  });

  it('should render dashboard group list component', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const dashboardGroupList = compiled.querySelector(
      'app-dashboard-group-list',
    );
    expect(dashboardGroupList).toBeTruthy();
  });

  it('should have the correct CSS class on the main container', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const container = compiled.querySelector('.dashboard.container');
    expect(container).toBeTruthy();
  });
});
