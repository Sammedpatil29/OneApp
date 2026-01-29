import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroceryLayoutPage } from './grocery-layout.page';

describe('GroceryLayoutPage', () => {
  let component: GroceryLayoutPage;
  let fixture: ComponentFixture<GroceryLayoutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroceryLayoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
