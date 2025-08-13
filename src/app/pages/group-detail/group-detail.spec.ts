import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
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
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const group: Group = {
    id: '1',
    name: 'Test Group',
    description: 'desc',
    created_by: 'user',
    created_at: '2023-01-01',
    updated_at: '2023-01-02',
    member_count: 2,
    user_role: GroupRole.ADMIN,
  };
  const members: GroupMember[] = [
    { id: 'm1', email: 'a@b.com', username: 'A', role: GroupRole.ADMIN },
    { id: 'm2', email: 'b@b.com', username: 'B', role: GroupRole.MEMBER },
  ];

  beforeEach(async () => {
    mockGroupFacade = jasmine.createSpyObj('GroupFacade', [
      'getSelectedGroup',
      'getGroupMembers',
      'isLoading',
      'fetchGroupById',
      'fetchGroupMembers',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy().and.returnValue('1'),
          has: () => true,
          getAll: () => [],
          keys: [],
        },
      },
    };

    mockGroupFacade.getSelectedGroup.and.returnValue(signal(group));
    mockGroupFacade.getGroupMembers.and.returnValue(signal(members));
    mockGroupFacade.isLoading.and.returnValue(signal(false));

    await TestBed.configureTestingModule({
      imports: [GroupDetail],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GroupFacade, useValue: mockGroupFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchGroupById and fetchGroupMembers on init', () => {
    expect(mockGroupFacade.fetchGroupById).toHaveBeenCalledWith('1');
    expect(mockGroupFacade.fetchGroupMembers).toHaveBeenCalledWith('1');
  });

  it('should navigate to dashboard if no groupId', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('');
    const comp = TestBed.createComponent(GroupDetail).componentInstance;
    comp.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to group expenses on onViewExpenses', () => {
    component['groupId'] = '1';
    component.onViewExpenses();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/groups',
      '1',
      'expenses',
    ]);
  });
});
