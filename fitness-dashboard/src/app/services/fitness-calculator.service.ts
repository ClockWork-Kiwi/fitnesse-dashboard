import { Injectable } from '@angular/core';
import * as fitnessCalculator from 'fitness-calculator';

@Injectable({
  providedIn: 'root'
})
export class FitnessCalculatorService {

  constructor() { }

  // Return the calorie values calculated by the NPM package fitness-calculator, using the given data
  public calculateCalories(sex, age, height, weight, activity) {
    return fitnessCalculator.calorieNeeds(sex, age, height, weight, activity);
  }

  // Return the nutrition values calculated by the NPM package fitness-calculator, using the given data
  public calculateNutrition(sex, age, height, weight, activity, goal) {
    return fitnessCalculator.macros(sex, age, height, weight, activity, goal);
  }
}
