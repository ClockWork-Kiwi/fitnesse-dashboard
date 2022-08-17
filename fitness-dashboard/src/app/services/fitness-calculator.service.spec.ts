import { TestBed } from '@angular/core/testing';

import { FitnessCalculatorService } from './fitness-calculator.service';

describe('FitnessCalculatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FitnessCalculatorService = TestBed.get(FitnessCalculatorService);
    expect(service).toBeTruthy();
  });
});
