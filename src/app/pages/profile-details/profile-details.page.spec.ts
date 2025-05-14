import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileDetailsPage } from './profile-details.page';

describe('ProfileDetailsPage', () => {
  let component: ProfileDetailsPage;
  let fixture: ComponentFixture<ProfileDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
