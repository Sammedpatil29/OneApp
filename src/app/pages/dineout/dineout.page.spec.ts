import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DineoutPage } from './dineout.page';

describe('DineoutPage', () => {
  let component: DineoutPage;
  let fixture: ComponentFixture<DineoutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DineoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
