import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, EMPTY, Observable, of, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {filter, map, shareReplay, switchMap, takeUntil, tap} from 'rxjs/operators';
import {formatDate} from '../functions/formatDate';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {MatSnackBar} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {

  private userId;
  public userId$ = new BehaviorSubject(this.userId);

  private token;

  private loggedIn = false;
  public loggedIn$ = new BehaviorSubject(this.loggedIn);

  private destruction$ = new Subject();

  private user = {} as any;
  public user$ = new BehaviorSubject(this.user);

  private userCaloriesWeek = [];
  public userCaloriesWeek$ = new BehaviorSubject(this.userCaloriesWeek);

  private allUserCalories = [];
  public allUserCalories$ = new BehaviorSubject(this.allUserCalories);

  private userWeightOverTime = [];
  public userWeightOverTime$ = new BehaviorSubject(this.userWeightOverTime);

  private caloriesConsumed = 0;
  public caloriesConsumed$ = new BehaviorSubject(this.caloriesConsumed);

  private caloriesBurned = 0;
  public caloriesBurned$ = new BehaviorSubject(this.caloriesBurned);

  public caloriesLeft$ = combineLatest([
    this.user$,
    this.caloriesBurned$,
    this.caloriesConsumed$
  ]).pipe(
    map(([userData, caloriesBurned, caloriesConsumed]) => {
      return userData.calories_allowed + caloriesBurned - caloriesConsumed;
    })
  );

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private snackBar: MatSnackBar,
  ) {
    this.userId$.pipe(
      takeUntil(this.destruction$),
      filter(uid => !!uid),
    ).subscribe(userID => {
      this.getUserData(userID);
      this.getUserCalories(userID);
      this.getUserCaloriesWeek(userID);
      this.getUserWeight(userID);
    });

    this.token = this.cookieService.get('token');
    this.userId = this.cookieService.get('uid');
    if (!!this.userId) { this.userId$.next(this.userId); }
  }

  public login(uname, pword) {
    this.http.post(`api/login`, { username: uname, password: pword }).subscribe((response: any) => {
      if (response === false) {
        this.snackBar.open(
          'Invalid Username/Password',
          'Dismiss',
          {duration: 5000, panelClass: 'snackbar-danger', verticalPosition: 'top', horizontalPosition: 'center'}
        );
      }
      this.token = response.token;
      this.userId = response.uid;
      this.userId$.next(this.userId);
      this.cookieService.set('token', response.token);
      this.cookieService.set('uid', response.uid);
      this.router.navigateByUrl('dashboard');
    });
  }

  public verify(): Observable<any> {
    return this.http.post(`api/verify`, { token: this.token }).pipe(
      tap(response => {
        if (!!response) {
          this.loggedIn = true;
          this.loggedIn$.next(this.loggedIn);
        }
      })
    );
  }

  public logout() {
    this.cookieService.delete('token');
    this.cookieService.delete('uid');
    this.loggedIn = false;
    this.loggedIn$.next(this.loggedIn);
    this.router.navigateByUrl('login');
  }

  public register(newUser) {
    this.http.post(`api/register`, newUser).pipe(
      switchMap((userData: any) => this.saveUserWeight(userData.id, userData.weight)),
    ).subscribe(response => {
      this.router.navigateByUrl('login');
    });
  }

  public getUserData(userID) {
    this.http.get(`api/user/${userID}`).subscribe(userData => {
      this.user = userData;
      this.user$.next(this.user);
    });
  }

  public getUserCalories(userID) {
    this.http.get(`api/user/${userID}/calories`).subscribe((userCalories: any) => {
      this.allUserCalories = userCalories;
      this.allUserCalories$.next(this.allUserCalories);
    });
  }

  public getUserCaloriesWeek(userID) {
    this.http.get(`api/user/${userID}/calories/week`).pipe(
      switchMap((userCalories: any) => {
        this.userCaloriesWeek = userCalories;
        this.userCaloriesWeek$.next(this.userCaloriesWeek);
        let todaysData = userCalories[6];
        if (!todaysData.id) {
          todaysData = {
            uid: userID,
            date: formatDate(),
            calories_consumed: 0,
            calories_burned: 0,
            calories_allowed: this.user.calories_allowed,
          };
          return this.http.patch(`api/user/${userID}/calories`, todaysData);
        } else {
          this.caloriesConsumed = todaysData.calories_consumed;
          this.caloriesConsumed$.next(this.caloriesConsumed);
          this.caloriesBurned = todaysData.calories_burned;
          this.caloriesBurned$.next(this.caloriesBurned);
          return EMPTY;
        }
      }),
      filter(todaysData => !!todaysData),
    ).subscribe(todaysData => {
      this.userCaloriesWeek[6] = todaysData;
      this.userCaloriesWeek$.next(this.userCaloriesWeek);
      this.caloriesConsumed = 0;
      this.caloriesConsumed$.next(this.caloriesConsumed);
      this.caloriesBurned = 0;
      this.caloriesBurned$.next(this.caloriesBurned);
    });
  }

  public getUserWeight(userID) {
    this.http.get(`api/user/${userID}/weight`).subscribe((userWeightOverTime: any) => {
      if (!userWeightOverTime) { return; }
      this.userWeightOverTime = userWeightOverTime;
      this.userWeightOverTime$.next(this.userWeightOverTime);
    });
  }

  public saveUserWeight(userID, userWeight) {
    return this.http.patch(`api/user/${userID}/weight`, { weight: userWeight, date: formatDate() }).pipe(
      tap(data => {
        const mostRecentDate = this.userWeightOverTime.length > 0 ? new Date(this.userWeightOverTime[this.userWeightOverTime.length - 1].date) : undefined;
        const today = new Date();
        if (!!mostRecentDate && today.getDate() === mostRecentDate.getDate() && today.getMonth() === mostRecentDate.getMonth() && today.getFullYear() === mostRecentDate.getFullYear()) {
          this.userWeightOverTime[this.userWeightOverTime.length - 1] = data;
        } else {
          this.userWeightOverTime.push(data);
        }
        this.userWeightOverTime$.next(this.userWeightOverTime);
      })
    );
  }

  public saveUserData(userData: any) {
    return this.http.patch(`api/user/${this.userId}`, userData).pipe(
      tap(data => {
        this.user = data;
        this.user$.next(this.user);
      }),
    );
  }

  public saveCaloriesAllowed(caloriesAllowed) {
    const toSave = {
      date: formatDate(),
      calories_allowed: caloriesAllowed,
    };
    return this.http.patch(`api/user/${this.userId}/calories`, toSave).pipe(
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
    this.destruction$.next();
  }

}
