import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DineoutSelectTimePage } from './dineout-select-time.page';

describe('DineoutSelectTimePage', () => {
  let component: DineoutSelectTimePage;
  let fixture: ComponentFixture<DineoutSelectTimePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DineoutSelectTimePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
