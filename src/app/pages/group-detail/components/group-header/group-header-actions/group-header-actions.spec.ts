import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { GroupHeaderActions } from './group-header-actions';

describe('GroupHeaderActions', () => {
  let component: GroupHeaderActions;
  let fixture: ComponentFixture<GroupHeaderActions>;
  let mockRouter: { navigate: jasmine.Spy };

  beforeEach(async () => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };
    await TestBed.configureTestingModule({
      imports: [GroupHeaderActions],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupHeaderActions);
    component = fixture.componentInstance;
    // initialize inputs and spy outputs
    (component as any).isAdmin = signal(true);
    spyOn(component.edit, 'emit');
    spyOn(component.delete, 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show edit and delete buttons when admin', () => {
    const btns = fixture.nativeElement.querySelectorAll(
      'button.btn-outline-warning, button.btn-outline-danger',
    );
    expect(btns.length).toBe(2);
  });

  it('should emit edit when edit button clicked', () => {
    const editBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button.btn-outline-warning',
    );
    editBtn.click();
    expect(component.edit.emit).toHaveBeenCalled();
  });

  it('should emit delete when delete button clicked', () => {
    const deleteBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button.btn-outline-danger',
    );
    deleteBtn.click();
    expect(component.delete.emit).toHaveBeenCalled();
  });

  it('should navigate back on back button click', () => {
    const backBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button.btn-secondary',
    );
    backBtn.click();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['dashboard']);
  });
});
