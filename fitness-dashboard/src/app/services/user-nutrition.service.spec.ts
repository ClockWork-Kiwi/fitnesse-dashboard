import { TestBed } from '@angular/core/testing';

import { UserNutritionService } from './user-nutrition.service';

describe('NutritionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserNutritionService = TestBed.get(UserNutritionService);
    expect(service).toBeTruthy();
  });
});
