import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupHeaderDetails } from './group-header-details';

describe('GroupHeaderDetails', () => {
  let component: GroupHeaderDetails;
  let fixture: ComponentFixture<GroupHeaderDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupHeaderDetails],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupHeaderDetails);
    component = fixture.componentInstance;
    // initialize inputs
    (component as any).name = signal('Test Group');
    (component as any).description = signal('A sample description');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the provided name', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('h2');
    expect(el.textContent).toBe('Test Group');
  });

  it('should display the provided description', () => {
    const p: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(p.textContent?.trim()).toBe('A sample description');
  });
});
