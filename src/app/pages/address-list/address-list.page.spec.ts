import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddressListPage } from './address-list.page';

describe('AddressListPage', () => {
  let component: AddressListPage;
  let fixture: ComponentFixture<AddressListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
