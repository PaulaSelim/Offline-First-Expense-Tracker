import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupRole } from '../../../../../core/api/groupApi/groupApi.model';
import { GroupMemberCard } from './group-member-card';

describe('GroupMemberCard', () => {
  let component: GroupMemberCard;
  let fixture: ComponentFixture<GroupMemberCard>;
  const mockMember = {
    id: 'u1',
    username: 'Alice',
    email: 'alice@example.com',
    role: GroupRole.MEMBER,
    // other fields not used in this component
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupMemberCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupMemberCard);
    component = fixture.componentInstance;
    // Initialize input signals
    (component as any).member = signal(mockMember);
    (component as any).isAdmin = signal(true);
    // Spy on output emitters
    spyOn(component.updateRole, 'emit');
    spyOn(component.remove, 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the member username', () => {
    const title = fixture.nativeElement.querySelector('h6');
    expect(title.textContent.trim()).toBe('Alice');
  });

  it('should display the correct role badge class and text', () => {
    const badge = fixture.nativeElement.querySelector('span.badge');
    expect(badge.textContent.trim()).toBe('Member');
    expect(badge.classList).toContain('bg-secondary');
  });

  describe('when admin mode', () => {
    beforeEach(() => {
      (component as any).isAdmin = signal(true);
      fixture.detectChanges();
    });

    it('should show toggle role and remove buttons', () => {
      const buttons =
        fixture.nativeElement.querySelectorAll('.btn-group button');
      expect(buttons.length).toBe(2);
    });

    it('should emit updateRole with member id on toggle click', () => {
      const toggleBtn: HTMLButtonElement =
        fixture.nativeElement.querySelector('.btn-outline-info');
      toggleBtn.click();
      expect(component.updateRole.emit).toHaveBeenCalledWith('u1');
    });

    it('should emit remove with member id on remove click', () => {
      const removeBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
        '.btn-outline-danger',
      );
      removeBtn.click();
      expect(component.remove.emit).toHaveBeenCalledWith('u1');
    });
  });
});
