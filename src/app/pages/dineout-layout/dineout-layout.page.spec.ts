import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DineoutLayoutPage } from './dineout-layout.page';

describe('DineoutLayoutPage', () => {
  let component: DineoutLayoutPage;
  let fixture: ComponentFixture<DineoutLayoutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DineoutLayoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
