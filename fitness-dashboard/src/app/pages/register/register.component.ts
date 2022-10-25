import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {UserService} from '../../services/user.service';
import {FitnessCalculatorService} from '../../services/fitness-calculator.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  // Public & Private variables
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

  // Main form group to hold the new user's data (all are required to create a user)
  public mainFormGroup = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.required],
    confirmPassword: [null, Validators.required],
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
    private snackBar: MatSnackBar,
  ) { }

  // Function that runs when the user clicks the 'Register' button
  public register() {
    // If any required fields are missing, show field errors and return
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    // If the password/confirm password fields do not match, show an error message and return
    if (this.mainFormGroup.get('password').value !== this.mainFormGroup.get('confirmPassword').value) {
      this.snackBar.open(
        'Passwords must match',
        'Dismiss',
        {duration: 5000, panelClass: 'snackbar-danger', verticalPosition: 'top', horizontalPosition: 'center'}
      );
      this.mainFormGroup.get('confirmPassword').reset();
      this.mainFormGroup.get('confirmPassword').markAsTouched();
      return;
    }
    // Calculate the amount of calories the new user will be allowed per day
    this.calculateCalories(this.mainFormGroup.getRawValue());
    // Register the new user using the information entered and the 'calories_allowed' calculated value
    this.userService.register(this.mainFormGroup.getRawValue());
  }

  // Calculates the amount of calories the user should try to eat each day to achieve their goal
  private calculateCalories(formValue) {
    // Use the fitness calculator service to calculate the amount of calories the user should eat each day
    const calculatedCalories = this.fitnessCalculatorService.calculateCalories(
      formValue.sex,
      formValue.age,
      formValue.height,
      formValue.weight,
      'sedentary', // 'Sedentary' is set as activity level by default, as user exercise is tracked separately in this app
    );
    // Extract the amount of calories the user is allowed from the returned value, and set the 'calories_allowed' field to match
    const goalString = this.weightGoalMap[formValue.weight_goal];
    this.mainFormGroup.get('calories_allowed').setValue(Math.round(calculatedCalories[goalString] / 10) * 10, {emitEvent: false});
  }

  ngOnInit() {
  }

}
