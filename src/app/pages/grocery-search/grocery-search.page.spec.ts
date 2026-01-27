import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrocerySearchPage } from './grocery-search.page';

describe('GrocerySearchPage', () => {
  let component: GrocerySearchPage;
  let fixture: ComponentFixture<GrocerySearchPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GrocerySearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
