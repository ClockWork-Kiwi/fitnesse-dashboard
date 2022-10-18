import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {FitnessCalculatorService} from '../../services/fitness-calculator.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

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

  public dietPlanOptions = [
    { value: 0, label: 'Balanced' },
    { value: 1, label: 'Low Carb' },
    { value: 2, label: 'High Carb' },
    { value: 3, label: 'High Protein' },
    { value: 4, label: 'Low Fat' },
  ];

  private weightGoalMap = {
    0: 'balance',
    1: 'mildWeightLoss',
    2: 'heavyWeightLoss',
    3: 'mildWeightGain',
    4: 'heavyWeightGain',
  };

  public mainFormGroup = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.required],
    sex: [null, Validators.required],
    age: [null, Validators.required],
    height: [null, Validators.required],
    weight: [null, Validators.required],
    weight_goal: [1, Validators.required],
    diet_plan: [0, Validators.required],
    calories_allowed: [null],
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private fitnessCalculatorService: FitnessCalculatorService,
  ) { }

  public register() {
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    this.calculateCalories(this.mainFormGroup.getRawValue());
    this.userService.register(this.mainFormGroup.getRawValue());
  }

  private calculateCalories(formValue) {
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

  ngOnInit() {
  }

}
