import {Component, OnDestroy, OnInit} from '@angular/core';
import {faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {debounceTime, filter, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {UserNutritionService} from '../../services/user-nutrition.service';
import {UserService} from '../../services/user.service';
import {FoodDataService} from '../../services/food-data.service';

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

  ngOnInit() {
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
