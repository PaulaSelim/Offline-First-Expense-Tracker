import { signal, input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ExpenseParticipantsSelectionComponent } from './expense-participants-selection-component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ExpenseParticipantsSelectionComponent', () => {
  let component: ExpenseParticipantsSelectionComponent;
  let fixture: ComponentFixture<ExpenseParticipantsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseParticipantsSelectionComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    TestBed.overrideComponent(ExpenseParticipantsSelectionComponent, {
      set: {
        inputs: ['form'],
      },
    });

    fixture = TestBed.createComponent(ExpenseParticipantsSelectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isInvalid', (controlName: string) => false);
    fixture.componentRef.setInput('groupMembers', [
      { id: '1', username: 'Alice', role: 'member' },
      { id: '2', username: 'Bob', role: 'admin' },
    ] as any);
    fixture.componentRef.setInput(
      'isParticipantSelected',
      (memberId: string) => memberId === '1',
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required input signals', () => {
    expect(component.form).toBeDefined();
    expect(component.isInvalid).toBeDefined();
    expect(component.groupMembers).toBeDefined();
    expect(component.isParticipantSelected).toBeDefined();
  });

  it('should emit participantToggle when onParticipantToggle is called', () => {
    const spy = jasmine.createSpy('emit');
    component.participantToggle.emit = spy;
    component.onParticipantToggle('member1');
    expect(spy).toHaveBeenCalledWith('member1');
  });

  it('should emit selectAllParticipants when onSelectAll is called', () => {
    const spy = jasmine.createSpy('emit');
    component.selectAllParticipants.emit = spy;
    component.onSelectAll();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit clearAllParticipants when onClearAll is called', () => {
    const spy = jasmine.createSpy('emit');
    component.clearAllParticipants.emit = spy;
    component.onClearAll();
    expect(spy).toHaveBeenCalled();
  });

  it('should return true for isParticipantSelected for id "1"', () => {
    expect(component.isParticipantSelected()('1')).toBeTrue();
    expect(component.isParticipantSelected()('2')).toBeFalse();
  });
});
