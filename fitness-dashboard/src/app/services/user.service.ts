import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, EMPTY, Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {catchError, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {formatDate} from '../functions/formatDate';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {MatSnackBar} from '@angular/material';
import {roundNumber} from '../functions/roundNumber';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {

  // Local copy of the currently logged-in user's id
  private userId;
  // Public observable that emits to any components/services listening to the user's id whenever it changes
  public userId$ = new BehaviorSubject(this.userId);

  // Private JWT token variable used to verify the logged-in user
  private token;

  // Local copy of a boolean that keeps track of whether a user is logged into the app or not
  private loggedIn = false;
  // Public observable that emits to any components listening to whether a user is logged in
  public loggedIn$ = new BehaviorSubject(this.loggedIn);

  // Used to terminate ongoing subscriptions when this service is destroyed
  private componentDestruction$ = new Subject();

  // Local copy of the currently logged-in user's data
  private user = {} as any;
  // Public observable that emits the current user's data whenever it changes
  public user$ = new BehaviorSubject(this.user);

  // Local copy of the user's calories over the week
  private userCaloriesWeek = [];
  // Public observable that emits when the user's calories over the week change
  public userCaloriesWeek$ = new BehaviorSubject(this.userCaloriesWeek);

  // Local copy of the user's calories over all time
  private allUserCalories = [];
  // Public observable that emits when the user's calories change at all
  public allUserCalories$ = new BehaviorSubject(this.allUserCalories);

  // Local copy of the user's weight over time
  private userWeightOverTime = [];
  // Public observable that emits when the user's weight changes at all
  public userWeightOverTime$ = new BehaviorSubject(this.userWeightOverTime);

  // Private copy of how many calories the user has consumed throughout the day
  private caloriesConsumed = 0;
  // Public observable to emit changes to the calories the user has consumed
  public caloriesConsumed$ = new BehaviorSubject(this.caloriesConsumed);

  // Private copy of how many calories the user has burned throughout the day
  private caloriesBurned = 0;
  // Public observable to emit changes to the calories the user has burned
  public caloriesBurned$ = new BehaviorSubject(this.caloriesBurned);

  // Observable that listens to changes in the current user's info, and the amount of calories they've burned/consumed
  public caloriesLeft$ = combineLatest([
    this.user$,
    this.caloriesBurned$,
    this.caloriesConsumed$
  ]).pipe(
    map(([userData, caloriesBurned, caloriesConsumed]) => {
      // Return an object containing how many calories the user is allowed, how many they've burned/consumed, and also how many calories they have left for the day
      return {
        allowed: roundNumber(userData.calories_allowed),
        burned: roundNumber(caloriesBurned),
        consumed: roundNumber(caloriesConsumed),
        left: roundNumber(userData.calories_allowed + caloriesBurned - caloriesConsumed),
      };
    })
  );

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private snackBar: MatSnackBar,
  ) {
    // When this service is initialised, listen for changes in the user id
    this.userId$.pipe(
      takeUntil(this.componentDestruction$),
      // Only proceed if a user id is actually emitted
      filter(uid => !!uid),
    ).subscribe(userID => {
      // Once the user id comes through, send requests to each of the different user data endpoints with new id
      this.getUserData(userID);
      this.getUserCalories(userID);
      this.getUserCaloriesWeek(userID);
      this.getUserWeight(userID);
    });
    // Get the JWT token and user ID stored as cookies
    this.token = this.cookieService.get('token');
    this.userId = this.cookieService.get('uid');
    // If a userId is stored in the cookies, emit that as the current user id
    if (!!this.userId) { this.userId$.next(this.userId); }
  }

  // Function used to send a log in request to the API using the given username and password
  public login(uname, pword) {
    // Send a POST request to the API to log in using the given username and password
    this.http.post(`api/login`, { username: uname, password: pword }).subscribe((response: any) => {
      // If false is returned, then the username or password was invalid. Show an error message and return
      if (response === false) {
        this.snackBar.open(
          'Invalid Username/Password',
          'Dismiss',
          {duration: 5000, panelClass: 'snackbar-danger', verticalPosition: 'top', horizontalPosition: 'center'}
        );
        return;
      }
      // If a response was given, that means the user is logged in.
      // Store the JWT returned and the uid returned as cookies, and emit the user's id
      this.token = response.token;
      this.userId = response.uid;
      this.userId$.next(this.userId);
      this.cookieService.set('token', response.token);
      this.cookieService.set('uid', response.uid);
      // Route to the app dashboard now that the user has been logged in
      this.router.navigateByUrl('dashboard');
    });
  }

  // Function that sends a verification request to the API using the JWT stored as a cookie.
  public verify(): Observable<any> {
    return this.http.post(`api/verify`, { token: this.token }).pipe(
      tap(response => {
        if (!!response) {
          // If the user is verified successfully, emit that a user is logged in
          this.loggedIn = true;
          this.loggedIn$.next(this.loggedIn);
        }
      })
    );
  }

  // Function that logs the current user out, and deletes any cookies for the current user.
  public logout() {
    this.cookieService.delete('token');
    this.cookieService.delete('uid');
    this.loggedIn = false;
    this.loggedIn$.next(this.loggedIn);
    this.router.navigateByUrl('login');
  }

  // Function that sends a request to the API to create a new user, using the given information
  public register(newUser) {
    // Send a POST request to the API to create a new user, using the data provided to this function
    this.http.post(`api/register`, newUser).pipe(
      catchError(err => {
        // If an error returns, show an error message and return
        this.snackBar.open(
          'Username already taken',
          'Dismiss',
          {duration: 5000, panelClass: 'snackbar-danger', verticalPosition: 'top', horizontalPosition: 'center'}
        );
        return EMPTY;
      }),
      // Only proceed if userData is actually returned
      filter(userData => !!userData),
      // Create a new 'point' on the weight over time graph using the user's initial weight entered
      switchMap((userData: any) => this.saveUserWeight(userData.id, userData.weight)),
    ).subscribe(response => {
      // Show a success message
      this.snackBar.open(
        'Account Created!',
        'Dismiss',
        {duration: 5000, panelClass: 'snackbar-success', verticalPosition: 'top', horizontalPosition: 'center'}
      );
      // Log in, using the newly created user
      this.login(newUser.username, newUser.password);
    });
  }

  // Function to retrieve data from the API for the user matching the provided id
  public getUserData(userID) {
    this.http.get(`api/user/${userID}`).subscribe(userData => {
      // Update the local copy of the user's data, and cause the user data observable to emit
      this.user = userData;
      this.user$.next(this.user);
    });
  }

  // Function to retrieve a user's calories over time from the API, using the provided user id
  public getUserCalories(userID) {
    this.http.get(`api/user/${userID}/calories`).subscribe((userCalories: any) => {
      // Update the local user calorie store, and cause the user calorie observable to emit
      this.allUserCalories = userCalories;
      this.allUserCalories$.next(this.allUserCalories);
    });
  }

  // Function to retrieve a user's calories from the past week, using the provided user id
  public getUserCaloriesWeek(userID) {
    this.http.get(`api/user/${userID}/calories/week`).pipe(
      switchMap((userCalories: any) => {
        // Update the local user calorie week store and observable
        this.userCaloriesWeek = userCalories;
        this.userCaloriesWeek$.next(this.userCaloriesWeek);
        // Extract 'todays' data from the API response
        let todaysData = userCalories[6];
        // If no data is found for today, create a new calorie entry for today
        if (!todaysData.id) {
          todaysData = {
            uid: userID,
            date: formatDate(),
            calories_consumed: 0,
            calories_burned: 0,
            calories_allowed: this.user.calories_allowed,
          };
          return this.http.patch(`api/user/${userID}/calories`, todaysData);
        } else { // If data is found for today, update both the local stores & observables of how many calories the user has consumed/burned
          this.caloriesConsumed = todaysData.calories_consumed;
          this.caloriesConsumed$.next(this.caloriesConsumed);
          this.caloriesBurned = todaysData.calories_burned;
          this.caloriesBurned$.next(this.caloriesBurned);
          return EMPTY;
        }
      }),
      // Only proceed if a new entry has just been created for today
      filter(todaysData => !!todaysData),
    ).subscribe(todaysData => {
      // Update the relevant local stores & observables with the new 'today' data
      this.userCaloriesWeek[6] = todaysData;
      this.userCaloriesWeek$.next(this.userCaloriesWeek);
      this.caloriesConsumed = 0;
      this.caloriesConsumed$.next(this.caloriesConsumed);
      this.caloriesBurned = 0;
      this.caloriesBurned$.next(this.caloriesBurned);
    });
  }

  // Function to retrieve the user's weight over time from the API, using the given user id
  public getUserWeight(userID) {
    this.http.get(`api/user/${userID}/weight`).subscribe((userWeightOverTime: any) => {
      if (!userWeightOverTime) { return; }
      // Update the local store & the observable once the data returns
      this.userWeightOverTime = userWeightOverTime;
      this.userWeightOverTime$.next(this.userWeightOverTime);
    });
  }

  // Function to save the user's current weight to the 'weight over time' table stored in the database
  public saveUserWeight(userID, userWeight) {
    return this.http.patch(`api/user/${userID}/weight`, { weight: userWeight, date: formatDate() }).pipe(
      tap(data => {
        // Get the most recent date contained within the local weight over time store
        const mostRecentDate = this.userWeightOverTime.length > 0 ? new Date(this.userWeightOverTime[this.userWeightOverTime.length - 1].date) : undefined;
        // Create a new Date object for today
        const today = new Date();
        // If the most recent date in the data store is the same data as today, simply update the local store's values
        if (!!mostRecentDate && today.getDate() === mostRecentDate.getDate() && today.getMonth() === mostRecentDate.getMonth() && today.getFullYear() === mostRecentDate.getFullYear()) {
          this.userWeightOverTime[this.userWeightOverTime.length - 1] = data;
        } else { // If the most data in the local store is before today, push the returned object onto the end of the array instead
          this.userWeightOverTime.push(data);
        }
        // Update the user weight over time observable with the new changes
        this.userWeightOverTime$.next(this.userWeightOverTime);
      })
    );
  }

  // Function that sends a save request to the API to change the currently logged-in user's data
  public saveUserData(userData: any) {
    return this.http.patch(`api/user/${this.userId}`, userData).pipe(
      tap(data => {
        this.user = data;
        this.user$.next(this.user);
      }),
    );
  }

  // Function to save the amount of calories allowed today for the user
  public saveCaloriesAllowed(caloriesAllowed) {
    // Create a new object containing today's date, and the provided amount of allowed calories
    const toSave = {
      date: formatDate(),
      calories_allowed: caloriesAllowed,
    };
    // Send a PATCH request to update/create the amount of calories the user is allowed today
    return this.http.patch(`api/user/${this.userId}/calories`, toSave).pipe(
      // Once request returns, update local stores and relevant observables
      tap((data: any) => {
        this.allUserCalories[this.allUserCalories.length - 1] = data;
        this.allUserCalories$.next(this.allUserCalories);
        this.userCaloriesWeek[6] = data;
        this.userCaloriesWeek$.next(this.userCaloriesWeek);
        this.caloriesConsumed = data.calories_consumed;
        this.caloriesConsumed$.next(this.caloriesConsumed);
      })
    );
  }

  // Much the same as the funcion above, but for calories consumed instead of allowed
  public saveCaloriesConsumed(foodItems) {
    const toSave = {
      date: formatDate(),
      calories_consumed: 0,
      calories_allowed: this.user.calories_allowed,
    };
    for (const foodItem of foodItems) {
      toSave.calories_consumed += foodItem.calories;
    }
    return this.http.patch(`api/user/${this.userId}/calories`, toSave).pipe(
      tap((data: any) => {
        this.allUserCalories[this.allUserCalories.length - 1] = data;
        this.allUserCalories$.next(this.allUserCalories);
        this.userCaloriesWeek[6] = data;
        this.userCaloriesWeek$.next(this.userCaloriesWeek);
        this.caloriesConsumed = data.calories_consumed;
        this.caloriesConsumed$.next(this.caloriesConsumed);
      }),
    );
  }

  // Same as above, except for calories burned instead of calories allowed/consumed
  public saveCaloriesBurned(exerciseItems) {
    const toSave = {
      date: formatDate(),
      calories_burned: 0,
      calories_allowed: this.user.calories_allowed,
    };
    for (const exerciseItem of exerciseItems) {
      toSave.calories_burned += exerciseItem.calories;
    }
    return this.http.patch(`api/user/${this.userId}/calories`, toSave).pipe(
      tap((data: any) => {
        this.allUserCalories[this.allUserCalories.length - 1] = data;
        this.allUserCalories$.next(this.allUserCalories);
        this.userCaloriesWeek[6] = data;
        this.userCaloriesWeek$.next(this.userCaloriesWeek);
        this.caloriesBurned = data.calories_burned;
        this.caloriesBurned$.next(this.caloriesBurned);
      }),
    );
  }

  ngOnDestroy() {
    // Destroy any ongoing subscriptions
    this.componentDestruction$.next();
  }

}
