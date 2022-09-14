import {Component, OnDestroy, OnInit} from '@angular/core';
import {faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {switchMap, take, takeUntil} from 'rxjs/operators';
import {NutritionService} from '../../services/nutrition.service';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-nutrition',
  templateUrl: './nutrition.component.html',
  styleUrls: ['./nutrition.component.scss']
})
export class NutritionComponent implements OnInit, OnDestroy {

  public addIcon = faPlusCircle;
  public removeIcon = faMinusCircle;

  public foodItems = [];
  // Mocked up number- to be retrieved from database in future
  public totalCaloriesAllowed = 2200;
  public caloriesAllowedToday = 2200;
  public caloriesConsumedToday = 0;

  private caloriesChanged$ = new Subject();
  private componentDestruction$ = new Subject();

  public mainFormGroup = this.fb.group({
    food_name: [null, Validators.required],
    calories: [null, Validators.required],
    fat: [0],
    carbs: [0],
    protein: [0],
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private nutritionService: NutritionService,
  ) { }

  public addFoodItem() {
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    const foodItem = this.mainFormGroup.getRawValue();
    this.userService.userId$.pipe(
      take(1),
      switchMap(userID => this.nutritionService.saveNutritionItem(userID, foodItem))
    ).subscribe(result => {
      this.foodItems.push(result);
      this.mainFormGroup.get('food_name').reset();
      this.mainFormGroup.get('calories').reset();
      this.caloriesChanged$.next();
    });
  }

  public removeFoodItem(itemID) {
    this.userService.userId$.pipe(
      take(1),
      switchMap(userID => this.nutritionService.deleteNutritionItem(userID, itemID))
    ).subscribe(result => {
      const removeIndex = this.foodItems.findIndex(item => item.id === itemID);
      if (removeIndex > -1) {
        this.foodItems.splice(removeIndex, 1);
        this.caloriesChanged$.next();
      }
    });
  }

  ngOnInit() {
    this.caloriesChanged$.pipe(
      takeUntil(this.componentDestruction$)
    ).subscribe(() => {
      this.caloriesAllowedToday = this.totalCaloriesAllowed;
      this.caloriesConsumedToday = 0;
      for (const foodItem of this.foodItems) {
        this.caloriesAllowedToday -= foodItem.calories;
        this.caloriesConsumedToday += foodItem.calories;
      }
    });

    this.nutritionService.observable$.pipe(
      takeUntil(this.componentDestruction$),
    ).subscribe(data => {
      this.foodItems = data;
      this.caloriesChanged$.next();
    });
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
