import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroceryItemDetailsPage } from './grocery-item-details.page';

describe('GroceryItemDetailsPage', () => {
  let component: GroceryItemDetailsPage;
  let fixture: ComponentFixture<GroceryItemDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroceryItemDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
