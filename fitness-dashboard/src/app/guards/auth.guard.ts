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

  // Runs every time a user attempts to route to a non-login or register page
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Verify the current user
    return this.userService.verify().pipe(
      // If the database returns an error, route back to login
      catchError(err => {
        this.routeToLogin();
        return EMPTY;
      }),
      map(verified => {
        // If the current user isn't verified, route back to login
        if (!verified) {
          this.routeToLogin();
        }
        // Return whether the user is verified. This determines whether the desired page 'can activate'
        return verified;
      })
    );
  }

  // Function that routes the user back to the login screen, and displays an error message
  private routeToLogin() {
    this.snackBar.open(
      'Not logged in or session timed out',
      'Dismiss',
      {duration: 10000, panelClass: 'snackbar-danger', verticalPosition: 'top', horizontalPosition: 'center'}
    );
    this.router.navigateByUrl('login');
  }

}
