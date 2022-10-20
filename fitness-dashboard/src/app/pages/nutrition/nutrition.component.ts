import {Component, OnDestroy, OnInit} from '@angular/core';
import {faCircleInfo, faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {debounceTime, filter, pairwise, switchMap, takeUntil} from 'rxjs/operators';
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

  public addIcon = faPlusCircle;
  public removeIcon = faMinusCircle;
  public infoIcon = faCircleInfo;
  private componentDestruction$ = new Subject();

  public searchingItem = false;
  public showDietGraph = true;
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
    foodItem.servings = Number(foodItem.servings);
    this.userNutritionService.saveNutritionItem(foodItem).pipe(
      switchMap(foodItems => this.userService.saveCaloriesConsumed(foodItems)),
    ).subscribe(() => {
      const nutritionView = document.getElementsByClassName('nutritionList')[0];
      nutritionView.scrollTop = nutritionView.scrollHeight;
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
    this.showDietGraph = false;
    if (!foodItems || foodItems.length < 1) {
      return;
    }
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
      this.showDietGraph = true;
      setTimeout(() => {
        const totalNutrition = totalFat + totalCarbs + totalProtein;
        const percentageFat = roundNumber(totalFat / totalNutrition * 100);
        const percentageCarbs = roundNumber(totalCarbs / totalNutrition * 100);
        const percentageProtein = roundNumber(totalProtein / totalNutrition * 100);
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
      if (userData.diet_plan === null || userData.diet_plan === undefined) { return ''; }
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
      const idealFatPercentage = roundNumber(idealNutrition.fat / totalNutrition * 100);
      const idealCarbsPercentage = roundNumber(idealNutrition.carb / totalNutrition * 100);
      const idealProteinPercentage = roundNumber(idealNutrition.protein / totalNutrition * 100);
      this.userDietPlan = dietPlanOptions.find(plan => plan.value === userData.diet_plan).label;
      this.initMyPlanChart(idealFatPercentage, idealCarbsPercentage, idealProteinPercentage);
    });

    this.mainFormGroup.get('servings').valueChanges.pipe(
      takeUntil(this.componentDestruction$),
      filter(() => this.mainFormGroup.dirty),
    ).subscribe(servings => {
      if (!this.foundItem) { return; }
      this.mainFormGroup.get('calories').setValue(roundNumber(this.foundItem.calories * servings));
      this.mainFormGroup.get('fat').setValue(roundNumber(this.foundItem.fat * servings));
      this.mainFormGroup.get('carbs').setValue(roundNumber(this.foundItem.carbs * servings));
      this.mainFormGroup.get('protein').setValue(roundNumber(this.foundItem.protein * servings));
    });

    this.mainFormGroup.get('calories').valueChanges.pipe(
      takeUntil(this.componentDestruction$),
      filter(() => this.mainFormGroup.get('protein').pristine && this.mainFormGroup.get('carbs').pristine && this.mainFormGroup.get('fat').pristine && !!this.foundItem),
      debounceTime(700),
    ).subscribe(newValue => {
      const ratio = newValue / this.foundItem.calories;
      this.mainFormGroup.get('protein').setValue(roundNumber(this.foundItem.protein * ratio));
      this.mainFormGroup.get('carbs').setValue(roundNumber(this.foundItem.carbs * ratio));
      this.mainFormGroup.get('fat').setValue(roundNumber(this.foundItem.fat * ratio));
    });
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
