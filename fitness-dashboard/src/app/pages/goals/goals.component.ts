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

  public sexOptions = [
    {value: 'male', label: 'Male'},
    {value: 'female', label: 'Female'},
  ];

  public activityLevelOptions = [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'active', label: 'Active' },
    { value: 'extreme', label: 'Extreme' },
  ];

  public mainFormGroup = this.fb.group({
    sex: [null, Validators.required],
    age: [null, Validators.required],
    height: [null, Validators.required],
    weight: [null, Validators.required],
    activityLevel: [null, Validators.required],
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

    console.log(
      this.fitnessCalculatorService.calculateCalories(
        this.mainFormGroup.get('sex').value,
        this.mainFormGroup.get('age').value,
        this.mainFormGroup.get('height').value,
        this.mainFormGroup.get('weight').value,
        this.mainFormGroup.get('activityLevel').value,
      )
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
