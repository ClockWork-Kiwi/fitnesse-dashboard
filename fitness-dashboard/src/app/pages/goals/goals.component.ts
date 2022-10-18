import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {of, Subject} from 'rxjs';
import {switchMap, takeUntil, tap} from 'rxjs/operators';
import {FitnessCalculatorService} from '../../services/fitness-calculator.service';
import {UserService} from '../../services/user.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit, OnDestroy {

  private componentDestruction$ = new Subject();

  public caloriesAllowed;

  public sexOptions = [
    {value: 'male', label: 'Male'},
    {value: 'female', label: 'Female'},
  ];

  public weightGoalOptions = [
    { value: 0, label: 'Maintain Current Weight' },
    { value: 1, label: 'Slow Weight Loss' },
    { value: 2, label: 'Fast Weight Loss' },
    { value: 3, label: 'Slow Weight Gain' },
    { value: 4, label: 'Fast Weight Gain' },
  ];

  private weightGoalMap = {
    0: 'balance',
    1: 'mildWeightLoss',
    2: 'heavyWeightLoss',
    3: 'mildWeightGain',
    4: 'heavyWeightGain',
  };

  public dietPlanOptions = [
    { value: 0, label: 'Balanced' },
    { value: 1, label: 'Low Carb' },
    { value: 2, label: 'High Carb' },
    { value: 3, label: 'High Protein' },
    { value: 4, label: 'Low Fat' },
  ];

  public mainFormGroup = this.fb.group({
    id: [null],
    sex: [null, Validators.required],
    age: [null, Validators.required],
    height: [null, Validators.required],
    weight: [null, Validators.required],
    weight_goal: [null, Validators.required],
    diet_plan: [null],
    calories_allowed: [null],
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private fitnessCalculatorService: FitnessCalculatorService,
    private snackBar: MatSnackBar,
  ) { }

  public calculateCalories(formValue) {
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    const calculatedCalories = this.fitnessCalculatorService.calculateCalories(
      formValue.sex,
      formValue.age,
      formValue.height,
      formValue.weight,
      'sedentary',
    );
    const goalString = this.weightGoalMap[formValue.weight_goal];
    this.mainFormGroup.get('calories_allowed').setValue(Math.round(calculatedCalories[goalString] / 10) * 10, {emitEvent: false});
  }

  public saveUserDetails() {
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    this.userService.saveUserData(this.mainFormGroup.getRawValue()).pipe(
      tap(data => {
        if (!!data) {
          this.snackBar.open(
            'Saved Successfully!',
            'Dismiss',
            {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'panel-success',
            });
        }
      }),
      switchMap(() => this.userService.saveCaloriesAllowed(this.mainFormGroup.get('calories_allowed').value)),
      switchMap(() => {
        if (this.mainFormGroup.get('weight').dirty) {
          return this.userService.saveUserWeight(this.mainFormGroup.get('id').value, this.mainFormGroup.get('weight').value);
        }
        return of(undefined);
      }),
    ).subscribe(() => {
      this.mainFormGroup.markAsPristine();
    });
  }

  ngOnInit() {
    this.mainFormGroup.valueChanges.pipe(
      takeUntil(this.componentDestruction$)
    ).subscribe(value => {
      if (!!this.mainFormGroup.valid) {
        this.calculateCalories(value);
      }
    });

    this.userService.user$.pipe(
      takeUntil(this.componentDestruction$)
    ).subscribe(userData => {
      this.mainFormGroup.patchValue(userData);
    });
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
