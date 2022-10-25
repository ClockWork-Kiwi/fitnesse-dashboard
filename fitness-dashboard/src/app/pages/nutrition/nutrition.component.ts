import {Component, OnDestroy, OnInit} from '@angular/core';
import {faCircleInfo, faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {UserNutritionService} from '../../services/user-nutrition.service';
import {UserService} from '../../services/user.service';
import {FoodDataService} from '../../services/food-data.service';
import {Chart} from 'chart.js';
import {FitnessCalculatorService} from '../../services/fitness-calculator.service';
import {roundNumber} from '../../functions/roundNumber';

@Component({
  selector: 'app-nutrition',
  templateUrl: './nutrition.component.html',
  styleUrls: ['./nutrition.component.scss']
})
export class NutritionComponent implements OnInit, OnDestroy {

  // Public & Private variables
  public addIcon = faPlusCircle;
  public removeIcon = faMinusCircle;
  public infoIcon = faCircleInfo;
  private componentDestruction$ = new Subject();

  public searchingItem = false;
  public showDietGraph = true;
  private foundItem;

  public userDietPlan;

  // Form group for holding new food items entered by the user
  public mainFormGroup = this.fb.group({
    food_name: [null, Validators.required],
    calories: [null, Validators.required],
    servings: [1],
    fat: [0],
    carbs: [0],
    protein: [0],
  });

  constructor(
    private fb: FormBuilder,
    public userNutritionService: UserNutritionService,
    private foodDataService: FoodDataService,
    public userService: UserService,
    private fitnessCalculatorService: FitnessCalculatorService,
  ) { }

  // Function that searches for food data found in the Edamam food database, and returns the result
  public searchFoodItem() {
    // Flag that the app is waiting for a response (shows spinner instead of add button)
    this.searchingItem = true;
    // Get the foodItem entered by the user
    const foodItem = this.mainFormGroup.get('food_name').value;
    // Use the food data service to send a query to Edamam's food API with the user entered food item
    this.foodDataService.getFoodData(foodItem).subscribe(data => {
      // Once the request returns, regardless of whether food was found, flag that the app is no longer waiting for a response
      this.searchingItem = false;
      this.foundItem = data;
      // If no data was found for the given food item, return
      if (!data) { return; }
      // Get the number of servings the user has entered
      const servings = this.mainFormGroup.get('servings').value;
      // Set the calorie & macronutrient values to match the food found, adjusted for serving size
      this.mainFormGroup.get('calories').setValue(data.calories * servings);
      this.mainFormGroup.get('fat').setValue(data.fat * servings);
      this.mainFormGroup.get('carbs').setValue(data.carbs * servings);
      this.mainFormGroup.get('protein').setValue(data.protein * servings);
    });
  }

  // Function that runs when user clicks the + icon to add a new food/drink item
  public addFoodItem() {
    // If any of the required fields are empty, show field errors and return
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    // Get the data stored in the form group
    const foodItem = this.mainFormGroup.getRawValue();
    // Convert the 'servings' field to a number, in case it's been stored as a string (usually happens when users enter a decimal number)
    foodItem.servings = Number(foodItem.servings);
    // Send a save request to the API for the new food item
    this.userNutritionService.saveNutritionItem(foodItem).pipe(
      // If the food item is successfully added, save the updated amount of consumed calories to the database
      switchMap(foodItems => this.userService.saveCaloriesConsumed(foodItems)),
    ).subscribe(() => {
      // Scroll to the bottom of the nutrition list
      const nutritionView = document.getElementsByClassName('nutritionList')[0];
      nutritionView.scrollTop = nutritionView.scrollHeight;
      // Reset variables to default values, wipe the form group, ready for a 'new item' to be entered
      this.foundItem = undefined;
      this.mainFormGroup.reset({servings: 1});
      this.mainFormGroup.markAsPristine();
    });
  }

  // Function that removes a food/drink item when the user clicks the - icon.
  public removeFoodItem(itemID) {
    // Send a request to the API to delete the chosen food item
    this.userNutritionService.deleteNutritionItem(itemID).pipe(
      // Update the amount of calories consumed to match the updated list of food items
      switchMap(foodItems => this.userService.saveCaloriesConsumed(foodItems)),
    ).subscribe();
  }

  // Function that creates a chart to display their macronutrient ratios
  public initMyDietChart(foodItems) {
    // Begin by assuming we don't show the diet graph
    this.showDietGraph = false;
    // If the user doesn't have any food items stored for today, return
    if (!foodItems || foodItems.length < 1) {
      return;
    }
    // Create variables to hold the total (in grams) of each macronutrient present in the user's diet
    let totalFat = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    for (const item of foodItems) {
      if (!!item.carbs || !!item.protein || !!item.fat) {
        totalFat += item.fat;
        totalCarbs += item.carbs;
        totalProtein += item.protein;
      }
    }
    // If there's any macronutrient information contained in the user's food items
    if (totalFat > 0 || totalCarbs > 0 || totalProtein > 0) {
      // Show the diet graph
      this.showDietGraph = true;
      // Set a timeout for one frame, otherwise the code attempts to retrieve the canvas element for this chart before the *ngIf on the canvas
      // for this chart realises that the showDietGraph variable has been switched to true, and therefore needs to show the canvas element
      setTimeout(() => {
        // Calculate the total amount of macronutrients (in grams) present in the user's food items
        const totalNutrition = totalFat + totalCarbs + totalProtein;
        // Calculate the percentage of fat, carbs, and protein present in the user's food items
        const percentageFat = roundNumber(totalFat / totalNutrition * 100);
        const percentageCarbs = roundNumber(totalCarbs / totalNutrition * 100);
        const percentageProtein = roundNumber(totalProtein / totalNutrition * 100);
        // Initialize and create a chart to show these percentages of fat/carbs/protein
        const context = document.getElementById('myDietChart');
        const chartLabels = ['Fat', 'Carbs', 'Protein'];
        const chartData = [{
          data: [percentageFat, percentageCarbs, percentageProtein],
          backgroundColor: ['rgba(255, 255, 0, 1)', 'rgba(150, 150, 255, 0.4)', 'rgba(255, 100, 100, 0.4)']
        }];
        const myDietChart = new Chart(context, {
          type: 'doughnut',
          data: {
            labels: chartLabels,
            datasets: chartData,
          },
          options: {
            legend: {
              labels: {
                fontColor: 'white',
                fontSize: 12,
                padding: 30,
              }
            },
            tooltips: {
              callbacks: {
                label: ctx => chartLabels[ctx.index] + ': ' + chartData[0].data[ctx.index] + '%'
              }
            },
          },
        });
      }, 0);
    }
  }

  // Much the same as the function above, except it creates a chart to show the macronutrient percentages the user should try to match with their
  // own diet
  public initMyPlanChart(fatPercentage, carbsPercentage, proteinPercentage) {
    const context = document.getElementById('plannedDietChart');
    const chartLabels = ['Fat', 'Carbs', 'Protein'];
    const chartData = [{
      data: [fatPercentage, carbsPercentage, proteinPercentage],
      backgroundColor: ['rgba(255, 255, 0, 1)', 'rgba(150, 150, 255, 0.4)', 'rgba(255, 100, 100, 0.4)']
    }];
    const myDietPlanChart = new Chart(context, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: chartData,
      },
      options: {
        legend: {
          labels: {
            fontColor: 'white',
            fontSize: 12,
            padding: 30,
          }
        },
        tooltips: {
          callbacks: {
            label: ctx => chartLabels[ctx.index] + ': ' + chartData[0].data[ctx.index] + '%'
          }
        },
      },
    });
  }

  ngOnInit() {
    // After the user's food items are retrieved from the API, initialise the 'My Diet' chart using the items retrieved
    this.userNutritionService.observable$.pipe(
      takeUntil(this.componentDestruction$),
    ).subscribe(foodItems => {
      this.initMyDietChart(foodItems);
    });

    // Whenever the user's data is updated, run the following code
    this.userService.user$.pipe(
      takeUntil(this.componentDestruction$),
    ).subscribe(userData => {
      // If the user doesn't have a diet plan, return
      if (userData.diet_plan === null || userData.diet_plan === undefined) { return ''; }
      // Constants required to calculate diet ratio's of the diet plan the user has chosen
      const dietPlanOptions = [
        { value: 0, label: 'Balanced' },
        { value: 1, label: 'Low Carb' },
        { value: 2, label: 'High Carb' },
        { value: 3, label: 'High Protein' },
        { value: 4, label: 'Low Fat' },
      ];
      const weightGoalMap = {
        0: 'balance',
        1: 'mildWeightLoss',
        2: 'heavyWeightLoss',
        3: 'mildWeightGain',
        4: 'heavyWeightGain',
      };
      const dietPlanMap = {
        0: 'balancedDietPlan',
        1: 'lowCarbDietPlan',
        2: 'highCarbDietPlan',
        3: 'highProteinDietPlan',
        4: 'lowFatDietPlan',
      };
      // Use the fitness calculator service to retrieve the ideal nutrition numbers according to the user's diet plan
      const idealNutrition = this.fitnessCalculatorService.calculateNutrition(
        userData.sex,
        userData.age,
        userData.height,
        userData.weight,
        'sedentary',
        weightGoalMap[userData.weight_goal]
      )[dietPlanMap[userData.diet_plan]];
      // Using the data retrieved, calculate the ratios of each macronutrient that the user should try to match, and initialise the diet graph
      // using these ratios
      const totalNutrition = idealNutrition.fat + idealNutrition.carb + idealNutrition.protein;
      const idealFatPercentage = roundNumber(idealNutrition.fat / totalNutrition * 100);
      const idealCarbsPercentage = roundNumber(idealNutrition.carb / totalNutrition * 100);
      const idealProteinPercentage = roundNumber(idealNutrition.protein / totalNutrition * 100);
      this.userDietPlan = dietPlanOptions.find(plan => plan.value === userData.diet_plan).label;
      this.initMyPlanChart(idealFatPercentage, idealCarbsPercentage, idealProteinPercentage);
    });

    // Runs every time the user changes the 'servings' field
    this.mainFormGroup.get('servings').valueChanges.pipe(
      takeUntil(this.componentDestruction$),
      // Only proceed if the user has actually changed data in the form
      filter(() => this.mainFormGroup.dirty),
    ).subscribe(servings => {
      // If we haven't locally stored any data from Edamam for the food item the user is currently entering, return
      if (!this.foundItem) { return; }
      // Using the new number of servings, adjust the number of calories and macronutrients for the current food item accordingly
      this.mainFormGroup.get('calories').setValue(roundNumber(this.foundItem.calories * servings));
      this.mainFormGroup.get('fat').setValue(roundNumber(this.foundItem.fat * servings));
      this.mainFormGroup.get('carbs').setValue(roundNumber(this.foundItem.carbs * servings));
      this.mainFormGroup.get('protein').setValue(roundNumber(this.foundItem.protein * servings));
    });

    // Runs whenever the user changes the 'calories' field
    this.mainFormGroup.get('calories').valueChanges.pipe(
      takeUntil(this.componentDestruction$),
      // Only proceed if the user hasn't changed any of the macronutrient data, and there is data for the current food item locally stored
      filter(() => this.mainFormGroup.get('protein').pristine && this.mainFormGroup.get('carbs').pristine && this.mainFormGroup.get('fat').pristine && !!this.foundItem),
    ).subscribe(newValue => {
      // Calculate a ratio using the old calorie value of the food and the new value the user has entered
      const ratio = newValue / this.foundItem.calories;
      // Adjust the current food's macronutrients using this new ratio
      this.mainFormGroup.get('protein').setValue(roundNumber(this.foundItem.protein * ratio));
      this.mainFormGroup.get('carbs').setValue(roundNumber(this.foundItem.carbs * ratio));
      this.mainFormGroup.get('fat').setValue(roundNumber(this.foundItem.fat * ratio));
    });
  }

  ngOnDestroy() {
    // Destroy any ongoing subscriptions
    this.componentDestruction$.next();
  }

}
