import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardLayout } from './card-layout';

describe('CardLayout', () => {
  let component: CardLayout;
  let fixture: ComponentFixture<CardLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(CardLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
