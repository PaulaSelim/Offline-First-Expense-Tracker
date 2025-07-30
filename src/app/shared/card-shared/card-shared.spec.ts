import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardShared } from './card-shared';

@Component({
  selector: 'test-host',
  standalone: true,
  imports: [CardShared],
  template: `
    <app-card-shared [cardTitle]="cardTitle()" [cardIcon]="cardIcon()" />
  `,
})
class TestHostComponent {
  cardTitle = signal('Test Title');
  cardIcon = signal('bi bi-star');
}

describe('CardShared with mock inputs', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render CardShared with mock data', () => {
    const cardElement = fixture.nativeElement.querySelector('app-card-shared');
    expect(cardElement).toBeTruthy();
  });
});
