import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupCard } from './group-card';
import { provideZonelessChangeDetection } from '@angular/core';

describe('GroupCard', () => {
  let component: GroupCard;
  let fixture: ComponentFixture<GroupCard>;
  const mockGroup = {
    id: 'g1',
    name: 'Test Group',
    member_count: 5,
    description: 'A test group',
    user_role: 'ADMIN',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('group', mockGroup);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display group name and member count', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.card-title')?.textContent).toContain(
      'Test Group',
    );
    expect(
      compiled.querySelector('.badge.bg-secondary')?.textContent,
    ).toContain('5 members');
  });

  it('should emit view event when View button is clicked', () => {
    spyOn(component.view, 'emit');
    const btn = fixture.nativeElement.querySelector('.btn-outline-primary');
    btn.click();
    expect(component.view.emit).toHaveBeenCalledWith('g1');
  });

  it('should emit edit event when onEdit is called', () => {
    spyOn(component.edit, 'emit');
    component.onEdit();
    expect(component.edit.emit).toHaveBeenCalledWith('g1');
  });

  it('should not render Delete button for non-admin role', () => {
    const memberGroup = { ...mockGroup, user_role: 'MEMBER' };
    fixture = TestBed.createComponent(GroupCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('group', memberGroup);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-outline-danger');
    expect(btn).toBeNull();
  });
});
