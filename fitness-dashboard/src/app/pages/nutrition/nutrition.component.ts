import {Component, OnDestroy, OnInit} from '@angular/core';
import {faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-nutrition',
  templateUrl: './nutrition.component.html',
  styleUrls: ['./nutrition.component.scss']
})
export class NutritionComponent implements OnInit, OnDestroy {

  public addIcon = faPlusCircle;
  public removeIcon = faMinusCircle;

  private caloriesChanged$ = new Subject();
  private componentDestruction$ = new Subject();

  public foodItems = [
    {foodName: 'Ham Sandwich', calories: 250}
  ];
  // Mocked up number- to be retrieved from database in future
  public totalCaloriesAllowed = 2200;
  public caloriesAllowedToday = 2200;
  public caloriesConsumedToday = 0;

  public mainFormGroup = this.fb.group({
    foodName: [null, Validators.required],
    calories: [null, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
  ) { }

  public addFoodItem() {
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    this.foodItems.push({
      foodName: this.mainFormGroup.get('foodName').value,
      calories: this.mainFormGroup.get('calories').value,
    });
    this.mainFormGroup.get('foodName').reset();
    this.mainFormGroup.get('foodName').markAsPristine();
    this.mainFormGroup.get('foodName').markAsUntouched();
    this.mainFormGroup.get('calories').reset();
    this.mainFormGroup.get('calories').markAsPristine();
    this.mainFormGroup.get('calories').markAsUntouched();
    this.caloriesChanged$.next();
  }

  public removeFoodItem(index) {
    this.foodItems.splice(index, 1);
    this.caloriesChanged$.next();
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
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
