import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subject} from "rxjs";
import {filter, takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public title = 'fitness-dashboard';
  private componentDestruction$ = new Subject();
  public activeRoute = '';

  public routes = [
    { label: 'Dashboard', route: 'dashboard' },
    { label: 'Goals', route: 'goals' },
    { label: 'Nutrition', route: 'nutrition' },
    { label: 'Exercise', route: 'exercise' },
  ];

  constructor(
    private router: Router,
  ) {}

  public navigateToRoute(route) {
    this.router.navigateByUrl(route);
  }

  ngOnInit() {
    this.router.events.pipe(
      takeUntil(this.componentDestruction$),
      filter(event => event instanceof NavigationEnd),
    ).subscribe((e: NavigationEnd) => {
      this.activeRoute = e.url.slice(1, e.url.length);
    });
  }

  ngOnDestroy() {
    this.componentDestruction$.next(true);
  }
}
