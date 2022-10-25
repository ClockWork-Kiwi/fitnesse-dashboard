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

  // Public & Private variables
  private componentDestruction$ = new Subject();
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

  // Form group for holding user data
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

  // Function that calculates how many calories a user is allowed based on the information given
  public calculateCalories(formValue) {
    // If any of the required fields are missing, mark all fields as touched (to show errors) and return
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    // Use the fitnessCalculatorService to calculate the user calories
    const calculatedCalories = this.fitnessCalculatorService.calculateCalories(
      formValue.sex,
      formValue.age,
      formValue.height,
      formValue.weight,
      'sedentary', // User activity is defaulted to 'sedentary', as user exercise is separately tracked in this app
    );
    // Get the corresponding weight goal value to what the user chose from the map
    const goalString = this.weightGoalMap[formValue.weight_goal];
    // Set the 'calories_allowed' value in the main form group to the value corresponding to the user's weight goal (rounded to a whole number)
    this.mainFormGroup.get('calories_allowed').setValue(Math.round(calculatedCalories[goalString] / 10) * 10, {emitEvent: false});
  }

  // Function to save updated user values- runs when user clicks 'Save' button after changing user information
  public saveUserDetails() {
    // Check form validity- return if not valid
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    // Send a save request to the API to update the user's information
    this.userService.saveUserData(this.mainFormGroup.getRawValue()).pipe(
      tap(data => {
        // If the save is successful, show a success message
        if (!!data) {
          this.snackBar.open(
            'Saved Successfully!',
            'Dismiss',
            {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: 'snackbar-success',
            });
        }
      }),
      // Update today's calories_allowed with the user's updated allowed calories
      switchMap(() => this.userService.saveCaloriesAllowed(this.mainFormGroup.get('calories_allowed').value)),
      // If the user's weight has changed, save the user's weight to the database
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
    // If any of the values in the main form group change, re-calculate the amount of calories the user is allowed
    this.mainFormGroup.valueChanges.pipe(
      takeUntil(this.componentDestruction$)
    ).subscribe(value => {
      if (!!this.mainFormGroup.valid) {
        this.calculateCalories(value);
      }
    });

    // If the user's data is updated, update the main form group's values to match
    this.userService.user$.pipe(
      takeUntil(this.componentDestruction$)
    ).subscribe(userData => {
      this.mainFormGroup.patchValue(userData);
    });
  }

  ngOnDestroy() {
    // Destroy any ongoing subscriptions
    this.componentDestruction$.next();
  }

}
