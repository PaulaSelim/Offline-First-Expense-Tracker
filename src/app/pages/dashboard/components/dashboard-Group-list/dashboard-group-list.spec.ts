import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGroupList } from './dashboard-group-list';

describe('DashboardGroupList', () => {
  let component: DashboardGroupList;
  let fixture: ComponentFixture<DashboardGroupList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardGroupList],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardGroupList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
