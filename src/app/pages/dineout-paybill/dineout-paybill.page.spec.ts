import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dineoutPaybillPage } from './dineout-paybill.page';

describe('dineoutPaybillPage', () => {
  let component: dineoutPaybillPage;
  let fixture: ComponentFixture<dineoutPaybillPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(dineoutPaybillPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
