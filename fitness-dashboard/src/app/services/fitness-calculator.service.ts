import { Injectable } from '@angular/core';
import * as fitnessCalculator from 'fitness-calculator';

@Injectable({
  providedIn: 'root'
})
export class FitnessCalculatorService {

  constructor() { }

  public calculateCalories(sex, age, height, weight, activity) {
    return fitnessCalculator.calorieNeeds(sex, age, height, weight, activity);
  }

  public calculateNutrition(sex, age, height, weight, activity, goal) {
    return fitnessCalculator.macros(sex, age, height, weight, activity, goal);
  }
}
