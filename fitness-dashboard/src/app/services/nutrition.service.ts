import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil, tap} from 'rxjs/operators';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class NutritionService implements OnDestroy {

  private serviceDestruction$ = new Subject();
  private store = new BehaviorSubject([]);
  public observable$ = this.store.pipe(
  );

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {
    this.userService.userId$.pipe(
      takeUntil(this.serviceDestruction$)
    ).subscribe(userID => {
      this.getUserNutrition(userID);
    });
  }

  public getUserNutrition(userID) {
    this.http.get(`api/nutrition/${userID}`).subscribe((data: any[]) => {
      this.store.next(data);
    });
  }

  public saveNutritionItem(userID: number, item: any) {
    return this.http.patch(`api/nutrition/${userID}`, {...item});
  }

  public deleteNutritionItem(userID: number, itemID: number) {
    return this.http.request('delete', `api/nutrition/${userID}`, { body: { id: itemID } });
  }

  ngOnDestroy() {
    this.serviceDestruction$.next();
  }

}
