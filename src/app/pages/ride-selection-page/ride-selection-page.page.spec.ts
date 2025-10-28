import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RideSelectionPagePage } from './ride-selection-page.page';

describe('RideSelectionPagePage', () => {
  let component: RideSelectionPagePage;
  let fixture: ComponentFixture<RideSelectionPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RideSelectionPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
