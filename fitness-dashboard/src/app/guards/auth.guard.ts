import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { EMPTY, Observable} from 'rxjs';
import {UserService} from '../services/user.service';
import {catchError, map, tap} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userService.verify().pipe(
      catchError(err => {
        this.routeToLogin();
        return EMPTY;
      }),
      map(verified => {
        if (!verified) {
          this.routeToLogin();
        }
        return verified;
      })
    );
  }

  private routeToLogin() {
    this.snackBar.open(
      'Not logged in or session timed out. Please log in',
      'Dismiss',
      {duration: 10000, panelClass: 'snackbar-danger', verticalPosition: 'top', horizontalPosition: 'center'}
    );
    this.router.navigateByUrl('login');
  }

}
