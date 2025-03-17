import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedUsersComponent } from './linked-users.component';

describe('LinkedUsersComponent', () => {
  let component: LinkedUsersComponent;
  let fixture: ComponentFixture<LinkedUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
