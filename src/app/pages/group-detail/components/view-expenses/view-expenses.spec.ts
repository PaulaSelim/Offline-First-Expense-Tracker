import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExpenses } from './view-expenses';

describe('ViewExpenses', () => {
  let component: ViewExpenses;
  let fixture: ComponentFixture<ViewExpenses>;
  let emitSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewExpenses],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewExpenses);
    component = fixture.componentInstance;
    emitSpy = spyOn(component.viewExpenses, 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit viewExpenses when onViewExpenses is called', () => {
    component.onViewExpenses();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should emit viewExpenses when button is clicked', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    button.click();
    expect(emitSpy).toHaveBeenCalled();
  });
});
