import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyPage } from './property.page';

describe('PropertyPage', () => {
  let component: PropertyPage;
  let fixture: ComponentFixture<PropertyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
