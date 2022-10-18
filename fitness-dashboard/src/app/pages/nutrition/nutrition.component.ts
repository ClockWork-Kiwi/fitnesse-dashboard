import {Component, OnDestroy, OnInit} from '@angular/core';
import {faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {UserNutritionService} from '../../services/user-nutrition.service';
import {UserService} from '../../services/user.service';
import {FoodDataService} from '../../services/food-data.service';
import {Chart} from 'chart.js';
import {FitnessCalculatorService} from '../../services/fitness-calculator.service';

@Component({
  selector: 'app-nutrition',
  templateUrl: './nutrition.component.html',
  styleUrls: ['./nutrition.component.scss']
})
export class NutritionComponent implements OnInit, OnDestroy {

  public addIcon = faPlusCircle;
  public removeIcon = faMinusCircle;
  private componentDestruction$ = new Subject();

  public searchingItem = false;
  private foundItem;

  public userFoodItems$ = this.userNutritionService.observable$.pipe(
    takeUntil(this.componentDestruction$),
  );

  public userDietPlan;

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
    private userNutritionService: UserNutritionService,
    private foodDataService: FoodDataService,
    public userService: UserService,
    private fitnessCalculatorService: FitnessCalculatorService,
  ) { }

  public searchFoodItem() {
    this.searchingItem = true;
    const foodItem = this.mainFormGroup.get('food_name').value;
    this.foodDataService.getFoodData(foodItem).subscribe(data => {
      this.searchingItem = false;
      this.foundItem = data;
      if (!data) { return; }
      const servings = this.mainFormGroup.get('servings').value;
      this.mainFormGroup.get('calories').setValue(data.calories * servings);
      this.mainFormGroup.get('fat').setValue(data.fat * servings);
      this.mainFormGroup.get('carbs').setValue(data.carbs * servings);
      this.mainFormGroup.get('protein').setValue(data.protein * servings);
    });
  }

  public addFoodItem() {
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    const foodItem = this.mainFormGroup.getRawValue();
    this.userNutritionService.saveNutritionItem(foodItem).pipe(
      switchMap(foodItems => this.userService.saveCaloriesConsumed(foodItems)),
    ).subscribe(() => {
      this.foundItem = undefined;
      this.mainFormGroup.reset({servings: 1});
      this.mainFormGroup.markAsPristine();
    });
  }

  public removeFoodItem(itemID) {
    this.userNutritionService.deleteNutritionItem(itemID).pipe(
      switchMap(foodItems => this.userService.saveCaloriesConsumed(foodItems)),
    ).subscribe();
  }

  public initMyDietChart(foodItems) {
    if (!foodItems || foodItems.length < 1) { return; }
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
    if (totalFat > 0 || totalCarbs > 0 || totalProtein > 0) {
      const totalNutrition = totalFat + totalCarbs + totalProtein;
      const percentageFat = (totalFat / totalNutrition * 100).toFixed(2);
      const percentageCarbs = (totalCarbs / totalNutrition * 100).toFixed(2);
      const percentageProtein = (totalProtein / totalNutrition * 100).toFixed(2);
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
    }
  }

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
    this.userFoodItems$.subscribe(foodItems => {
      this.initMyDietChart(foodItems);
    });

    this.userService.user$.pipe(
      takeUntil(this.componentDestruction$),
    ).subscribe(userData => {
      if (!userData.diet_plan) { return ''; }
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
      const idealNutrition = this.fitnessCalculatorService.calculateNutrition(
        userData.sex,
        userData.age,
        userData.height,
        userData.weight,
        'light',
        weightGoalMap[userData.weight_goal]
      )[dietPlanMap[userData.diet_plan]];
      const totalNutrition = idealNutrition.fat + idealNutrition.carb + idealNutrition.protein;
      const idealFatPercentage = (idealNutrition.fat / totalNutrition * 100).toFixed(2);
      const idealCarbsPercentage = (idealNutrition.carb / totalNutrition * 100).toFixed(2);
      const idealProteinPercentage = (idealNutrition.protein / totalNutrition * 100).toFixed(2);
      this.userDietPlan = dietPlanOptions.find(plan => plan.value === userData.diet_plan).label;
      this.initMyPlanChart(idealFatPercentage, idealCarbsPercentage, idealProteinPercentage);
    });

    this.mainFormGroup.get('servings').valueChanges.pipe(
      takeUntil(this.componentDestruction$),
      filter(() => this.mainFormGroup.dirty),
    ).subscribe(servings => {
      if (!this.foundItem) { return; }
      this.mainFormGroup.get('calories').setValue(this.foundItem.calories * servings);
      this.mainFormGroup.get('fat').setValue(this.foundItem.fat * servings);
      this.mainFormGroup.get('carbs').setValue(this.foundItem.carbs * servings);
      this.mainFormGroup.get('protein').setValue(this.foundItem.protein * servings);
    });
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
