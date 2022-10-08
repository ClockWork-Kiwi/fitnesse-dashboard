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

  public searchingItem = false;

  public userFoodItems$ = this.userNutritionService.observable$.pipe(
    takeUntil(this.componentDestruction$),
    tap(data => {
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
    public userService: UserService,
  ) { }

  public searchFoodItem() {
    this.searchingItem = true;
    const foodItem = this.mainFormGroup.get('food_name').value;
    this.foodDataService.getFoodData(foodItem).subscribe(data => {
      this.searchingItem = false;
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
    this.mainFormGroup.get('food_name').reset();
    this.mainFormGroup.get('calories').reset();
    this.nutritionService.saveNutritionItem(foodItem).pipe(
      switchMap(foodItems => this.userService.saveCaloriesConsumed(foodItems)),
    ).subscribe(() => {});
  }

  public removeFoodItem(itemID) {
    this.userNutritionService.deleteNutritionItem(itemID).pipe(
      switchMap(foodItems => this.userService.saveCaloriesConsumed(foodItems)),
    ).subscribe();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
