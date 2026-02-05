import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyLayoutPage } from './property-layout.page';

describe('PropertyLayoutPage', () => {
  let component: PropertyLayoutPage;
  let fixture: ComponentFixture<PropertyLayoutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyLayoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
