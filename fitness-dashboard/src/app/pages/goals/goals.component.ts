import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FitnessCalculatorService} from '../../services/fitness-calculator.service';
import {UserService} from '../../services/user.service';

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

  private dietPlanMap = {
    0: 'balancedDietPlan ',
    1: 'lowCarbDietPlan ',
    2: 'highCarbDietPlan ',
    3: 'highProteinDietPlan ',
    4: 'lowFatDietPlan ',
  };

  public mainFormGroup = this.fb.group({
    sex: [null, Validators.required],
    age: [null, Validators.required],
    height: [null, Validators.required],
    weight: [null, Validators.required],
    weightGoal: [null, Validators.required],
    dietPlan: [null],
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private fitnessCalculatorService: FitnessCalculatorService,
  ) { }

  public calculateCalories() {
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    const calculatedCalories = this.fitnessCalculatorService.calculateCalories(
      this.mainFormGroup.get('sex').value,
      this.mainFormGroup.get('age').value,
      this.mainFormGroup.get('height').value,
      this.mainFormGroup.get('weight').value,
      'sedentary',
    );
    const goalString = this.weightGoalMap[this.mainFormGroup.get('weightGoal').value];
    this.caloriesAllowed = Math.round(calculatedCalories[goalString] / 10) * 10;
  }

  ngOnInit() {
    this.userService.observable$.pipe(
      takeUntil(this.componentDestruction$)
    ).subscribe(userData => {
      this.mainFormGroup.patchValue(userData);
    });
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
