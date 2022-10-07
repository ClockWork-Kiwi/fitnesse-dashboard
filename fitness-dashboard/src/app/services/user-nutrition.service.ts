import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UserNutritionService implements OnDestroy {

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
      this.getUserNutrition(userID);
    });
  }

  public getUserNutrition(userID) {
    this.http.get(`api/nutrition/${userID}`).subscribe((data: any[]) => {
      this.store = data;
      this.subject$.next(this.store);
    });
  }

  public saveNutritionItem(item: any) {
    item.date = new Date();
    return this.userService.userId$.pipe(
      filter(userID => !!userID),
      take(1),
      switchMap(userID => this.http.patch(`api/nutrition/${userID}`, {...item})),
      tap((data: any[]) => {
        this.store = data;
        this.subject$.next(this.store);
      })
    );
  }

  public deleteNutritionItem(itemID: number) {
    return this.userService.userId$.pipe(
      filter(userID => !!userID),
      take(1),
      switchMap(userID => this.http.request('delete', `api/nutrition/${userID}`, { body: { id: itemID } })),
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
