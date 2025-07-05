import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroceryByCategoryPage } from './grocery-by-category.page';

describe('GroceryByCategoryPage', () => {
  let component: GroceryByCategoryPage;
  let fixture: ComponentFixture<GroceryByCategoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroceryByCategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
