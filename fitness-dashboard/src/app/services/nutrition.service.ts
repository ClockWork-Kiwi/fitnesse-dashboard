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

  ngOnDestroy() {
    this.serviceDestruction$.next();
  }

}
