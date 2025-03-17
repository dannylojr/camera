import { TestBed } from '@angular/core/testing';

import { LinkPeopleService } from './link-people.service';

describe('LinkPeopleService', () => {
  let service: LinkPeopleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinkPeopleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
