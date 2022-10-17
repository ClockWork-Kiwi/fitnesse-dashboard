import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {UserService} from './user.service';
import {filter, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {formatDate} from '../functions/formatDate';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService implements OnDestroy {

  private destruction$ = new Subject();
  private store = [];
  private subject$ = new BehaviorSubject(this.store);
  // In case we want the data transformed or filtered before returning
  public observable$ = this.subject$.pipe();

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

  public saveExerciseItem(item: any) {
    item.date = formatDate();
    return this.userService.userId$.pipe(
      filter(userID => !!userID),
      take(1),
      switchMap(userID => this.http.patch(`api/exercise/${userID}`, {...item})),
      tap((data: any[]) => {
        this.store = data;
        this.subject$.next(this.store);
      })
    );
  }

  public deleteExerciseItem(itemID: number) {
    return this.userService.userId$.pipe(
      filter(userID => !!userID),
      take(1),
      switchMap(userID => this.http.request('delete', `api/exercise/${userID}`, { body: { id: itemID } })),
      tap(result => {
        const removeIndex = this.store.findIndex(e => e.id === itemID);
        if (removeIndex > -1) {
          this.store.splice(removeIndex, 1);
          this.subject$.next(this.store);
        }
      })
    );
  }


  ngOnDestroy() {
    this.destruction$.next();
  }
}
