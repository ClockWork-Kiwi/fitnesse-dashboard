import {Component, OnDestroy, OnInit} from '@angular/core';
import {faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {switchMap, take, takeUntil, tap} from 'rxjs/operators';
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
  private componentDestruction$ = new Subject();

  // Mocked up number- to be retrieved from database in future
  public totalCaloriesAllowed = 2200;
  public caloriesAllowedToday = 2200;
  public caloriesConsumedToday = 0;

  public foodItems$ = this.nutritionService.observable$.pipe(
    takeUntil(this.componentDestruction$),
    tap(data => {
      this.caloriesAllowedToday = this.totalCaloriesAllowed;
      this.caloriesConsumedToday = 0;
      for (const foodItem of data) {
        this.caloriesAllowedToday -= foodItem.calories;
        this.caloriesConsumedToday += foodItem.calories;
      }
    })
  );

  public mainFormGroup = this.fb.group({
    food_name: [null, Validators.required],
    calories: [null, Validators.required],
    fat: [0],
    carbs: [0],
    protein: [0],
  });

  constructor(
    private fb: FormBuilder,
    private nutritionService: NutritionService,
  ) { }

  public addFoodItem() {
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    const foodItem = this.mainFormGroup.getRawValue();
    this.nutritionService.saveNutritionItem(foodItem).subscribe(result => {
      this.mainFormGroup.get('food_name').reset();
      this.mainFormGroup.get('calories').reset();
    });
  }

  public removeFoodItem(itemID) {
    this.nutritionService.deleteNutritionItem(itemID).subscribe();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
