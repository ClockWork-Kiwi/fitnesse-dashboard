import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'fitness-dashboard';

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
}
