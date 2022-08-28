import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {FitnessCalculatorService} from '../../services/fitness-calculator.service';

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
    { value: 'balance', label: 'Maintain Current Weight' },
    { value: 'mildWeightLoss', label: 'Slow Weight Loss' },
    { value: 'heavyWeightLoss', label: 'Fast Weight Loss' },
    { value: 'mildWeightGain', label: 'Slow Weight Gain' },
    { value: 'heavyWeightGain', label: 'Fast Weight Gain' },
  ];

  public mainFormGroup = this.fb.group({
    sex: [null, Validators.required],
    age: [null, Validators.required],
    height: [null, Validators.required],
    weight: [null, Validators.required],
    weightGoal: [null, Validators.required],
    // activityLevel: [null, Validators.required],
    // startDate: [null],
    // endDate: [null],
    // startWeight: [null],
    // endWeight: [null],
  });

  constructor(
    private fb: FormBuilder,
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
    this.caloriesAllowed = Math.round(calculatedCalories[this.mainFormGroup.get('weightGoal').value] / 100) * 100;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
