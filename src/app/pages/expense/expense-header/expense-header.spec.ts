import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { GroupFacade } from '../../../service/group/group.facade';
import { Group } from '../../../core/api/groupApi/groupApi.model';
import { ExpenseStats } from '../expense-stats/expense-stats';
import { ExpenseHeader } from './expense-header';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
describe('ExpenseHeader', () => {
  let component: ExpenseHeader;
  let fixture: ComponentFixture<ExpenseHeader>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockGroupFacade: jasmine.SpyObj<GroupFacade>;

  const mockGroup: Group = {
    id: 'group1',
    name: 'Test Group',
    created_by: 'user1',
    member_count: 5,
    description: 'Test group description',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('group1'),
        },
      },
    } as any;

    mockGroupFacade = jasmine.createSpyObj('GroupFacade', ['getSelectedGroup']);
    mockGroupFacade.getSelectedGroup.and.returnValue(signal(mockGroup));

    await TestBed.configureTestingModule({
      imports: [ExpenseHeader, ExpenseStats],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: GroupFacade, useValue: mockGroupFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseHeader);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set groupId from route params', () => {
      component.ngOnInit();

      expect(component['groupId']).toBe('group1');
      expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith(
        'id',
      );
    });

    it('should navigate to dashboard when no groupId is provided', () => {
      mockActivatedRoute.snapshot.paramMap.get = jasmine
        .createSpy('get')
        .and.returnValue(null);

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to dashboard when empty groupId is provided', () => {
      mockActivatedRoute.snapshot.paramMap.get = jasmine
        .createSpy('get')
        .and.returnValue('');

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not navigate when valid groupId is provided', () => {
      component.ngOnInit();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('selectedGroup signal', () => {
    it('should get selected group from facade', () => {
      expect(component.selectedGroup()).toEqual(mockGroup);
      expect(mockGroupFacade.getSelectedGroup).toHaveBeenCalled();
    });

    it('should handle null selected group', () => {
      mockGroupFacade.getSelectedGroup.and.returnValue(signal(null));

      expect(component.selectedGroup()).toBeNull();
    });
  });

  describe('navigation methods', () => {
    beforeEach(() => {
      component['groupId'] = 'group1';
    });

    it('should navigate to add expense page', () => {
      component.onAddExpense();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        'group1',
        'expenses',
        'add',
      ]);
    });

    it('should navigate back to group page', () => {
      component.onBackToGroup();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/groups', 'group1']);
    });

    it('should use correct groupId for navigation when groupId changes', () => {
      component['groupId'] = 'different-group';

      component.onAddExpense();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        'different-group',
        'expenses',
        'add',
      ]);
    });

    it('should navigate back to correct group when groupId changes', () => {
      component['groupId'] = 'different-group';

      component.onBackToGroup();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        'different-group',
      ]);
    });
  });

  describe('component integration', () => {
    it('should render expense stats component', () => {
      fixture.detectChanges();

      const expenseStats =
        fixture.debugElement.nativeElement.querySelector('app-expense-stats');
      expect(expenseStats).toBeTruthy();
    });

    it('should pass correct data to child components', () => {
      fixture.detectChanges();

      // The ExpenseStats component should be able to access the ExpenseFacade
      // through dependency injection when rendered as a child component
      expect(
        fixture.debugElement.nativeElement.querySelector('app-expense-stats'),
      ).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should handle route parameter extraction errors gracefully', () => {
      // Mock paramMap.get to throw an error
      mockActivatedRoute.snapshot.paramMap.get = jasmine
        .createSpy('get')
        .and.throwError('Route error');

      expect(() => component.ngOnInit()).not.toThrow();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('component lifecycle', () => {
    it('should initialize groupId as empty string', () => {
      expect(component['groupId']).toBe('');
    });

    it('should set groupId after ngOnInit', () => {
      component.ngOnInit();

      expect(component['groupId']).toBe('group1');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined route snapshot', () => {
      const originalSnapshot = mockActivatedRoute.snapshot;
      (mockActivatedRoute as any).snapshot = undefined;

      expect(() => component.ngOnInit()).not.toThrow();

      // Restore original snapshot
      mockActivatedRoute.snapshot = originalSnapshot;
    });

    it('should handle whitespace-only groupId', () => {
      mockActivatedRoute.snapshot.paramMap.get = jasmine
        .createSpy('get')
        .and.returnValue('   ');

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('method calls without initialization', () => {
    it('should handle onAddExpense when groupId is empty', () => {
      // Don't call ngOnInit, so groupId remains empty
      component.onAddExpense();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/groups',
        '',
        'expenses',
        'add',
      ]);
    });

    it('should handle onBackToGroup when groupId is empty', () => {
      // Don't call ngOnInit, so groupId remains empty
      component.onBackToGroup();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/groups', '']);
    });
  });
});
