import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DineoutPaybillPage } from './dineout-paybill.page';

describe('DineoutPaybillPage', () => {
  let component: DineoutPaybillPage;
  let fixture: ComponentFixture<DineoutPaybillPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DineoutPaybillPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
