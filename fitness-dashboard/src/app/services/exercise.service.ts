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

  private componentDestruction$ = new Subject();
  // Local copy of the user's exercise items for the day
  private store = [];
  // Private & public observables for sending updates on user exercise to any components listening to this observable
  private subject$ = new BehaviorSubject(this.store);
  public observable$ = this.subject$.pipe();

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {
    // When the service is initialised, wait for the user id to come in from the user service, and use it to retrieve the user's exercise items
    this.userService.userId$.pipe(
      takeUntil(this.componentDestruction$)
    ).subscribe(userID => {
      this.getUserExercise(userID);
    });
  }

  // Sends a GET request to the API to retrieve the given user's exercise data
  public getUserExercise(userID) {
    this.http.get(`api/exercise/${userID}`).subscribe((data: any[]) => {
      this.store = data;
      this.subject$.next(this.store);
    });
  }

  // Sends a PATCH request to the API to create or update a given food item against the current user
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

  // Sends a DELETE request to the API to remove the food item corresponding to the given foodItem ID
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
    // Destroy any ongoing subscriptions
    this.componentDestruction$.next();
  }
}
