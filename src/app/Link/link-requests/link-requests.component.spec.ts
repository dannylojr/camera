import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkRequestsComponent } from './link-requests.component';

describe('LinkRequestsComponent', () => {
  let component: LinkRequestsComponent;
  let fixture: ComponentFixture<LinkRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
