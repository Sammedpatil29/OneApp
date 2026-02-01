import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DineoutTrackPage } from './dineout-track.page';

describe('DineoutTrackPage', () => {
  let component: DineoutTrackPage;
  let fixture: ComponentFixture<DineoutTrackPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DineoutTrackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
