import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, EMPTY, Observable, of, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {filter, map, shareReplay, switchMap, takeUntil, tap} from 'rxjs/operators';
import {formatDate} from '../functions/formatDate';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {

  // Hard coded uid
  public userId$ = of(1);

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
    private http: HttpClient
  ) {
    this.userId$.pipe(
      takeUntil(this.destruction$)
    ).subscribe(userID => {
      this.getUserData(userID);
      this.getUserCalories(userID);
      this.getUserCaloriesWeek(userID);
      this.getUserWeight(userID);
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
        const mostRecentDate = new Date(this.userWeightOverTime[this.userWeightOverTime.length - 1].date);
        const today = new Date();
        if (today.getDate() === mostRecentDate.getDate() && today.getMonth() === mostRecentDate.getMonth() && today.getFullYear() === mostRecentDate.getFullYear()) {
          this.userWeightOverTime[this.userWeightOverTime.length - 1] = data;
        } else {
          this.userWeightOverTime.push(data);
        }
        this.userWeightOverTime$.next(this.userWeightOverTime);
      })
    );
  }

  public saveUserData(userData: any) {
    return this.http.patch(`api/user/${userData.id}`, userData).pipe(
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
    return this.userId$.pipe(
      switchMap(userID => this.http.patch(`api/user/${userID}/calories`, toSave)),
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
    return this.userId$.pipe(
      switchMap(userID => this.http.patch(`api/user/${userID}/calories`, toSave)),
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
    return this.userId$.pipe(
      switchMap(userID => this.http.patch(`api/user/${userID}/calories`, toSave)),
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
