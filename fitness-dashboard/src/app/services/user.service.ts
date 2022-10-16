import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map, shareReplay, switchMap, takeUntil, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {

  // Hard coded uid
  public userId$ = of(1);

  private destruction$ = new Subject();

  private store = {} as any;
  private subject$ = new BehaviorSubject(this.store);
  public observable$ = this.subject$.pipe() as Observable<any>;

  private userCaloriesWeek = [];
  public userCaloriesWeek$ = new BehaviorSubject(this.userCaloriesWeek);

  private userWeight = [];
  public userWeight$ = new BehaviorSubject(this.userWeight);

  private caloriesConsumed = 0;
  public caloriesConsumed$ = new BehaviorSubject(this.caloriesConsumed);

  private caloriesBurned = 0;
  public caloriesBurned$ = new BehaviorSubject(this.caloriesBurned);

  public caloriesLeft$ = combineLatest([
    this.observable$,
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
      this.getUserWeight(userID);
    });
  }

  public getUserData(userID) {
    this.http.get(`api/user/${userID}`).subscribe(userData => {
      this.store = userData;
      this.subject$.next(this.store);
    });
  }

  public getUserCalories(userID) {
    this.http.get(`api/user/${userID}/calories`).subscribe((userCalories: any) => {
      if (!userCalories) { return; }
      this.userCaloriesWeek = userCalories;
      this.userCaloriesWeek$.next(this.userCaloriesWeek);
      const todaysData = userCalories[6];
      if (!todaysData.id) { return; }
      this.caloriesConsumed = userCalories[6].calories_consumed || 0;
      this.caloriesConsumed$.next(this.caloriesConsumed);
      this.caloriesBurned = userCalories[6].calories_burned || 0;
      this.caloriesBurned$.next(this.caloriesBurned);
    });
  }

  public getUserWeight(userID) {
    this.http.get(`api/user/${userID}/weight`).subscribe((userWeight: any) => {
      if (!userWeight) { return; }
      this.userWeight = userWeight;
      this.userWeight$.next(this.userWeight);
    });
  }

  public saveUserData(userData: any) {
    return this.http.patch(`api/user/${userData.id}`, userData).pipe(
      tap(data => {
        this.store = data;
        this.subject$.next(this.store);
      }),
    );
  }

  public saveCaloriesConsumed(foodItems) {
    const toSave = {
      date: new Date().toISOString().split('T')[0],
      calories_consumed: 0,
      calories_allowed: this.store.calories_allowed,
    };
    for (const foodItem of foodItems) {
      toSave.calories_consumed += foodItem.calories;
    }
    return this.userId$.pipe(
      switchMap(userID => this.http.patch(`api/user/${userID}/calories`, toSave)),
      tap((data: any) => {
        this.userCaloriesWeek[6] = data;
        this.userCaloriesWeek$.next(this.userCaloriesWeek);
        this.caloriesConsumed = data.calories_consumed;
        this.caloriesConsumed$.next(this.caloriesConsumed);
      }),
    );
  }

  public saveCaloriesBurned(exerciseItems) {
    const toSave = {
      date: new Date().toISOString().split('T')[0],
      calories_burned: 0,
      calories_allowed: this.store.calories_allowed,
    };
    for (const exerciseItem of exerciseItems) {
      toSave.calories_burned += exerciseItem.calories;
    }
    return this.userId$.pipe(
      switchMap(userID => this.http.patch(`api/user/${userID}/calories`, toSave)),
      tap((data: any) => {
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
