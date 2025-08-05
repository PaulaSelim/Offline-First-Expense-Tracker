import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { GroupRole } from '../../../../core/api/groupApi/groupApi.model';
import { GroupFacade } from '../../../../service/group/group.facade';
import { GroupHeader } from './group-header';

describe('GroupHeader', () => {
  let component: GroupHeader;
  let fixture: ComponentFixture<GroupHeader>;
  let mockRouter: { navigate: jasmine.Spy };
  let mockGroupFacade: { getSelectedGroup: any; deleteGroup: jasmine.Spy };
  const testGroup = {
    id: 'g1',
    name: 'Test Group',
    user_role: GroupRole.ADMIN,
    created_at: '2025-08-05',
  };

  beforeEach(async () => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    mockGroupFacade = {
      getSelectedGroup: () => signal(testGroup),
      deleteGroup: jasmine.createSpy('deleteGroup'),
    };
    await TestBed.configureTestingModule({
      imports: [GroupHeader],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: GroupFacade, useValue: mockGroupFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true for isAdmin when user role is ADMIN', () => {
    expect(component.isAdmin()).toBeTrue();
  });

  it('should navigate to edit page on onEditGroup', () => {
    component.onEditGroup();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/groups', 'g1', 'edit']);
  });

  describe('onDeleteGroup', () => {
    beforeEach(() => {
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should delete group and navigate to dashboard if confirmed', () => {
      component.onDeleteGroup();
      expect(mockGroupFacade.deleteGroup).toHaveBeenCalledWith('g1');
      // ROUTE_PATHS.DASHBOARD is 'dashboard', so navigation should be ['dashboard']
      expect(mockRouter.navigate).toHaveBeenCalledWith(['dashboard']);
    });

    it('should not delete group if not confirmed', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.onDeleteGroup();
      expect(mockGroupFacade.deleteGroup).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/dashboard']);
    });
  });

  it('should format date correctly', () => {
    const formatted = component.getFormattedDate('2025-08-05T00:00:00Z');
    // Depending on locale, but should contain year '2025'
    expect(formatted).toContain('2025');
  });
});
