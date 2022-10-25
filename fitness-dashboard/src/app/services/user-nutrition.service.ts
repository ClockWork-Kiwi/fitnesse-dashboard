import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {UserService} from './user.service';
import {formatDate} from '../functions/formatDate';

@Injectable({
  providedIn: 'root'
})
export class UserNutritionService implements OnDestroy {

  // Observable for when the service is destroyed
  private componentDestruction$ = new Subject();
  // Local store for user nutrition data
  private store = [];
  // Private & public observables for the data held in the local store
  private subject$ = new BehaviorSubject(this.store);
  public observable$ = this.subject$.pipe();

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {
    // When this service is initialised, get the current user id and get the nutrition items associated with that user
    this.userService.userId$.pipe(
      takeUntil(this.componentDestruction$)
    ).subscribe(userID => {
      this.getUserNutrition(userID);
    });
  }

  // Function for retrieving a list from the API of today's nutrition items associated the given user id
  public getUserNutrition(userID) {
    this.http.get(`api/nutrition/${userID}`).subscribe((data: any[]) => {
      // Once the data is returned, update local store and public observable
      this.store = data;
      this.subject$.next(this.store);
    });
  }

  // Function for saving a new nutrition item for the day against the current user
  public saveNutritionItem(item: any) {
    // Set the item's date to be today
    item.date = formatDate();
    // Get the currently logged-in user id, and send a PATCH request to the API to create a new nutrition item using the data passed into the function
    return this.userService.userId$.pipe(
      filter(userID => !!userID),
      take(1),
      switchMap(userID => this.http.patch(`api/nutrition/${userID}`, {...item})),
      tap((data: any[]) => {
        // Once the data returns, update the local store & public observable using the returned data
        this.store = data;
        this.subject$.next(this.store);
      })
    );
  }

  // Function for deleting nutrition item from the list of things the current user has eaten/drunk today
  public deleteNutritionItem(itemID: number) {
    return this.userService.userId$.pipe(
      filter(userID => !!userID),
      take(1),
      // Send a DELETE request to the API to delete the item corresponding with the given food item id
      switchMap(userID => this.http.request('delete', `api/nutrition/${userID}`, { body: { id: itemID } })),
      tap(result => {
        // When the request returns, remove the item from the local store, and update the observable to match this change
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
