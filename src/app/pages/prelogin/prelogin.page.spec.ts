import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreloginPage } from './prelogin.page';

describe('PreloginPage', () => {
  let component: PreloginPage;
  let fixture: ComponentFixture<PreloginPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PreloginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
