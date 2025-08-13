import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DashboardGroupList } from './dashboard-group-list';
import { AuthFacade } from '../../../../service/auth/auth.facade';
import { GroupFacade } from '../../../../service/group/group.facade';
import { Group } from '../../../../core/api/groupApi/groupApi.model';
import { provideZonelessChangeDetection } from '@angular/core';
// Mocks
class MockGroupFacade {
  getGroups = jasmine
    .createSpy('getGroups')
    .and.returnValue(() => [
      { id: '1', name: 'Group 1' } as Group,
      { id: '2', name: 'Group 2' } as Group,
    ]);
  isLoading = jasmine.createSpy('isLoading').and.returnValue(() => false);
  getError = jasmine.createSpy('getError').and.returnValue(() => null);
  fetchGroups = jasmine.createSpy('fetchGroups');
  deleteGroup = jasmine.createSpy('deleteGroup');
}
class MockAuthFacade {
  getCurrentUsername = jasmine
    .createSpy('getCurrentUsername')
    .and.returnValue(() => 'testuser');
}
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('DashboardGroupList', () => {
  let component: DashboardGroupList;
  let fixture: ComponentFixture<DashboardGroupList>;
  let groupFacade: MockGroupFacade;
  let authFacade: MockAuthFacade;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardGroupList],
      providers: [
        { provide: GroupFacade, useClass: MockGroupFacade },
        provideZonelessChangeDetection(),
        { provide: AuthFacade, useClass: MockAuthFacade },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardGroupList);
    component = fixture.componentInstance;
    groupFacade = TestBed.inject(GroupFacade) as any;
    authFacade = TestBed.inject(AuthFacade) as any;
    router = TestBed.inject(Router) as any;
    spyOn(window, 'confirm').and.returnValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchGroups on init', () => {
    expect(groupFacade.fetchGroups).toHaveBeenCalled();
  });

  it('should expose username signal', () => {
    expect(component.username()).toBe('testuser');
  });

  it('should expose isLoading signal', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('should expose error signal', () => {
    expect(component.error()).toBeNull();
  });

  it('should call deleteGroup when onDelete is confirmed', () => {
    component.onDelete('1', 'Group 1');
    expect(groupFacade.deleteGroup).toHaveBeenCalledWith('1');
  });

  it('should navigate to group detail onViewGroup', () => {
    component.onViewGroup('1');
    expect(router.navigate).toHaveBeenCalledWith(['/groups', '1']);
  });

  it('should navigate to create group onCreateGroup', () => {
    component.onCreateGroup();
    expect(router.navigate).toHaveBeenCalledWith(['/groups/create']);
  });

  it('should navigate to edit group onEditGroup', () => {
    component.onEditGroup('1');
    expect(router.navigate).toHaveBeenCalledWith(['/groups', '1', 'edit']);
  });
});
