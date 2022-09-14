import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil, tap} from 'rxjs/operators';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class NutritionService implements OnDestroy {

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

  public saveNutritionItem(userID: number, item: any) {
    item.date = new Date();
    return this.http.patch(`api/nutrition/${userID}`, {...item}).pipe(
      tap(data => {
        this.store.push(data);
        this.subject$.next(this.store);
      })
    );
  }

  public deleteNutritionItem(userID: number, itemID: number) {
    return this.http.request('delete', `api/nutrition/${userID}`, { body: { id: itemID } }).pipe(
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
