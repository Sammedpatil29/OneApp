import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroceryOrderDetailsPage } from './grocery-order-details.page';

describe('GroceryOrderDetailsPage', () => {
  let component: GroceryOrderDetailsPage;
  let fixture: ComponentFixture<GroceryOrderDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroceryOrderDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
