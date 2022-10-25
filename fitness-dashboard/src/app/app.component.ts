import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {UserService} from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  // Private & Public variables
  public title = 'fitness-dashboard';
  private componentDestruction$ = new Subject();
  public activeRoute = '';

  // Array that contains the navigation routes in the sidebar
  public routes = [
    { label: 'Dashboard', route: 'dashboard' },
    { label: 'My Info/Goals', route: 'goals' },
    { label: 'Nutrition', route: 'nutrition' },
    { label: 'Exercise', route: 'exercise' },
  ];

  constructor(
    private router: Router,
    public userService: UserService,
  ) {}

  // Navigates the app to the desired route (run when a link in the sidebar is pressed)
  public navigateToRoute(route) {
    this.router.navigateByUrl(route);
  }

  ngOnInit() {
    // Every time the user changes page, highlight the side menu item corresponding to the page they've routed to
    this.router.events.pipe(
      takeUntil(this.componentDestruction$),
      filter(event => event instanceof NavigationEnd),
    ).subscribe((e: NavigationEnd) => {
      this.activeRoute = e.url.slice(1, e.url.length);
    });
  }

  ngOnDestroy() {
    // Terminate subscriptions
    this.componentDestruction$.next(true);
  }
}
