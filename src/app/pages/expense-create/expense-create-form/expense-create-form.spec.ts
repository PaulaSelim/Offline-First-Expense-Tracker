import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { signal } from '@angular/core';
import {
  Group,
  GroupMember,
  GroupRole,
} from '../../../core/api/groupApi/groupApi.model';
import { ExpenseCreateForm } from './expense-create-form';
import { provideZonelessChangeDetection } from '@angular/core';
describe('ExpenseCreateForm', () => {
  let component: ExpenseCreateForm;
  let fixture: ComponentFixture<ExpenseCreateForm>;
  let fb: FormBuilder;

  const mockGroupMembers: GroupMember[] = [
    {
      id: 'member1',
      email: 'john@example.com',
      username: 'john_doe',
      role: GroupRole.ADMIN,
    },
    {
      id: 'member2',
      email: 'jane@example.com',
      username: 'jane_doe',
      role: GroupRole.MEMBER,
    },
  ];

  const mockCategories = [
    { id: 'Food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'Transport', name: 'Transportation', icon: '🚗' },
    { id: 'Entertainment', name: 'Entertainment', icon: '🎬' },
  ];

  const mockGroup: Group = {
    id: 'group1',
    name: 'Test Group',
    description: 'Test Description',
    created_by: 'user1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    member_count: 2,
  };

  let mockForm: FormGroup;
  let mockIsInvalid: jasmine.Spy;
  let mockIsParticipantSelected: jasmine.Spy;

  beforeEach(async () => {
    fb = new FormBuilder();
    mockForm = fb.group({
      title: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      payer_id: ['', [Validators.required]],
      category: ['', [Validators.required]],
      date: ['2025-01-15', [Validators.required]],
      is_payer_included: [true],
      participants_id: [[], [Validators.required]],
    });

    mockIsInvalid = jasmine.createSpy('isInvalid').and.returnValue(false);
    mockIsParticipantSelected = jasmine
      .createSpy('isParticipantSelected')
      .and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ExpenseCreateForm, ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseCreateForm);
    component = fixture.componentInstance;

    // Set up input signals
    fixture.componentRef.setInput('form', signal(mockForm));
    fixture.componentRef.setInput('isInvalid', signal(mockIsInvalid));
    fixture.componentRef.setInput('isSubmitting', signal(false));
    fixture.componentRef.setInput('groupMembers', signal(mockGroupMembers));
    fixture.componentRef.setInput('categories', signal(mockCategories));
    fixture.componentRef.setInput('selectedGroup', signal(mockGroup));
    fixture.componentRef.setInput(
      'isParticipantSelected',
      signal(mockIsParticipantSelected),
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('output events', () => {
    it('should emit submitForm event on form submission', () => {
      spyOn(component.submitForm, 'emit');

      component.onSubmit();

      expect(component.submitForm.emit).toHaveBeenCalledWith();
    });

    it('should emit cancelForm event on cancel', () => {
      spyOn(component.cancelForm, 'emit');

      component.onCancel();

      expect(component.cancelForm.emit).toHaveBeenCalledWith();
    });

    it('should emit participantToggle event with member id', () => {
      spyOn(component.participantToggle, 'emit');
      const memberId = 'member1';

      component.onParticipantToggle(memberId);

      expect(component.participantToggle.emit).toHaveBeenCalledWith(memberId);
    });

    it('should emit selectAllParticipants event', () => {
      spyOn(component.selectAllParticipants, 'emit');

      component.onSelectAll();

      expect(component.selectAllParticipants.emit).toHaveBeenCalledWith();
    });

    it('should emit clearAllParticipants event', () => {
      spyOn(component.clearAllParticipants, 'emit');

      component.onClearAll();

      expect(component.clearAllParticipants.emit).toHaveBeenCalledWith();
    });
  });

  describe('component methods', () => {
    it('should handle participant toggle for different members', () => {
      spyOn(component.participantToggle, 'emit');

      component.onParticipantToggle('member1');
      component.onParticipantToggle('member2');

      expect(component.participantToggle.emit).toHaveBeenCalledTimes(2);
      expect(component.participantToggle.emit).toHaveBeenCalledWith('member1');
      expect(component.participantToggle.emit).toHaveBeenCalledWith('member2');
    });
  });

  describe('GroupRole enum', () => {
    it('should expose GroupRole enum', () => {
      expect(component.GroupRole).toBe(GroupRole);
      expect(component.GroupRole.ADMIN).toBe(GroupRole.ADMIN);
      expect(component.GroupRole.MEMBER).toBe(GroupRole.MEMBER);
    });
  });

  describe('edge cases', () => {
    it('should handle participant selection function throwing error', () => {
      const errorFunction = jasmine
        .createSpy('isParticipantSelected')
        .and.throwError('Selection error');
      fixture.componentRef.setInput(
        'isParticipantSelected',
        signal(errorFunction),
      );

      expect(() => {
        try {
          component.isParticipantSelected()('member1');
        } catch (error: unknown) {
          expect((error as Error).message).toBe('Selection error');
        }
      }).not.toThrow();
    });
  });
});
