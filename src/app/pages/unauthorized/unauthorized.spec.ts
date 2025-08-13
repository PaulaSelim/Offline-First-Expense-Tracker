import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Unauthorized } from './unauthorized';
import { provideZonelessChangeDetection } from '@angular/core';
describe('Unauthorized', () => {
  let component: Unauthorized;
  let fixture: ComponentFixture<Unauthorized>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Unauthorized],
      providers: [
        { provide: Router, useValue: mockRouter },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Unauthorized);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login when backToDashboard is called', () => {
    component.backToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      component.ROUTER_LINKS.LOGIN,
    ]);
  });
});
