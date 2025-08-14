import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthFacade } from '../../../../service/auth/auth.facade';
import { DashboardHeader } from './dashboard-header';
import { Router } from '@angular/router';

describe('DashboardHeader', () => {
  let component: DashboardHeader;
  let fixture: ComponentFixture<DashboardHeader>;
  let mockAuthFacade: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthFacade = {
      getProfile: jasmine.createSpy('getProfile'),
      getCurrentUsername: () => () => 'TestUser',
      getCurrentUserEmail: () => () => 'test@example.com',
      logout: jasmine.createSpy('logout'),
    };
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    await TestBed.configureTestingModule({
      imports: [DashboardHeader],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getProfile on init', () => {
    expect(mockAuthFacade.getProfile).toHaveBeenCalled();
  });

  it('should display username and email in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('TestUser');
    expect(compiled.querySelector('span.text-muted')?.textContent).toContain(
      'test@example.com',
    );
  });

  it('should call logout when logout button is clicked', () => {
    const btn = fixture.nativeElement.querySelector('.btn-outline-danger');
    btn.click();
    expect(mockAuthFacade.logout).toHaveBeenCalled();
  });

  it('should navigate to profile when View Profile button is clicked', () => {
    const btn = fixture.nativeElement.querySelector('.btn-outline-primary');
    btn.click();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      component.ROUTER_LINKS.PROFILE,
    ]);
  });

  it('should expose username and userEmail signals', () => {
    expect(component.username()).toBe('TestUser');
    expect(component.userEmail()).toBe('test@example.com');
  });
});
