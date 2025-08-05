import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupHeaderStats } from './group-header-stats';

describe('GroupHeaderStats', () => {
  let component: GroupHeaderStats;
  let fixture: ComponentFixture<GroupHeaderStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupHeaderStats],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupHeaderStats);
    component = fixture.componentInstance;
    // initialize input signals
    (component as any).memberCount = signal(5);
    (component as any).role = signal('Admin');
    (component as any).createdAt = signal('2025-08-05');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display member count', () => {
    const countEl: HTMLElement =
      fixture.nativeElement.querySelectorAll('.h4')[0];
    expect(countEl.textContent?.trim()).toBe('5');
  });

  it('should display role', () => {
    const roleEl: HTMLElement =
      fixture.nativeElement.querySelectorAll('.h4')[1];
    expect(roleEl.textContent?.trim()).toBe('Admin');
  });

  it('should display created date', () => {
    const dateEl: HTMLElement =
      fixture.nativeElement.querySelectorAll('.h4')[2];
    expect(dateEl.textContent?.trim()).toBe('2025-08-05');
  });
});
