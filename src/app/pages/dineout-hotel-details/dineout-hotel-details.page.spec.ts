import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DineoutHotelDetailsPage } from './dineout-hotel-details.page';

describe('DineoutHotelDetailsPage', () => {
  let component: DineoutHotelDetailsPage;
  let fixture: ComponentFixture<DineoutHotelDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DineoutHotelDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
