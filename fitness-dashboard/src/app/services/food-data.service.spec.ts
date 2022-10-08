import { TestBed } from '@angular/core/testing';

import { FoodDataService } from './food-data.service';

describe('FoodDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FoodDataService = TestBed.get(FoodDataService);
    expect(service).toBeTruthy();
  });
});
