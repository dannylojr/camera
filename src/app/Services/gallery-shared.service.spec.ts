import { TestBed } from '@angular/core/testing';

import { GallerySharedService } from './gallery-shared.service';

describe('GallerySharedService', () => {
  let service: GallerySharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GallerySharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
