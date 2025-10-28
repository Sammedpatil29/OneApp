import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrocerySpecialPage } from './grocery-special.page';

describe('GrocerySpecialPage', () => {
  let component: GrocerySpecialPage;
  let fixture: ComponentFixture<GrocerySpecialPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GrocerySpecialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
