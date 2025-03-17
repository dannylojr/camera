import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkPeopleComponent } from './link-people.component';

describe('LinkPeopleComponent', () => {
  let component: LinkPeopleComponent;
  let fixture: ComponentFixture<LinkPeopleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkPeopleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
