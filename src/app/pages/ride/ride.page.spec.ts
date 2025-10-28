import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RidePage } from './ride.page';

describe('RidePage', () => {
  let component: RidePage;
  let fixture: ComponentFixture<RidePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RidePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
