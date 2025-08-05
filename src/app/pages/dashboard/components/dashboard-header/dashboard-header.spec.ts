import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFacade } from '../../../../service/auth/auth.facade';
import { DashboardHeader } from './dashboard-header';

describe('DashboardHeader', () => {
  let component: DashboardHeader;
  let fixture: ComponentFixture<DashboardHeader>;

  beforeEach(async () => {
    const mockAuthFacade = {
      getProfile: jasmine.createSpy('getProfile'),
      getCurrentUsername: () => () => 'TestUser',
      getCurrentUserEmail: () => () => 'test@example.com',
    };
    await TestBed.configureTestingModule({
      imports: [DashboardHeader],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthFacade, useValue: mockAuthFacade },
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
    const auth = TestBed.inject(AuthFacade) as any;
    expect(auth.getProfile).toHaveBeenCalled();
  });

  it('should display username and email in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h2 = compiled.querySelector('h2');
    const span = compiled.querySelector('span.text-muted');
    expect(h2?.textContent).toContain('TestUser');
    expect(span?.textContent).toContain('test@example.com');
  });
});
