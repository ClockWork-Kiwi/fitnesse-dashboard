import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {takeUntil} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {

  // Hard coded uid
  public userId$ = of(1);

  private destruction$ = new Subject();

  private store = {};
  private subject$ = new BehaviorSubject(this.store);
  public observable$ = this.subject$.pipe();

  constructor(
    private http: HttpClient
  ) {
    this.userId$.pipe(
      takeUntil(this.destruction$)
    ).subscribe(userID => {
      this.getUserData(userID);
    });
  }

  public getUserData(userID) {
    this.http.get(`api/user/${userID}`).subscribe(userData => {
      this.store = userData;
      this.subject$.next(this.store);
    });
  }

  ngOnDestroy() {
    this.destruction$.next();
  }

}
