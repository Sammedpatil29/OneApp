import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackOrderPage } from './track-order.page';

describe('TrackOrderPage', () => {
  let component: TrackOrderPage;
  let fixture: ComponentFixture<TrackOrderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
