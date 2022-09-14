import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {UserService} from './user.service';
import {takeUntil, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService implements OnDestroy {

  private destruction$ = new Subject();
  private store = [];
  private subject$ = new BehaviorSubject(this.store);
  // In case we want the data transformed or filtered before returning
  public observable$ = this.subject$.pipe(
    tap(data => { console.log(data); })
  );

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {
    this.userService.userId$.pipe(
      takeUntil(this.destruction$)
    ).subscribe(userID => {
      this.getUserExercise(userID);
    });
  }

  public getUserExercise(userID) {
    this.http.get(`api/exercise/${userID}`).subscribe((data: any[]) => {
      this.store = data;
      this.subject$.next(this.store);
    });
  }

  ngOnDestroy() {
    this.destruction$.next();
  }
}
