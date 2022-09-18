import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map, switchMap, takeUntil, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {

  // Hard coded uid
  public userId$ = of(1);

  private destruction$ = new Subject();

  private store = {};
  private subject$ = new BehaviorSubject(this.store);
  public observable$ = this.subject$.pipe() as Observable<any>;

  private caloriesConsumed = 0;
  public caloriesConsumed$ = new BehaviorSubject(this.caloriesConsumed);

  private caloriesBurned = 0;
  public caloriesBurned$ = new BehaviorSubject(this.caloriesBurned);

  public caloriesAllowed$ = combineLatest([
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
      this.caloriesConsumed = userCalories.calories_consumed;
      this.caloriesConsumed$.next(this.caloriesConsumed);
      this.caloriesBurned = userCalories.calories_burned;
      this.caloriesBurned$.next(this.caloriesBurned);
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
      date: new Date(),
      calories_consumed: 0,
    };
    for (const foodItem of foodItems) {
      toSave.calories_consumed += foodItem.calories;
    }
    return this.userId$.pipe(
      switchMap(userID => this.http.patch(`api/user/${userID}/calories`, toSave)),
      tap((data: any) => {
        this.caloriesConsumed = data.calories_consumed;
        this.caloriesConsumed$.next(this.caloriesConsumed);
      }),
    );
  }

  public saveCaloriesBurned(exerciseItems) {
    const toSave = {
      date: new Date(),
      calories_burned: 0,
    };
    for (const exerciseItem of exerciseItems) {
      toSave.calories_burned += exerciseItem.calories;
    }
    return this.userId$.pipe(
      switchMap(userID => this.http.patch(`api/user/${userID}/calories`, toSave)),
      tap((data: any) => {
        this.caloriesBurned = data.calories_burned;
        this.caloriesBurned$.next(this.caloriesBurned);
      }),
    );
  }

  ngOnDestroy() {
    this.destruction$.next();
  }

}
