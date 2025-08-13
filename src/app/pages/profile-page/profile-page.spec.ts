import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { ProfilePage } from './profile-page';
import { AuthFacade } from '../../service/auth/auth.facade';
import { provideZonelessChangeDetection } from '@angular/core';
describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let mockAuthFacade: jasmine.SpyObj<AuthFacade>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthFacade = jasmine.createSpyObj('AuthFacade', [
      'getProfile',
      'logout',
      'getCurrentUsername',
      'getCurrentUserEmail',
      'getCurrentUserCreatedAt',
      'getCurrentUserId',
    ]);
    mockAuthFacade.getCurrentUsername.and.returnValue(signal('testuser'));
    mockAuthFacade.getCurrentUserEmail.and.returnValue(
      signal('test@example.com'),
    );
    mockAuthFacade.getCurrentUserCreatedAt.and.returnValue(
      signal('2024-01-15T10:30:00Z'),
    );
    mockAuthFacade.getCurrentUserId.and.returnValue(signal('user123'));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getProfile on init', () => {
    expect(mockAuthFacade.getProfile).toHaveBeenCalled();
  });

  it('should logout when logout is called', () => {
    component.logout();
    expect(mockAuthFacade.logout).toHaveBeenCalled();
  });

  it('should navigate to dashboard when navigateToDashboard is called', () => {
    component.navigateToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      component.ROUTER_LINKS.DASHBOARD,
    ]);
  });

  it('should format userCreatedAt correctly', () => {
    expect(component.userCreatedAt()).toBe('2024-01-15');
  });
});
